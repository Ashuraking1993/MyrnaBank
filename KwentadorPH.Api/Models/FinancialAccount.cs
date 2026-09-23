namespace KwentadorPH.Api.Models;

public class FinancialAccount
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FinancialInstitutionId { get; set; }

    public FinancialInstitution FinancialInstitution { get; set; } = null!;

    public string AccountName { get; set; } = string.Empty;

    public string? MaskedAccountNumber { get; set; }

    // Savings, Wallet, Checking, Cash
    public string AccountType { get; set; } = string.Empty;

    public decimal CurrentBalance { get; set; }

    public string Currency { get; set; } = "PHP";

    // Manual, Sandbox, OpenFinance, DirectAPI
    public string ConnectionType { get; set; } = "Manual";

    public bool IsConnected { get; set; }

    public DateTime? LastSyncedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Transaction> Transactions { get; set; }
        = new List<Transaction>();
}