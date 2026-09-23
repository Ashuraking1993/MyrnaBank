namespace KwentadorPH.Api.DTOs;

public class CreateDebtAccountDto
{
    public string Name { get; set; } = string.Empty;
    public string DebtType { get; set; } = string.Empty;

    public decimal OriginalBalance { get; set; }
    public decimal CurrentBalance { get; set; }
    public decimal InterestRate { get; set; }
    public decimal MinimumPayment { get; set; }

    public DateTime? DueDate { get; set; }
}