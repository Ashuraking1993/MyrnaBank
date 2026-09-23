namespace KwentadorPH.Api.DTOs;

public class CreateFinancialGoalDto
{
    public string Name { get; set; } = string.Empty;

    public string Category { get; set; } = "Other";

    public decimal TargetAmount { get; set; }

    public decimal CurrentAmount { get; set; }

    public DateTime TargetDate { get; set; }
}