using KwentadorPH.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KwentadorPH.Api.Services;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly KwentadorDbContext _context;
    private readonly FinancialHealthService _healthService;

    public DashboardController(
        KwentadorDbContext context,
        FinancialHealthService healthService)
    {
        _context = context;
        _healthService = healthService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var now = DateTime.UtcNow;

        var startOfMonth = new DateTime(
            now.Year,
            now.Month,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc);

        // -------------------------
        // ACCOUNT BALANCES
        // -------------------------

        var accounts = await _context.FinancialAccounts
            .Include(x => x.FinancialInstitution)
            .ToListAsync();

        var totalBalance = accounts.Sum(x => x.CurrentBalance);

        // -------------------------
        // CURRENT MONTH TRANSACTIONS
        // -------------------------

        var monthlyTransactions = await _context.Transactions
            .Where(x => x.TransactionDate >= startOfMonth)
            .ToListAsync();

        // Internal transfers are intentionally excluded.
        var monthlyIncome = monthlyTransactions
            .Where(x => x.TransactionType == "Income")
            .Sum(x => x.Amount);

        var monthlyExpenses = monthlyTransactions
            .Where(x => x.TransactionType == "Expense")
            .Sum(x => x.Amount);

        var netCashFlow = monthlyIncome - monthlyExpenses;

        decimal savingsRate = 0;

        if (monthlyIncome > 0)
        {
            savingsRate =
                (netCashFlow / monthlyIncome) * 100;
        }

        // -------------------------
        // SPENDING BY CATEGORY
        // -------------------------

        var spendingByCategory = monthlyTransactions
            .Where(x => x.TransactionType == "Expense")
            .GroupBy(x => x.Category)
            .Select(x => new
            {
                category = x.Key,
                amount = x.Sum(t => t.Amount)
            })
            .OrderByDescending(x => x.amount)
            .ToList();

        // -------------------------
        // RECENT TRANSACTIONS
        // -------------------------

        var recentTransactions = await _context.Transactions
            .Include(x => x.FinancialAccount)
            .ThenInclude(x => x.FinancialInstitution)
            .OrderByDescending(x => x.TransactionDate)
            .Take(5)
            .Select(x => new
            {
                x.Id,
                x.Description,
                x.MerchantName,
                x.Amount,
                x.TransactionType,
                x.Category,
                x.TransactionDate,

                account = x.FinancialAccount.AccountName,

                institution =
                    x.FinancialAccount
                        .FinancialInstitution
                        .ShortName
            })
            .ToListAsync();

        // -------------------------
        // ACCOUNT CARDS
        // -------------------------

        var accountBalances = accounts
            .Select(x => new
            {
                x.Id,
                institution = x.FinancialInstitution.ShortName,
                x.AccountName,
                x.AccountType,
                x.CurrentBalance,
                x.Currency,
                x.IsConnected
            })
            .OrderByDescending(x => x.CurrentBalance)
            .ToList();

            var financialHealth = _healthService.Calculate(
            monthlyIncome,
            monthlyExpenses,
            totalBalance
                    );

           return Ok(new
            {
                totalBalance,
                monthlyIncome,
                monthlyExpenses,
                netCashFlow,

                savingsRate = Math.Round(savingsRate, 2),

                financialHealth,

                totalAccounts = accounts.Count,

                spendingByCategory,
                accountBalances,
                recentTransactions
            });
    }
}