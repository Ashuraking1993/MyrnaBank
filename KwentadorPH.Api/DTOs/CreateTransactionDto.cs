namespace KwentadorPH.Api.DTOs;

public class CreateTransactionDto
{
    public Guid FinancialAccountId { get; set; }

    public string Description { get; set; } = string.Empty;

    public string? MerchantName { get; set; }

    public decimal Amount { get; set; }

    // Income or Expense
    public string TransactionType { get; set; } = string.Empty;

    public string Category { get; set; } = "Uncategorized";

    public DateTime? TransactionDate { get; set; }
}