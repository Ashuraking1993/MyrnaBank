namespace KwentadorPH.Api.Models;

public class DebtAccount
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;
    public string DebtType { get; set; } = string.Empty;

    public decimal OriginalBalance { get; set; }
    public decimal CurrentBalance { get; set; }

    // Annual Percentage Rate
    public decimal InterestRate { get; set; }

    public decimal MinimumPayment { get; set; }

    public DateTime? DueDate { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<DebtPayment> Payments { get; set; }
        = new List<DebtPayment>();
}