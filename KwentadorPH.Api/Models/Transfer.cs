namespace KwentadorPH.Api.Models;

public class Transfer
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FromFinancialAccountId { get; set; }

    public FinancialAccount FromFinancialAccount { get; set; } = null!;

    public string ReferenceNumber { get; set; } = string.Empty;

    public string RecipientName { get; set; } = string.Empty;

    public string RecipientInstitution { get; set; } = string.Empty;

    public string RecipientAccountNumber { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public string Channel { get; set; } = "InstaPay";

    public string Status { get; set; } = "Pending";

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }
}