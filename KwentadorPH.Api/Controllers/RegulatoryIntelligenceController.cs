using KwentadorPH.Api.Data;
using KwentadorPH.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RegulatoryIntelligenceController : ControllerBase
{
    private readonly KwentadorDbContext _context;

    public RegulatoryIntelligenceController(KwentadorDbContext context)
    {
        _context = context;
    }

    // GET: api/RegulatoryIntelligence
    [HttpGet]
    public async Task<IActionResult> GetUpdates()
    {
        var updates = await _context.RegulatoryUpdates
            .Include(x => x.RegulatoryImpacts)
            .OrderByDescending(x => x.DetectedAt)
            .ToListAsync();

        return Ok(updates);
    }

    // POST: api/RegulatoryIntelligence/demo
    [HttpPost("demo")]
    public async Task<IActionResult> CreateDemoUpdate()
    {
        var update = new RegulatoryUpdate
        {
            Regulator = "BSP",
            ReferenceNumber = "BSP-DEMO-2026-001",
            Title = "Enhanced Real-Time Payment Fraud Controls",
            Summary =
                "New controls require stronger real-time transaction monitoring, " +
                "risk assessment, and customer verification for digital payments.",
            PublishedDate = DateTime.UtcNow,
            ImpactLevel = "High",
            Status = "New"
        };

        _context.RegulatoryUpdates.Add(update);

        var impacts = new[]
        {
            new RegulatoryImpact
            {
                RegulatoryUpdateId = update.Id,
                SystemName = "InstaPay Transfer",
                ImpactDescription =
                    "Real-time transfers require enhanced transaction risk checks.",
                RequiredAction =
                    "Apply real-time fraud scoring before payment authorization.",
                RiskLevel = "High"
            },

            new RegulatoryImpact
            {
                RegulatoryUpdateId = update.Id,
                SystemName = "Customer Onboarding",
                ImpactDescription =
                    "Identity verification controls may require additional validation.",
                RequiredAction =
                    "Review onboarding and identity verification rules.",
                RiskLevel = "Medium"
            },

            new RegulatoryImpact
            {
                RegulatoryUpdateId = update.Id,
                SystemName = "Fraud Detection Engine",
                ImpactDescription =
                    "Existing fraud rules must support emerging AI-enabled fraud patterns.",
                RequiredAction =
                    "Update fraud rules and behavioral risk indicators.",
                RiskLevel = "High"
            },

            new RegulatoryImpact
            {
                RegulatoryUpdateId = update.Id,
                SystemName = "Transaction Monitoring",
                ImpactDescription =
                    "Monitoring must identify suspicious activity in near real time.",
                RequiredAction =
                    "Enable continuous transaction monitoring and escalation.",
                RiskLevel = "High"
            }
        };

        _context.RegulatoryImpacts.AddRange(impacts);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Regulatory update detected and mapped successfully.",
            regulatoryUpdateId = update.Id,
            regulator = update.Regulator,
            referenceNumber = update.ReferenceNumber,
            impactLevel = update.ImpactLevel,
            affectedSystems = impacts.Length
        });
    }

    // POST: api/RegulatoryIntelligence/{id}/simulate
[HttpPost("{id:guid}/simulate")]
public async Task<IActionResult> SimulateImpact(Guid id)
{
    var update = await _context.RegulatoryUpdates
        .Include(x => x.RegulatoryImpacts)
        .FirstOrDefaultAsync(x => x.Id == id);

    if (update == null)
        return NotFound(new { message = "Regulatory update not found." });

    var highRisk = update.RegulatoryImpacts
        .Count(x => x.RiskLevel == "High");

    var mediumRisk = update.RegulatoryImpacts
        .Count(x => x.RiskLevel == "Medium");

    var lowRisk = update.RegulatoryImpacts
        .Count(x => x.RiskLevel == "Low");

    var totalSystems = update.RegulatoryImpacts.Count;

    var readinessScore =
        Math.Max(
            0,
            100
            - (highRisk * 20)
            - (mediumRisk * 10)
            - (lowRisk * 5)
        );

    string readinessStatus =
        readinessScore >= 80 ? "Ready" :
        readinessScore >= 60 ? "Needs Review" :
        "Action Required";

    var criticalActions = update.RegulatoryImpacts
        .Where(x => x.RiskLevel == "High")
        .Select(x => new
        {
            system = x.SystemName,
            action = x.RequiredAction
        })
        .ToList();

    return Ok(new
    {
        regulatoryUpdate = new
        {
            update.Id,
            update.Regulator,
            update.ReferenceNumber,
            update.Title
        },

        simulation = new
        {
            totalAffectedSystems = totalSystems,
            highRiskSystems = highRisk,
            mediumRiskSystems = mediumRisk,
            lowRiskSystems = lowRisk,

            readinessScore,
            readinessStatus,

            projectedComplianceRisk =
                highRisk >= 3 ? "High" :
                highRisk >= 1 ? "Medium" :
                "Low"
        },

        criticalActions,

        recommendation =
            readinessScore < 60
                ? "Immediate remediation is recommended before regulatory enforcement."
                : "Review affected systems and implement required controls."
    });
}

// POST: api/RegulatoryIntelligence/{id}/generate-policy
[HttpPost("{id:guid}/generate-policy")]
public async Task<IActionResult> GeneratePolicy(Guid id)
{
    var update = await _context.RegulatoryUpdates
        .Include(x => x.RegulatoryImpacts)
        .FirstOrDefaultAsync(x => x.Id == id);

    if (update == null)
        return NotFound(new { message = "Regulatory update not found." });

    var highRiskImpacts = update.RegulatoryImpacts
        .Where(x => x.RiskLevel == "High")
        .ToList();

    var policyActions = update.RegulatoryImpacts
        .Select((impact, index) => new
        {
            priority = index + 1,
            system = impact.SystemName,
            riskLevel = impact.RiskLevel,
            policyRequirement = impact.RequiredAction,
            implementationStatus = "Pending"
        })
        .ToList();

    var policyText =
        $"MYRNA BANK REGULATORY POLICY UPDATE\n\n" +
        $"Reference: {update.ReferenceNumber}\n" +
        $"Regulator: {update.Regulator}\n" +
        $"Subject: {update.Title}\n\n" +

        $"POLICY OBJECTIVE\n" +
        $"Myrna Bank shall strengthen controls across affected systems " +
        $"to address the regulatory requirements identified under " +
        $"{update.ReferenceNumber}.\n\n" +

        $"REQUIRED CONTROLS\n" +
        string.Join("\n",
            update.RegulatoryImpacts.Select((x, i) =>
                $"{i + 1}. {x.SystemName}: {x.RequiredAction}")) +

        $"\n\nIMPLEMENTATION PRIORITY\n" +
        $"{highRiskImpacts.Count} high-risk system(s) require immediate review.\n\n" +

        $"COMPLIANCE STATUS\n" +
        $"Pending implementation and compliance validation.";

    return Ok(new
    {
        generatedBy = "Myrna Regulatory Intelligence",
        generatedAt = DateTime.UtcNow,

        source = new
        {
            update.Regulator,
            update.ReferenceNumber,
            update.Title
        },

        policy = new
        {
            policyTitle =
                $"Regulatory Response Policy - {update.ReferenceNumber}",

            status = "Draft",

            approvalRequired = true,

            affectedSystems = update.RegulatoryImpacts.Count,

            highPriorityActions = highRiskImpacts.Count,

            actions = policyActions,

            policyText
        },

        aiNotice =
            "Draft generated from mapped regulatory impacts. " +
            "Final policy requires compliance review and approval."
    });
}

}