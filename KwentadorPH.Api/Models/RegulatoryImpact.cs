namespace KwentadorPH.Api.Models;
using System.Text.Json.Serialization;

public class RegulatoryImpact
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid RegulatoryUpdateId { get; set; }

    public string SystemName { get; set; } = string.Empty;
    public string ImpactDescription { get; set; } = string.Empty;
    public string RequiredAction { get; set; } = string.Empty;

    public string RiskLevel { get; set; } = "Low";

    [JsonIgnore]
public RegulatoryUpdate? RegulatoryUpdate { get; set; }
}