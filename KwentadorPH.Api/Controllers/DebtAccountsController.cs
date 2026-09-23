using KwentadorPH.Api.Data;
using KwentadorPH.Api.DTOs;
using KwentadorPH.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DebtAccountsController : ControllerBase
{
    private readonly KwentadorDbContext _context;

    public DebtAccountsController(KwentadorDbContext context)
    {
        _context = context;
    }

    // GET: api/DebtAccounts
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var debts = await _context.DebtAccounts
            .Include(d => d.Payments)
            .Where(d => d.IsActive)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return Ok(debts);
    }

    // GET: api/DebtAccounts/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var debt = await _context.DebtAccounts
            .Include(d => d.Payments)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (debt == null)
            return NotFound();

        return Ok(debt);
    }

    // POST: api/DebtAccounts
    [HttpPost]
    public async Task<IActionResult> Create(CreateDebtAccountDto dto)
    {
        var debt = new DebtAccount
        {
            Name = dto.Name,
            DebtType = dto.DebtType,
            OriginalBalance = dto.OriginalBalance,
            CurrentBalance = dto.CurrentBalance,
            InterestRate = dto.InterestRate,
            MinimumPayment = dto.MinimumPayment,
            DueDate = dto.DueDate
        };

        _context.DebtAccounts.Add(debt);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = debt.Id },
            debt);
    }

    // POST: api/DebtAccounts/{id}/payments
    [HttpPost("{id:guid}/payments")]
    public async Task<IActionResult> AddPayment(
        Guid id,
        AddDebtPaymentDto dto)
    {
        var debt = await _context.DebtAccounts.FindAsync(id);

        if (debt == null)
            return NotFound();

        if (dto.Amount <= 0)
            return BadRequest("Payment amount must be greater than zero.");

        if (dto.Amount > debt.CurrentBalance)
            return BadRequest("Payment cannot exceed the remaining balance.");

        var payment = new DebtPayment
        {
            DebtAccountId = debt.Id,
            Amount = dto.Amount,
            Notes = dto.Notes
        };

        debt.CurrentBalance -= dto.Amount;

        if (debt.CurrentBalance <= 0)
        {
            debt.CurrentBalance = 0;
            debt.IsActive = false;
        }

        _context.DebtPayments.Add(payment);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            debt.Id,
            debt.Name,
            payment.Amount,
            debt.CurrentBalance,
            debt.IsActive,
            payment.PaymentDate
        });
    }
}