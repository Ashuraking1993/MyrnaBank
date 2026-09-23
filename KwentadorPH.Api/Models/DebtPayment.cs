using System.Text.Json.Serialization;

namespace KwentadorPH.Api.Models;

public class DebtPayment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid DebtAccountId { get; set; }

    public decimal Amount { get; set; }

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    public string? Notes { get; set; }

    [JsonIgnore]
    public DebtAccount DebtAccount { get; set; } = null!;
}