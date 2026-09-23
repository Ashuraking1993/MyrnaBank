namespace KwentadorPH.Api.Models;

public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FinancialAccountId { get; set; }

    public FinancialAccount FinancialAccount { get; set; } = null!;

    public string Description { get; set; } = string.Empty;

    public string? MerchantName { get; set; }

    public decimal Amount { get; set; }

    // Income, Expense, Transfer
    public string TransactionType { get; set; } = string.Empty;

    public string Category { get; set; } = "Uncategorized";

    public bool IsAiCategorized { get; set; }

    public decimal? AiConfidenceScore { get; set; }

    public DateTime TransactionDate { get; set; }

    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}