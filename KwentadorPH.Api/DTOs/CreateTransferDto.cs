namespace KwentadorPH.Api.DTOs;

public class CreateTransferDto
{
    public Guid FromFinancialAccountId { get; set; }
    public Guid? ToFinancialAccountId { get; set; }

    public string RecipientName { get; set; } = string.Empty;

    public string RecipientInstitution { get; set; } = string.Empty;

    public string RecipientAccountNumber { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string Channel { get; set; } = "InstaPay";

    public string? Note { get; set; }

    
}