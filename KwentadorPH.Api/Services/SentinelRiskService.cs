using KwentadorPH.Api.Models;

namespace KwentadorPH.Api.Services;

public class SentinelRiskService
{
    public SentinelRiskAssessment Assess(
        Transfer transfer,
        decimal averageTransferAmount,
        int recentTransferCount,
        bool isNewDevice,
        bool isNewBeneficiary,
        bool hasIdentityMismatch)
    {
        var assessment = new SentinelRiskAssessment
        {
            TransferId = transfer.Id
        };

        // DEVICE RISK
        if (isNewDevice)
        {
            assessment.DeviceRiskScore = 15;

            AddSignal(
                assessment,
                "Device",
                "Transfer initiated from a new or unrecognized device.",
                15,
                "High");
        }

        // IDENTITY RISK
        if (hasIdentityMismatch)
        {
            assessment.IdentityRiskScore = 20;

            AddSignal(
                assessment,
                "Identity",
                "Identity verification signals require additional review.",
                20,
                "High");
        }

        // BEHAVIOR RISK
        if (averageTransferAmount > 0)
        {
            var ratio = transfer.Amount / averageTransferAmount;

            if (ratio >= 5)
            {
                assessment.BehaviorRiskScore = 25;

                AddSignal(
                    assessment,
                    "Behavior",
                    $"Transfer amount is {ratio:F1}x higher than normal activity.",
                    25,
                    "High");
            }
            else if (ratio >= 3)
            {
                assessment.BehaviorRiskScore = 15;

                AddSignal(
                    assessment,
                    "Behavior",
                    $"Transfer amount is {ratio:F1}x higher than normal activity.",
                    15,
                    "Medium");
            }
        }

        // TRANSACTION RISK
        
        if (transfer.Amount >= 100000)
        {
            assessment.TransactionRiskScore += 30;

            AddSignal(
                assessment,
                "Transaction",
                "Very high-value transfer detected.",
                30,
                "High");
        }
        else if (transfer.Amount >= 50000)
        {
            assessment.TransactionRiskScore += 20;

            AddSignal(
                assessment,
                "Transaction",
                "High-value transfer detected.",
                20,
                "High");
        }
        else if (transfer.Amount >= 25000)
        {
            assessment.TransactionRiskScore += 10;

            AddSignal(
                assessment,
                "Transaction",
                "Transfer amount requires additional monitoring.",
                10,
                "Medium");
        }

        // VELOCITY RISK
        if (recentTransferCount >= 5)
        {
            assessment.VelocityRiskScore = 20;

            AddSignal(
                assessment,
                "Velocity",
                $"{recentTransferCount} recent transfers detected in a short period.",
                20,
                "High");
        }
        else if (recentTransferCount >= 3)
        {
            assessment.VelocityRiskScore = 12;

            AddSignal(
                assessment,
                "Velocity",
                $"{recentTransferCount} recent transfers detected in a short period.",
                12,
                "Medium");
        }

        // TOTAL SCORE
        assessment.OverallRiskScore =
            assessment.DeviceRiskScore +
            assessment.IdentityRiskScore +
            assessment.BehaviorRiskScore +
            assessment.TransactionRiskScore +
            assessment.VelocityRiskScore;

        assessment.OverallRiskScore =
            Math.Min(assessment.OverallRiskScore, 100);

       // DECISION ENGINE
 

    if (assessment.OverallRiskScore >= 60)
    {
        assessment.RiskLevel = "Critical";
        assessment.Decision = "Hold";
    }
    else if (hasIdentityMismatch && isNewDevice)
    {
        assessment.RiskLevel = "High";
        assessment.Decision = "Verify";
    }
    else if (assessment.OverallRiskScore >= 30)
    {
        assessment.RiskLevel = "High";
        assessment.Decision = "Verify";
    }
    else if (assessment.OverallRiskScore >= 15)
    {
        assessment.RiskLevel = "Medium";
        assessment.Decision = "Monitor";
    }
    else
    {
        assessment.RiskLevel = "Low";
        assessment.Decision = "Allow";
    }

     return assessment;
    }

    private static void AddSignal(
        SentinelRiskAssessment assessment,
        string category,
        string signal,
        int score,
        string severity)
    {
        assessment.RiskSignals.Add(
            new SentinelRiskSignal
            {
                SentinelRiskAssessmentId = assessment.Id,
                Category = category,
                Signal = signal,
                Score = score,
                Severity = severity
            });
    }
}