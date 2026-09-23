using KwentadorPH.Api.Data;
using KwentadorPH.Api.DTOs;
using KwentadorPH.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly KwentadorDbContext _context;

    public TransactionsController(KwentadorDbContext context)
    {
        _context = context;
    }

    // GET: api/Transactions
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var transactions = await _context.Transactions
            .Include(x => x.FinancialAccount)
            .ThenInclude(x => x.FinancialInstitution)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.Description,
                x.MerchantName,
                x.Amount,
                x.TransactionType,
                x.Category,
                x.IsAiCategorized,
                x.AiConfidenceScore,
                x.TransactionDate,
                x.CreatedAt,

                Account = new
                {
                    x.FinancialAccount.Id,
                    x.FinancialAccount.AccountName,

                    Institution =
                        x.FinancialAccount.FinancialInstitution.ShortName
                }
            })
            .ToListAsync();

        return Ok(transactions);
    }

    // POST: api/Transactions
    [HttpPost]
    public async Task<IActionResult> Create(CreateTransactionDto dto)
    {
        if (dto.Amount <= 0)
            return BadRequest("Amount must be greater than zero.");

        var type = dto.TransactionType.Trim();

        if (!type.Equals("Income", StringComparison.OrdinalIgnoreCase) &&
            !type.Equals("Expense", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(
                "TransactionType must be Income or Expense.");
        }

        var account = await _context.FinancialAccounts
            .FindAsync(dto.FinancialAccountId);

        if (account is null)
            return BadRequest("Financial account not found.");

        if (type.Equals("Expense", StringComparison.OrdinalIgnoreCase) &&
            account.CurrentBalance < dto.Amount)
        {
            return BadRequest("Insufficient account balance.");
        }

        var normalizedType =
            type.Equals("Income", StringComparison.OrdinalIgnoreCase)
                ? "Income"
                : "Expense";

        var transaction = new Transaction
        {
            FinancialAccountId = account.Id,
            Description = dto.Description,
            MerchantName = dto.MerchantName,
            Amount = dto.Amount,
            TransactionType = normalizedType,
            Category = dto.Category,
            TransactionDate = dto.TransactionDate.HasValue
            ? DateTime.SpecifyKind(dto.TransactionDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow
        };

        if (normalizedType == "Income")
        {
            account.CurrentBalance += dto.Amount;
        }
        else
        {
            account.CurrentBalance -= dto.Amount;
        }

        _context.Transactions.Add(transaction);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            transaction.Id,
            transaction.Description,
            transaction.Amount,
            transaction.TransactionType,
            transaction.Category,

            newBalance = account.CurrentBalance
        });
    }



    [HttpPost("transfer")]
public async Task<IActionResult> Transfer(TransferMoneyDto dto)
{
    if (dto.Amount <= 0)
        return BadRequest("Amount must be greater than zero.");

    if (dto.FromAccountId == dto.ToAccountId)
        return BadRequest("Source and destination accounts cannot be the same.");

    var fromAccount = await _context.FinancialAccounts
        .Include(x => x.FinancialInstitution)
        .FirstOrDefaultAsync(x => x.Id == dto.FromAccountId);

    var toAccount = await _context.FinancialAccounts
        .Include(x => x.FinancialInstitution)
        .FirstOrDefaultAsync(x => x.Id == dto.ToAccountId);

    if (fromAccount is null)
        return BadRequest("Source account not found.");

    if (toAccount is null)
        return BadRequest("Destination account not found.");

    if (fromAccount.CurrentBalance < dto.Amount)
        return BadRequest("Insufficient source account balance.");

    await using var dbTransaction =
        await _context.Database.BeginTransactionAsync();

    try
    {
        fromAccount.CurrentBalance -= dto.Amount;
        toAccount.CurrentBalance += dto.Amount;

        var transferOut = new Transaction
        {
            FinancialAccountId = fromAccount.Id,
            Description = dto.Description
                ?? $"Transfer to {toAccount.AccountName}",
            Amount = dto.Amount,
            TransactionType = "Transfer",
            Category = "Internal Transfer",
            TransactionDate = DateTime.UtcNow
        };

        var transferIn = new Transaction
        {
            FinancialAccountId = toAccount.Id,
            Description = dto.Description
                ?? $"Transfer from {fromAccount.AccountName}",
            Amount = dto.Amount,
            TransactionType = "Transfer",
            Category = "Internal Transfer",
            TransactionDate = DateTime.UtcNow
        };

        _context.Transactions.AddRange(transferOut, transferIn);

        await _context.SaveChangesAsync();
        await dbTransaction.CommitAsync();

        return Ok(new
        {
            amount = dto.Amount,

            fromAccount = new
            {
                fromAccount.AccountName,
                institution = fromAccount.FinancialInstitution.ShortName,
                newBalance = fromAccount.CurrentBalance
            },

            toAccount = new
            {
                toAccount.AccountName,
                institution = toAccount.FinancialInstitution.ShortName,
                newBalance = toAccount.CurrentBalance
            },

            transactionType = "Transfer"
        });
    }
    catch
    {
        await dbTransaction.RollbackAsync();
        throw;
    }
}
}