namespace KwentadorPH.Api.Models;

public class SentinelRiskAssessment
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid TransferId { get; set; }

    public Transfer Transfer { get; set; } = null!;

    public int DeviceRiskScore { get; set; }

    public int IdentityRiskScore { get; set; }

    public int BehaviorRiskScore { get; set; }

    public int TransactionRiskScore { get; set; }

    public int VelocityRiskScore { get; set; }

    public int OverallRiskScore { get; set; }

    // Low, Medium, High, Critical
    public string RiskLevel { get; set; } = "Low";

    // Allow, Monitor, Verify, Hold
    public string Decision { get; set; } = "Allow";

    public DateTime AssessedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SentinelRiskSignal> RiskSignals { get; set; }
        = new List<SentinelRiskSignal>();
}