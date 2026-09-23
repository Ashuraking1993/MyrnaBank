namespace KwentadorPH.Api.DTOs;

public class CreateFinancialAccountDto
{
    public Guid FinancialInstitutionId { get; set; }

    public string AccountName { get; set; } = string.Empty;

    public string? MaskedAccountNumber { get; set; }

    public string AccountType { get; set; } = string.Empty;

    public decimal CurrentBalance { get; set; }

    public string ConnectionType { get; set; } = "Manual";
}