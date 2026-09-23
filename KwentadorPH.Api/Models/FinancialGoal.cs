namespace KwentadorPH.Api.Models;

public class FinancialGoal
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    // EmergencyFund, Travel, Gadget, Education, House, Vehicle, Other
    public string Category { get; set; } = "Other";

    public decimal TargetAmount { get; set; }

    public decimal CurrentAmount { get; set; }

    public DateTime TargetDate { get; set; }

    // Active, Completed, Paused
    public string Status { get; set; } = "Active";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<GoalContribution> Contributions { get; set; }
    = new List<GoalContribution>();
}