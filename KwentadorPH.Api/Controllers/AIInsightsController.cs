using KwentadorPH.Api.Data;
using KwentadorPH.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIInsightsController : ControllerBase
{
    private readonly KwentadorDbContext _context;
    private readonly OpenRouterInsightsService _aiService;

    public AIInsightsController(
        KwentadorDbContext context,
        OpenRouterInsightsService aiService)
    {
        _context = context;
        _aiService = aiService;
    }

    [HttpGet]
    public async Task<IActionResult> GetInsight()
    {
        var now = DateTime.UtcNow;

        var transactions = await _context.Transactions
            .Where(t =>
                t.TransactionDate.Year == now.Year &&
                t.TransactionDate.Month == now.Month)
            .ToListAsync();

        var monthlyIncome = transactions
            .Where(t => t.TransactionType == "Income")
            .Sum(t => t.Amount);

        var monthlyExpenses = transactions
            .Where(t => t.TransactionType == "Expense")
            .Sum(t => t.Amount);

        var netCashFlow =
            monthlyIncome - monthlyExpenses;

        var topCategory = transactions
            .Where(t => t.TransactionType == "Expense")
            .GroupBy(t => t.Category)
            .Select(g => new
            {
                Category = g.Key,
                Amount = g.Sum(x => x.Amount)
            })
            .OrderByDescending(x => x.Amount)
            .FirstOrDefault();

        string insight;

        try
        {
            insight = await _aiService.GenerateInsightAsync(
                monthlyIncome,
                monthlyExpenses,
                netCashFlow,
                topCategory?.Category ?? "None",
                topCategory?.Amount ?? 0
            );
        }
       catch (Exception ex)
            {
                Console.WriteLine("===== AI INSIGHTS ERROR =====");
                Console.WriteLine(ex.ToString());
                Console.WriteLine("=============================");

                insight =
                    "AI Coach is temporarily unavailable. " +
                    "Your financial summary is still available below.";
            }
        var spendingPercentage = monthlyIncome > 0
        ? Math.Round(
            (topCategory?.Amount ?? 0) / monthlyIncome * 100,
            1
        )
        : 0;

        var spendingAlert = topCategory == null
        ? "No expense data available yet."
        : $"{topCategory.Category} is your highest spending category " +
        $"at ₱{topCategory.Amount:N0}, equivalent to " +
        $"{spendingPercentage}% of your monthly income.";

        var suggestedSavings = netCashFlow > 0
        ? Math.Round(netCashFlow * 0.30m, 2)
        : 0;

        var savingsOpportunity = suggestedSavings > 0
        ? $"You currently have ₱{netCashFlow:N0} available cash flow. " +
        $"Setting aside around ₱{suggestedSavings:N0} monthly can help grow your savings while keeping room for other expenses."
        : "Your current cash flow is tight. Focus on reducing expenses before increasing savings.";

        return Ok(new
        {
            monthlyIncome,
            monthlyExpenses,
            netCashFlow,
            topCategory = topCategory?.Category ?? "None",
            topCategoryAmount = topCategory?.Amount ?? 0,
            insight,
            spendingPercentage,
            spendingAlert,
            suggestedSavings,
            savingsOpportunity
        });
    }
}