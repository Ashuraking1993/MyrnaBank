namespace KwentadorPH.Api.DTOs;

public class FinancialHealthDto
{
    public int Score { get; set; }
    public string Status { get; set; } = string.Empty;

    public decimal TotalBalance { get; set; }
    public decimal MonthlyIncome { get; set; }
    public decimal MonthlyExpenses { get; set; }

    public decimal SavingsRate { get; set; }
    public decimal ExpenseRatio { get; set; }
    public decimal MonthsOfExpenses { get; set; }

    public decimal MonthlyDebtPayments { get; set; }
    public decimal DebtPaymentRatio { get; set; }
    public Guid? ToFinancialAccountId { get; set; }
}