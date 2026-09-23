using KwentadorPH.Api.Data;
using KwentadorPH.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DebtStrategiesController : ControllerBase
{
    private readonly KwentadorDbContext _context;
    private readonly DebtStrategyService _strategyService;

    private readonly OpenRouterDebtCoachService _debtCoachService;

    public DebtStrategiesController(
    KwentadorDbContext context,
    DebtStrategyService strategyService,
    OpenRouterDebtCoachService debtCoachService)
{
    _context = context;
    _strategyService = strategyService;
    _debtCoachService = debtCoachService;
}

    [HttpGet("compare")]
    public async Task<IActionResult> Compare(
        [FromQuery] decimal extraMonthlyPayment = 0)
    {
        var debts = await _context.DebtAccounts
            .Where(d => d.IsActive)
            .ToListAsync();

        var snowball = _strategyService.Simulate(
            debts,
            "snowball",
            extraMonthlyPayment);

        var avalanche = _strategyService.Simulate(
            debts,
            "avalanche",
            extraMonthlyPayment);


        var cashFlow = _strategyService.Simulate(
            debts,
            "cashflow",
            extraMonthlyPayment);

        var hybrid = _strategyService.Simulate(
            debts,
            "hybrid",
            extraMonthlyPayment);

        return Ok(new
        {
            TotalDebt = debts.Sum(d => d.CurrentBalance),
            TotalMinimumPayments = debts.Sum(d => d.MinimumPayment),
            ExtraMonthlyPayment = extraMonthlyPayment,

            Snowball = snowball,
            Avalanche = avalanche,
            CashFlow = cashFlow,
            Hybrid = hybrid
        });

        
    }

   
[HttpGet("recommend")]
public async Task<IActionResult> Recommend(
    [FromQuery] decimal extraMonthlyPayment = 0)
{
    if (extraMonthlyPayment < 0)
        return BadRequest(
            "Extra monthly payment cannot be negative.");

    var debts = await _context.DebtAccounts
        .Where(d => d.IsActive && d.CurrentBalance > 0)
        .ToListAsync();

    if (!debts.Any())
        return BadRequest("No active debts found.");

    // ==========================================
    // RUN ALL STRATEGIES
    // ==========================================

    var snowball = _strategyService.Simulate(
        debts,
        "snowball",
        extraMonthlyPayment);

    var avalanche = _strategyService.Simulate(
        debts,
        "avalanche",
        extraMonthlyPayment);

    var cashFlow = _strategyService.Simulate(
        debts,
        "cashflow",
        extraMonthlyPayment);

    var hybrid = _strategyService.Simulate(
        debts,
        "hybrid",
        extraMonthlyPayment);

    var strategies = new[]
    {
        snowball,
        avalanche,
        cashFlow,
        hybrid
    };

    // ==========================================
    // BASELINE
    //
    // Snowball is used only as a comparison
    // baseline for savings.
    // ==========================================

    var baseline = snowball;

    // ==========================================
    // RECOMMENDATION
    //
    // 1. Shortest payoff duration
    // 2. Lowest total interest
    // ==========================================

    var recommended = strategies
        .OrderBy(s => s.MonthsToDebtFree)
        .ThenBy(s => s.TotalInterestPaid)
        .First();

    var interestSaved =
        baseline.TotalInterestPaid
        - recommended.TotalInterestPaid;

    var monthsSaved =
        baseline.MonthsToDebtFree
        - recommended.MonthsToDebtFree;

    // ==========================================
    // BUILD DETERMINISTIC REASON
    // ==========================================

    string reason;

    if (recommended.Strategy == "Snowball")
    {
        reason =
            "Snowball currently provides the strongest payoff result " +
            "for your debt profile while prioritizing smaller balances.";
    }
    else if (monthsSaved > 0 && interestSaved > 0)
    {
        reason =
            $"{recommended.Strategy} could make you debt-free " +
            $"{monthsSaved} month(s) earlier and save " +
            $"₱{interestSaved:N2} in interest compared with Snowball.";
    }
    else if (interestSaved > 0)
    {
        reason =
            $"{recommended.Strategy} could save " +
            $"₱{interestSaved:N2} in interest with the same " +
            $"estimated payoff period as Snowball.";
    }
    else if (monthsSaved > 0)
    {
        reason =
            $"{recommended.Strategy} could make you debt-free " +
            $"{monthsSaved} month(s) earlier compared with Snowball.";
    }
    else
    {
        reason =
            $"{recommended.Strategy} provides the strongest calculated " +
            $"payoff result for the current debt profile.";
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return Ok(new
    {
        RecommendedStrategy =
            recommended.Strategy,

        Reason =
            reason,

        TotalDebt =
            debts.Sum(d => d.CurrentBalance),

        MonthlyDebtBudget =
            debts.Sum(d => d.MinimumPayment)
            + extraMonthlyPayment,

        ExtraMonthlyPayment =
            extraMonthlyPayment,

        InterestSaved =
            Math.Round(
                interestSaved,
                2,
                MidpointRounding.AwayFromZero),

        MonthsSaved =
            monthsSaved,

        MonthsToDebtFree =
            recommended.MonthsToDebtFree,

        EstimatedDebtFreeDate =
            recommended.EstimatedDebtFreeDate,

        TotalInterestPaid =
            recommended.TotalInterestPaid,

        TotalAmountPaid =
            recommended.TotalAmountPaid,

        PayoffOrder =
            recommended.PayoffOrder,

        Strategies = strategies.Select(s => new
        {
            s.Strategy,
            s.MonthsToDebtFree,
            s.TotalInterestPaid,
            s.TotalAmountPaid,
            s.EstimatedDebtFreeDate,
            s.PayoffOrder
        })
    });
}

[HttpGet("what-if")]
public async Task<IActionResult> WhatIf(
    [FromQuery] decimal extraMonthlyPayment = 0)
{
    if (extraMonthlyPayment < 0)
        return BadRequest("Extra monthly payment cannot be negative.");

    var debts = await _context.DebtAccounts
        .Where(d => d.IsActive)
        .ToListAsync();

    if (!debts.Any())
        return BadRequest("No active debts found.");

    // Baseline: Avalanche with no extra payment
    var baseline = _strategyService.Simulate(
        debts,
        "avalanche",
        0);

    // Scenario: Avalanche with user's extra payment
    var scenario = _strategyService.Simulate(
        debts,
        "avalanche",
        extraMonthlyPayment);

    var interestSaved =
        baseline.TotalInterestPaid - scenario.TotalInterestPaid;

    var monthsSaved =
        baseline.MonthsToDebtFree - scenario.MonthsToDebtFree;

    return Ok(new
    {
        ExtraMonthlyPayment = extraMonthlyPayment,

        Baseline = new
        {
            baseline.MonthsToDebtFree,
            baseline.TotalInterestPaid,
            baseline.EstimatedDebtFreeDate
        },

        Scenario = new
        {
            scenario.MonthsToDebtFree,
            scenario.TotalInterestPaid,
            scenario.EstimatedDebtFreeDate
        },

        InterestSaved = Math.Round(interestSaved, 2),
        MonthsSaved = monthsSaved,

        Message = extraMonthlyPayment > 0
            ? $"Adding ₱{extraMonthlyPayment:N2} per month could make you debt-free {monthsSaved} month(s) earlier and save ₱{interestSaved:N2} in interest."
            : "Increase your extra monthly payment to see potential savings."
    });
}

[HttpGet("ai-coach")]
public async Task<IActionResult> GetAICoach(
    [FromQuery] decimal extraMonthlyPayment = 3000)
{
    if (extraMonthlyPayment < 0)
        return BadRequest(
            "Extra monthly payment cannot be negative.");

    var debts = await _context.DebtAccounts
        .Where(d => d.IsActive && d.CurrentBalance > 0)
        .ToListAsync();

    if (!debts.Any())
        return BadRequest("No active debts found.");

    // Run all deterministic strategies
    var strategies = new[]
    {
        _strategyService.Simulate(
            debts,
            "snowball",
            extraMonthlyPayment),

        _strategyService.Simulate(
            debts,
            "avalanche",
            extraMonthlyPayment),

        _strategyService.Simulate(
            debts,
            "cashflow",
            extraMonthlyPayment),

        _strategyService.Simulate(
            debts,
            "hybrid",
            extraMonthlyPayment)
    };

    // Same deterministic recommendation rule:
    // shortest duration, then lowest interest
    var recommended = strategies
        .OrderBy(s => s.MonthsToDebtFree)
        .ThenBy(s => s.TotalInterestPaid)
        .First();

    var snowball = strategies
        .First(s => s.Strategy == "Snowball");

    var interestSaved =
        Math.Round(
            snowball.TotalInterestPaid -
            recommended.TotalInterestPaid,
            2,
            MidpointRounding.AwayFromZero
        );

    // AI only explains the calculated result
  string coachMessage;
bool aiGenerated = true;

try
{
    coachMessage =
        await _debtCoachService.GenerateCoachAdviceAsync(
            debts,
            recommended,
            extraMonthlyPayment,
            interestSaved
        );
}
catch (Exception ex)
{
    Console.WriteLine(
        $"Debt Coach AI unavailable: {ex.Message}"
    );

    aiGenerated = false;

    coachMessage =
        $"{recommended.Strategy} is the calculated strategy " +
        $"for your current debt profile. " +
        $"At the current payment plan, you could become debt-free " +
        $"in {recommended.MonthsToDebtFree} months";

    if (interestSaved > 0)
    {
        coachMessage +=
            $" while saving approximately ₱{interestSaved:N2} " +
            $"in projected interest compared with Snowball.";
    }
    else
    {
        coachMessage += ".";
    }
}

   return Ok(new
{
    RecommendedStrategy = recommended.Strategy,

    CoachMessage = coachMessage,

    AIGenerated = aiGenerated,

    TotalDebt = debts.Sum(d => d.CurrentBalance),

    MonthlyDebtBudget =
        debts.Sum(d => d.MinimumPayment)
        + extraMonthlyPayment,

    ExtraMonthlyPayment = extraMonthlyPayment,

    MonthsToDebtFree =
        recommended.MonthsToDebtFree,

    EstimatedDebtFreeDate =
        recommended.EstimatedDebtFreeDate,

    TotalInterestPaid =
        recommended.TotalInterestPaid,

    InterestSaved = interestSaved,

    PayoffOrder =
        recommended.PayoffOrder
});
}

}