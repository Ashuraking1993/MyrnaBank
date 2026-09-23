using KwentadorPH.Api.Data;
using KwentadorPH.Api.DTOs;
using KwentadorPH.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinancialAccountsController : ControllerBase
{
    private readonly KwentadorDbContext _context;

    public FinancialAccountsController(KwentadorDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var accounts = await _context.FinancialAccounts
            .Include(x => x.FinancialInstitution)
            .OrderBy(x => x.FinancialInstitution.Name)
            .Select(x => new
            {
                x.Id,
                x.AccountName,
                x.MaskedAccountNumber,
                x.AccountType,
                x.CurrentBalance,
                x.Currency,
                x.ConnectionType,
                x.IsConnected,
                x.LastSyncedAt,
                Institution = new
                {
                    x.FinancialInstitution.Id,
                    x.FinancialInstitution.Name,
                    x.FinancialInstitution.ShortName,
                    x.FinancialInstitution.InstitutionType
                }
            })
            .ToListAsync();

        return Ok(accounts);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var accounts = await _context.FinancialAccounts
            .Include(x => x.FinancialInstitution)
            .ToListAsync();

        return Ok(new
        {
            totalBalance = accounts.Sum(x => x.CurrentBalance),
            totalAccounts = accounts.Count,
            connectedAccounts = accounts.Count(x => x.IsConnected),
            currency = "PHP"
        });
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateFinancialAccountDto dto)
    {
        var institution = await _context.FinancialInstitutions
            .FindAsync(dto.FinancialInstitutionId);

        if (institution is null)
            return BadRequest("Financial institution not found.");

        var account = new FinancialAccount
        {
            FinancialInstitutionId = dto.FinancialInstitutionId,
            AccountName = dto.AccountName,
            MaskedAccountNumber = dto.MaskedAccountNumber,
            AccountType = dto.AccountType,
            CurrentBalance = dto.CurrentBalance,
            Currency = "PHP",
            ConnectionType = dto.ConnectionType,
            IsConnected = dto.ConnectionType != "Manual",
            LastSyncedAt = dto.ConnectionType != "Manual"
                ? DateTime.UtcNow
                : null
        };

        _context.FinancialAccounts.Add(account);
        await _context.SaveChangesAsync();

                return Ok(new
        {
            account.Id,
            account.FinancialInstitutionId,
            account.AccountName,
            account.MaskedAccountNumber,
            account.AccountType,
            account.CurrentBalance,
            account.Currency,
            account.ConnectionType,
            account.IsConnected,
            account.LastSyncedAt
        });
    }

        [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var account = await _context.FinancialAccounts
            .FirstOrDefaultAsync(x => x.Id == id);

        if (account is null)
            return NotFound(new
            {
                message = "Financial account not found."
            });

        _context.FinancialAccounts.Remove(account);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Financial account removed successfully.",
            accountId = id
        });
    }
}