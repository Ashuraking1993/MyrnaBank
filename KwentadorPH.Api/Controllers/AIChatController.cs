using KwentadorPH.Api.Models.Requests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KwentadorPH.Api.Data;
using KwentadorPH.Api.Services;
using System.Text.Json;
namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AIChatController : ControllerBase
{
    private readonly KwentadorDbContext _context;
    private readonly OpenRouterAIChatService _aiChatService;

   public AIChatController(
    KwentadorDbContext context,
    OpenRouterAIChatService aiChatService)
{
    _context = context;
    _aiChatService = aiChatService;
}

    [HttpPost]
    public async Task<IActionResult> Chat(
        [FromBody] AIChatRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new
            {
                message = "Message is required."
            });
        }

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

        var accounts = await _context.FinancialAccounts
            .ToListAsync();

        var totalBalance = accounts.Sum(a => a.CurrentBalance);

        var goals = await _context.FinancialGoals
            .ToListAsync();
        
        var goalBreakdowns = goals.Select(g =>
        {
            var remainingAmount =
                Math.Max(0, g.TargetAmount - g.CurrentAmount);

            var monthsRemaining =
                Math.Max(
                    1,
                    ((g.TargetDate.Year - now.Year) * 12) +
                    g.TargetDate.Month - now.Month
                );

            var requiredMonthlySavings =
                Math.Round(
                    remainingAmount / monthsRemaining,
                    2
                );

            var monthlySurplus =
                Math.Round(
                    netCashFlow - requiredMonthlySavings,
                    2
                );

            return new
            {
                g.Id,
                g.Name,
                g.TargetAmount,
                g.CurrentAmount,
                remainingAmount,
                g.TargetDate,
                monthsRemaining,
                requiredMonthlySavings,
                monthlySurplus,

                feasibility = monthlySurplus >= 0
                    ? "Achievable"
                    : "Needs Adjustment"
            };
        }).ToList();

        var aiContext = new
            {
                monthlyIncome,
                monthlyExpenses,
                netCashFlow,
                totalBalance,

                topCategory =
                    topCategory?.Category ?? "None",

                topCategoryAmount =
                    topCategory?.Amount ?? 0,

                goals = goalBreakdowns
            };

            var financialContext =
                JsonSerializer.Serialize(aiContext);

            string aiResponse;

            try
            {
                aiResponse =
                    await _aiChatService.GenerateResponseAsync(
                        request.Message,
                        financialContext
                    );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"AI Chat unavailable: {ex.Message}"
                );

                aiResponse =
                    "The AI Coach is temporarily unavailable. " +
                    "Your financial breakdown is still available.";
            }

        return Ok(new
        {
            userMessage = request.Message,

            aiResponse,

            financialContext = new
            {
                monthlyIncome,
                monthlyExpenses,
                netCashFlow,
                totalBalance,

                topCategory =
                    topCategory?.Category ?? "None",

                topCategoryAmount =
                    topCategory?.Amount ?? 0
            },

           goals = goalBreakdowns
        });
    }
}