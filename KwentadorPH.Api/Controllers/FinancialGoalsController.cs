using KwentadorPH.Api.Data;
using KwentadorPH.Api.DTOs;
using KwentadorPH.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinancialGoalsController : ControllerBase
{
    private readonly KwentadorDbContext _context;

    public FinancialGoalsController(KwentadorDbContext context)
    {
        _context = context;
    }

    // GET: api/FinancialGoals
    [HttpGet]
    public async Task<IActionResult> GetAll()
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

            var monthlyIncome = await _context.Transactions
                .Where(x =>
                    x.TransactionDate >= startOfMonth &&
                    x.TransactionType == "Income")
                .SumAsync(x => (decimal?)x.Amount) ?? 0;

            var monthlyExpenses = await _context.Transactions
                .Where(x =>
                    x.TransactionDate >= startOfMonth &&
                    x.TransactionType == "Expense")
                .SumAsync(x => (decimal?)x.Amount) ?? 0;

            var availableCashFlow =
        monthlyIncome - monthlyExpenses;


        var goals = await _context.FinancialGoals
            .OrderBy(x => x.TargetDate)
            .ToListAsync();

        var result = goals.Select(goal =>
        {   

            
            var remainingAmount =
                Math.Max(0, goal.TargetAmount - goal.CurrentAmount);

            var progressPercentage =
                goal.TargetAmount > 0
                    ? (goal.CurrentAmount / goal.TargetAmount) * 100
                    : 0;

            progressPercentage =
                Math.Min(progressPercentage, 100);

            var monthsRemaining =
                CalculateMonthsRemaining(
                    DateTime.UtcNow,
                    goal.TargetDate);

            var requiredMonthlySavings =
                monthsRemaining > 0
                    ? remainingAmount / monthsRemaining
                    : remainingAmount;


            var monthlyDifference =
                availableCashFlow - requiredMonthlySavings;

            var feasibilityStatus =
                availableCashFlow >= requiredMonthlySavings
                    ? "Achievable"
                    : "At Risk";


            return new
            {
                goal.Id,
                goal.Name,
                goal.Category,
                goal.TargetAmount,
                goal.CurrentAmount,

                remainingAmount =
                    Math.Round(remainingAmount, 2),

                progressPercentage =
                    Math.Round(progressPercentage, 2),

                goal.TargetDate,

                monthsRemaining,

                requiredMonthlySavings =
                    Math.Round(requiredMonthlySavings, 2),


                availableMonthlyCashFlow =
                    Math.Round(availableCashFlow, 2),

                monthlyDifference =
                    Math.Round(monthlyDifference, 2),

                feasibilityStatus,

                goal.Status,
                goal.CreatedAt
            };
        });

        return Ok(result);
    }

    // POST: api/FinancialGoals
    [HttpPost]
    public async Task<IActionResult> Create(
        CreateFinancialGoalDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Goal name is required.");

        if (dto.TargetAmount <= 0)
            return BadRequest(
                "Target amount must be greater than zero.");

        if (dto.CurrentAmount < 0)
            return BadRequest(
                "Current amount cannot be negative.");

        if (dto.CurrentAmount > dto.TargetAmount)
            return BadRequest(
                "Current amount cannot exceed target amount.");

        if (dto.TargetDate.Date <= DateTime.UtcNow.Date)
            return BadRequest(
                "Target date must be in the future.");

        var goal = new FinancialGoal
        {
            Name = dto.Name.Trim(),
            Category = dto.Category,
            TargetAmount = dto.TargetAmount,
            CurrentAmount = dto.CurrentAmount,
            TargetDate = dto.TargetDate.ToUniversalTime(),
            Status = dto.CurrentAmount >= dto.TargetAmount
                ? "Completed"
                : "Active"
        };

        _context.FinancialGoals.Add(goal);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            goal.Id,
            goal.Name,
            goal.Category,
            goal.TargetAmount,
            goal.CurrentAmount,
            goal.TargetDate,
            goal.Status
        });
    }

    [HttpPost("{id:guid}/contribute")]
public async Task<IActionResult> AddContribution(
    Guid id,
    AddGoalContributionDto dto)
{
    if (dto.Amount <= 0)
        return BadRequest(
            "Contribution amount must be greater than zero.");

    var goal = await _context.FinancialGoals
        .FindAsync(id);

    if (goal is null)
        return NotFound("Financial goal not found.");

    if (goal.Status == "Completed")
        return BadRequest("This goal is already completed.");

    var account = await _context.FinancialAccounts
        .Include(x => x.FinancialInstitution)
        .FirstOrDefaultAsync(
            x => x.Id == dto.FinancialAccountId);

    if (account is null)
        return BadRequest("Financial account not found.");

    var remainingGoalAmount =
        goal.TargetAmount - goal.CurrentAmount;

    if (dto.Amount > remainingGoalAmount)
    {
        return BadRequest(
            $"Contribution exceeds remaining goal amount of " +
            $"{remainingGoalAmount:N2}.");
    }

    // Get how much of this account is already allocated
    // across ALL active goals.
    var alreadyAllocated = await _context.GoalContributions
        .Where(x =>
            x.FinancialAccountId == account.Id &&
            x.FinancialGoal.Status == "Active")
        .SumAsync(x => (decimal?)x.Amount) ?? 0;

    var availableForAllocation =
        account.CurrentBalance - alreadyAllocated;

    if (dto.Amount > availableForAllocation)
    {
        return BadRequest(new
        {
            message =
                "Contribution exceeds available unallocated balance.",
            accountBalance = account.CurrentBalance,
            alreadyAllocated,
            availableForAllocation
        });
    }

    var contribution = new GoalContribution
    {
        FinancialGoalId = goal.Id,
        FinancialAccountId = account.Id,
        Amount = dto.Amount,
        ContributionDate = DateTime.UtcNow
    };

    goal.CurrentAmount += dto.Amount;

    if (goal.CurrentAmount >= goal.TargetAmount)
    {
        goal.CurrentAmount = goal.TargetAmount;
        goal.Status = "Completed";
    }

    _context.GoalContributions.Add(contribution);

    await _context.SaveChangesAsync();

    var newRemaining =
        goal.TargetAmount - goal.CurrentAmount;

    var progress =
        (goal.CurrentAmount / goal.TargetAmount) * 100;

    return Ok(new
    {
        contributionId = contribution.Id,

        goal = new
        {
            goal.Id,
            goal.Name,
            goal.TargetAmount,
            goal.CurrentAmount,

            remainingAmount =
                Math.Round(newRemaining, 2),

            progressPercentage =
                Math.Round(progress, 2),

            goal.Status
        },

        sourceAccount = new
        {
            account.Id,
            account.AccountName,

            institution =
                account.FinancialInstitution.ShortName,

            accountBalance =
                account.CurrentBalance
        },

        contributionAmount =
            contribution.Amount,

        contribution.ContributionDate
    });
}


[HttpGet("{id:guid}")]
public async Task<IActionResult> GetById(Guid id)
{
    var goal = await _context.FinancialGoals
        .FirstOrDefaultAsync(x => x.Id == id);

    if (goal is null)
        return NotFound("Financial goal not found.");

    var now = DateTime.UtcNow;

    var startOfMonth = new DateTime(
        now.Year,
        now.Month,
        1,
        0,
        0,
        0,
        DateTimeKind.Utc);

    // ---------------------------------
    // MONTHLY CASH FLOW
    // ---------------------------------

    var monthlyIncome = await _context.Transactions
        .Where(x =>
            x.TransactionDate >= startOfMonth &&
            x.TransactionType == "Income")
        .SumAsync(x => (decimal?)x.Amount) ?? 0;

    var monthlyExpenses = await _context.Transactions
        .Where(x =>
            x.TransactionDate >= startOfMonth &&
            x.TransactionType == "Expense")
        .SumAsync(x => (decimal?)x.Amount) ?? 0;

    var availableCashFlow =
        monthlyIncome - monthlyExpenses;

    // ---------------------------------
    // GOAL CALCULATIONS
    // ---------------------------------

    var remainingAmount =
        Math.Max(0, goal.TargetAmount - goal.CurrentAmount);

    var progressPercentage =
        goal.TargetAmount > 0
            ? (goal.CurrentAmount / goal.TargetAmount) * 100
            : 0;

    progressPercentage =
        Math.Min(progressPercentage, 100);

    var monthsRemaining =
        CalculateMonthsRemaining(
            DateTime.UtcNow,
            goal.TargetDate);

    var requiredMonthlySavings =
        monthsRemaining > 0
            ? remainingAmount / monthsRemaining
            : remainingAmount;

    var monthlyDifference =
        availableCashFlow - requiredMonthlySavings;

    var feasibilityStatus =
        availableCashFlow >= requiredMonthlySavings
            ? "Achievable"
            : "At Risk";

    // ---------------------------------
    // CONTRIBUTION HISTORY
    // ---------------------------------

    var contributions = await _context.GoalContributions
        .Where(x => x.FinancialGoalId == id)
        .Include(x => x.FinancialAccount)
        .ThenInclude(x => x.FinancialInstitution)
        .OrderByDescending(x => x.ContributionDate)
        .Select(x => new
        {
            x.Id,
            x.Amount,
            x.ContributionDate,

            sourceAccount = new
            {
                x.FinancialAccount.Id,
                x.FinancialAccount.AccountName,

                institution =
                    x.FinancialAccount
                        .FinancialInstitution
                        .ShortName
            }
        })
        .ToListAsync();

    return Ok(new
    {
        goal.Id,
        goal.Name,
        goal.Category,

        goal.TargetAmount,
        goal.CurrentAmount,

        remainingAmount =
            Math.Round(remainingAmount, 2),

        progressPercentage =
            Math.Round(progressPercentage, 2),

        goal.TargetDate,

        monthsRemaining,

        requiredMonthlySavings =
            Math.Round(requiredMonthlySavings, 2),

        availableMonthlyCashFlow =
            Math.Round(availableCashFlow, 2),

        monthlyDifference =
            Math.Round(monthlyDifference, 2),

        feasibilityStatus,

        goal.Status,

        contributionSummary = new
        {
            totalContributions =
                contributions.Sum(x => x.Amount),

            contributionCount =
                contributions.Count
        },

        contributions
    });
}

    private static int CalculateMonthsRemaining(
        DateTime currentDate,
        DateTime targetDate)
    {
        if (targetDate <= currentDate)
            return 0;

        var months =
            ((targetDate.Year - currentDate.Year) * 12)
            + targetDate.Month
            - currentDate.Month;

        if (targetDate.Day > currentDate.Day)
            months++;

        return Math.Max(months, 1);
    }
}