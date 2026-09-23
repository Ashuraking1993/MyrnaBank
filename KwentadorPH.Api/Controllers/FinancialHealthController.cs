using KwentadorPH.Api.Data;
using KwentadorPH.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinancialHealthController : ControllerBase
{
    private readonly KwentadorDbContext _context;

    public FinancialHealthController(
        KwentadorDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<FinancialHealthDto>> Get()
    {
        var now = DateTime.UtcNow;

        var monthStart = new DateTime(
            now.Year,
            now.Month,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc);

        // TOTAL BALANCE
        var totalBalance = await _context.FinancialAccounts
            .SumAsync(a => a.CurrentBalance);

        // CURRENT MONTH TRANSACTIONS
        var transactions = await _context.Transactions
            .Where(t => t.CreatedAt >= monthStart)
            .ToListAsync();

        var monthlyIncome = transactions
            .Where(t =>
                t.TransactionType.ToLower() == "income")
            .Sum(t => t.Amount);

        var monthlyExpenses = transactions
            .Where(t =>
                t.TransactionType.ToLower() == "expense")
            .Sum(t => t.Amount);

        // ACTIVE DEBT MINIMUM PAYMENTS
        var monthlyDebtPayments =
            await _context.DebtAccounts
                .Where(d =>
                    d.IsActive &&
                    d.CurrentBalance > 0)
                .SumAsync(d => d.MinimumPayment);

        // RATIOS
        decimal savingsRate = 0;

        if (monthlyIncome > 0)
        {
            savingsRate =
                ((monthlyIncome - monthlyExpenses)
                    / monthlyIncome) * 100;
        }

        decimal expenseRatio = 0;

        if (monthlyIncome > 0)
        {
            expenseRatio =
                (monthlyExpenses / monthlyIncome) * 100;
        }

        decimal monthsOfExpenses = 0;

        if (monthlyExpenses > 0)
        {
            monthsOfExpenses =
                totalBalance / monthlyExpenses;
        }

        decimal debtPaymentRatio = 0;

        if (monthlyIncome > 0)
        {
            debtPaymentRatio =
                (monthlyDebtPayments / monthlyIncome) * 100;
        }

        // -----------------------------
        // FINANCIAL HEALTH SCORE
        // -----------------------------

        var score = 0;

        // Savings Rate = max 35 points
        if (savingsRate >= 30)
            score += 35;
        else if (savingsRate >= 20)
            score += 30;
        else if (savingsRate >= 10)
            score += 20;
        else if (savingsRate > 0)
            score += 10;

        // Expense Ratio = max 25 points
        if (expenseRatio <= 50)
            score += 25;
        else if (expenseRatio <= 70)
            score += 18;
        else if (expenseRatio <= 90)
            score += 10;

        // Emergency Buffer = max 25 points
        if (monthsOfExpenses >= 6)
            score += 25;
        else if (monthsOfExpenses >= 3)
            score += 18;
        else if (monthsOfExpenses >= 1)
            score += 10;

        // Debt Payment Ratio = max 15 points
        if (debtPaymentRatio <= 10)
            score += 15;
        else if (debtPaymentRatio <= 20)
            score += 12;
        else if (debtPaymentRatio <= 35)
            score += 7;

        var status = score switch
        {
            >= 85 => "Excellent",
            >= 70 => "Good",
            >= 50 => "Fair",
            _ => "Needs Attention"
        };

        return Ok(new FinancialHealthDto
        {
            Score = score,
            Status = status,

            TotalBalance =
                Math.Round(totalBalance, 2),

            MonthlyIncome =
                Math.Round(monthlyIncome, 2),

            MonthlyExpenses =
                Math.Round(monthlyExpenses, 2),

            SavingsRate =
                Math.Round(savingsRate, 2),

            ExpenseRatio =
                Math.Round(expenseRatio, 2),

            MonthsOfExpenses =
                Math.Round(monthsOfExpenses, 2),

            MonthlyDebtPayments =
                Math.Round(monthlyDebtPayments, 2),

            DebtPaymentRatio =
                Math.Round(debtPaymentRatio, 2)
        });
    }
}