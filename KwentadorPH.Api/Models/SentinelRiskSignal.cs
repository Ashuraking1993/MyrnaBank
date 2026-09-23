using System.Text.Json.Serialization;

namespace KwentadorPH.Api.Models;

public class SentinelRiskSignal
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid SentinelRiskAssessmentId { get; set; }

    [JsonIgnore]
    public SentinelRiskAssessment SentinelRiskAssessment { get; set; } = null!;

    // Device, Identity, Behavior, Transaction, Velocity
    public string Category { get; set; } = string.Empty;

    public string Signal { get; set; } = string.Empty;

    public int Score { get; set; }

    // Low, Medium, High
    public string Severity { get; set; } = "Low";
}