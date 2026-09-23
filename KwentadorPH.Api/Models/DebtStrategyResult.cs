namespace KwentadorPH.Api.Models;

public class DebtStrategyResult
{
    public string Strategy { get; set; } = string.Empty;

    public int MonthsToDebtFree { get; set; }

    public decimal TotalInterestPaid { get; set; }

    public decimal TotalAmountPaid { get; set; }

    public DateTime EstimatedDebtFreeDate { get; set; }

    public List<string> PayoffOrder { get; set; } = new();
}