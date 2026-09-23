namespace KwentadorPH.Api.Models;

public class RegulatoryUpdate
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Regulator { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;

    public DateTime PublishedDate { get; set; }

    public string ImpactLevel { get; set; } = "Low";
    public string Status { get; set; } = "New";

    public ICollection<RegulatoryImpact> RegulatoryImpacts { get; set; }
    = new List<RegulatoryImpact>();

    public DateTime DetectedAt { get; set; } = DateTime.UtcNow;
}