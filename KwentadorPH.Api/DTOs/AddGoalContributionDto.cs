namespace KwentadorPH.Api.DTOs;

public class AddGoalContributionDto
{
    public Guid FinancialAccountId { get; set; }

    public decimal Amount { get; set; }
}