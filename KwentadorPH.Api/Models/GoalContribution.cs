namespace KwentadorPH.Api.Models;

public class GoalContribution
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FinancialGoalId { get; set; }
    public FinancialGoal FinancialGoal { get; set; } = null!;

    public Guid FinancialAccountId { get; set; }
    public FinancialAccount FinancialAccount { get; set; } = null!;

    public decimal Amount { get; set; }

    public DateTime ContributionDate { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}