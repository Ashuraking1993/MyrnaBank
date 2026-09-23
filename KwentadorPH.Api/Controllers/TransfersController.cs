using KwentadorPH.Api.Data;
using KwentadorPH.Api.DTOs;
using KwentadorPH.Api.Models;
using KwentadorPH.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransfersController : ControllerBase
{
    private readonly KwentadorDbContext _context;
    private readonly SentinelRiskService _sentinelRiskService;

    public TransfersController(
        KwentadorDbContext context,
        SentinelRiskService sentinelRiskService)
    {
        _context = context;
        _sentinelRiskService = sentinelRiskService;
    }

    [HttpPost("preview")]
public async Task<IActionResult> PreviewTransfer(
    TransferPreviewDto dto)
{
    if (dto.Amount <= 0)
    {
        return BadRequest(new
        {
            message = "Transfer amount must be greater than zero."
        });
    }

    var account = await _context.FinancialAccounts
        .Include(x => x.FinancialInstitution)
        .FirstOrDefaultAsync(
            x => x.Id == dto.FromFinancialAccountId);

    if (account == null)
    {
        return NotFound(new
        {
            message = "Source financial account not found."
        });
    }

    if (account.CurrentBalance < dto.Amount)
    {
        return BadRequest(new
        {
            message = "Insufficient balance."
        });
    }

    var transfer = new Transfer
    {
        FromFinancialAccountId = account.Id,
        ReferenceNumber = "PREVIEW",
        RecipientName = dto.RecipientName.Trim(),
        RecipientInstitution =
            dto.RecipientInstitution.Trim(),
        RecipientAccountNumber =
            dto.RecipientAccountNumber.Trim(),
        Amount = dto.Amount,
        Channel = dto.Channel,
        Note = dto.Note,
        Status = "Preview"
    };

    var previousTransfers = await _context.Transfers
        .Where(x =>
            x.FromFinancialAccountId == account.Id &&
            x.Status == "Completed")
        .ToListAsync();

    var averageTransferAmount =
        previousTransfers.Count > 0
            ? previousTransfers.Average(x => x.Amount)
            : 0m;

    var tenMinutesAgo =
        DateTime.UtcNow.AddMinutes(-10);

    var recentTransferCount =
        await _context.Transfers.CountAsync(x =>
            x.FromFinancialAccountId == account.Id &&
            x.CreatedAt >= tenMinutesAgo);

    var recipientInstitution =
        dto.RecipientInstitution.Trim().ToLower();

    var recipientAccountNumber =
        dto.RecipientAccountNumber
            .Replace(" ", "")
            .Replace("-", "");

    var isExistingBeneficiary =
        await _context.Transfers.AnyAsync(x =>
            x.FromFinancialAccountId == account.Id &&
            x.RecipientInstitution.ToLower()
                == recipientInstitution &&
            x.RecipientAccountNumber
                .Replace(" ", "")
                .Replace("-", "")
                == recipientAccountNumber &&
            x.Status == "Completed");

    var isNewBeneficiary =
        !isExistingBeneficiary;

    var assessment =
        _sentinelRiskService.Assess(
            transfer,
            averageTransferAmount,
            recentTransferCount,
            dto.IsNewDevice,
            isNewBeneficiary,
            dto.HasIdentityMismatch);

    // IMPORTANT:
    // Preview is NOT saved and balance is NOT changed.

    return Ok(new
    {
        preview = new
        {
            account = new
            {
                account.Id,
                account.AccountName,
                account.CurrentBalance
            },

            recipient = new
            {
                dto.RecipientName,
                dto.RecipientInstitution,
                dto.RecipientAccountNumber
            },

            dto.Amount,
            dto.Channel
        },

        sentinel = new
        {
            assessment.OverallRiskScore,
            assessment.RiskLevel,
            assessment.Decision,

            riskBreakdown = new
            {
                device = assessment.DeviceRiskScore,
                identity = assessment.IdentityRiskScore,
                behavior = assessment.BehaviorRiskScore,
                transaction =
                    assessment.TransactionRiskScore,
                velocity = assessment.VelocityRiskScore
            },

            signals =
                assessment.RiskSignals.Select(x => new
                {
                    x.Category,
                    x.Signal,
                    x.Score,
                    x.Severity
                })
        },

        requiresVerification =
            assessment.Decision == "Verify",

        transferBlocked =
            assessment.Decision == "Hold"
    });
}

    [HttpPost]
    public async Task<IActionResult> CreateTransfer(CreateTransferDto dto)
    {
        // 1. Basic validation
        if (dto.Amount <= 0)
        {
            return BadRequest(new
            {
                message = "Transfer amount must be greater than zero."
            });
        }

        if (string.IsNullOrWhiteSpace(dto.RecipientName) ||
            string.IsNullOrWhiteSpace(dto.RecipientInstitution) ||
            string.IsNullOrWhiteSpace(dto.RecipientAccountNumber))
        {
            return BadRequest(new
            {
                message = "Recipient information is required."
            });
        }

        // 2. Load source account
        var account = await _context.FinancialAccounts
            .Include(x => x.FinancialInstitution)
            .FirstOrDefaultAsync(
                x => x.Id == dto.FromFinancialAccountId);

        if (account == null)
        {
            return NotFound(new
            {
                message = "Source financial account not found."
            });
        }

        // 3. Check balance
        if (account.CurrentBalance < dto.Amount)
        {
            return BadRequest(new
            {
                message = "Insufficient balance."
            });
        }

        // Optional internal Myrna destination account
        FinancialAccount? destinationAccount = null;

        if (dto.ToFinancialAccountId.HasValue)
        {
            destinationAccount =
                await _context.FinancialAccounts
                    .Include(x => x.FinancialInstitution)
                    .FirstOrDefaultAsync(x =>
                        x.Id == dto.ToFinancialAccountId.Value);

            if (destinationAccount == null)
            {
                return BadRequest(new
                {
                    message =
                        "Destination Myrna account not found."
                });
            }

            if (destinationAccount.Id == account.Id)
            {
                return BadRequest(new
                {
                    message =
                        "Source and destination accounts cannot be the same."
                });
            }
        }

        // 4. Create pending transfer
        var transfer = new Transfer
        {
            FromFinancialAccountId = account.Id,

            ReferenceNumber =
                $"MYR-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString()[..4].ToUpper()}",

            RecipientName = dto.RecipientName.Trim(),
            RecipientInstitution = dto.RecipientInstitution.Trim(),
            RecipientAccountNumber = dto.RecipientAccountNumber.Trim(),

            Amount = dto.Amount,
            Channel = dto.Channel,
            Note = dto.Note,

            Status = "Pending"
        };

        _context.Transfers.Add(transfer);

        // 5. Get historical transfer behavior
        var previousTransfers = await _context.Transfers
            .Where(x =>
                x.FromFinancialAccountId == account.Id &&
                x.Status == "Completed")
            .ToListAsync();

        var averageTransferAmount =
            previousTransfers.Count > 0
                ? previousTransfers.Average(x => x.Amount)
                : 0m;

        // Transfers within the last 10 minutes
        var tenMinutesAgo = DateTime.UtcNow.AddMinutes(-10);

        var recentTransferCount =
            await _context.Transfers.CountAsync(x =>
                x.FromFinancialAccountId == account.Id &&
                x.CreatedAt >= tenMinutesAgo);

        // Check whether beneficiary was previously used
        var recipientInstitution =
            dto.RecipientInstitution.Trim().ToLower();

        var recipientAccountNumber =
            dto.RecipientAccountNumber
                .Replace(" ", "")
                .Replace("-", "");

        var isExistingBeneficiary =
            await _context.Transfers.AnyAsync(x =>
                x.FromFinancialAccountId == account.Id &&
                x.RecipientInstitution.ToLower() == recipientInstitution &&
                x.RecipientAccountNumber
                    .Replace(" ", "")
                    .Replace("-", "") == recipientAccountNumber &&
                x.Status == "Completed");

        var isNewBeneficiary = !isExistingBeneficiary;

        /*
         * DEMO SIGNALS
         *
         * We do not yet have device fingerprinting or
         * identity verification infrastructure.
         *
         * Keep these false until those modules are implemented.
         */
        var isNewDevice = false;
        var hasIdentityMismatch = false;

        // 6. Sentinel assessment
        var assessment = _sentinelRiskService.Assess(
            transfer,
            averageTransferAmount,
            recentTransferCount,
            isNewDevice,
            isNewBeneficiary,
            hasIdentityMismatch);

        _context.SentinelRiskAssessments.Add(assessment);

        // 7. Apply Sentinel decision
        if (assessment.Decision == "Hold")
        {
            transfer.Status = "Held";
        }
        else if (assessment.Decision == "Verify")
        {
            transfer.Status = "VerificationRequired";
        }
        else
        {
            // Allow and Monitor are allowed to proceed.
           // Allow and Monitor are allowed to proceed.
            account.CurrentBalance -= dto.Amount;

            // Internal Myrna transfer:
            // credit the destination account.
            if (destinationAccount != null)
            {
                destinationAccount.CurrentBalance +=
                    dto.Amount;
            }

            transfer.Status = "Completed";
            transfer.CompletedAt = DateTime.UtcNow;

            var transaction = new Transaction
            {
                FinancialAccountId = account.Id,

                Description =
                    $"Transfer to {dto.RecipientName}",

                MerchantName = dto.RecipientInstitution,

                Amount = dto.Amount,

                TransactionType = "Transfer",

                Category = "Fund Transfer",

                IsAiCategorized = false,

                TransactionDate = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);

            if (destinationAccount != null)
{
    var incomingTransaction =
        new Transaction
        {
            FinancialAccountId =
                destinationAccount.Id,

            Description =
                $"Transfer from {account.AccountName}",

            MerchantName =
                account.FinancialInstitution?.ShortName
                ?? "Myrna Bank",

            Amount = dto.Amount,

            TransactionType = "Income",

            Category = "Fund Transfer",

            IsAiCategorized = false,

            TransactionDate =
                DateTime.UtcNow
        };

    _context.Transactions.Add(
        incomingTransaction
    );
}
        }

        // 8. Save everything atomically
        await _context.SaveChangesAsync();

        // 9. Return result
        return Ok(new
        {
            transfer = new
            {
                transfer.Id,
                transfer.ReferenceNumber,
                transfer.RecipientName,
                transfer.RecipientInstitution,
                transfer.Amount,
                transfer.Channel,
                transfer.Status,
                transfer.CreatedAt,
                transfer.CompletedAt
            },

            sentinel = new
            {
                assessment.OverallRiskScore,
                assessment.RiskLevel,
                assessment.Decision,

                riskBreakdown = new
                {
                    device = assessment.DeviceRiskScore,
                    identity = assessment.IdentityRiskScore,
                    behavior = assessment.BehaviorRiskScore,
                    transaction = assessment.TransactionRiskScore,
                    velocity = assessment.VelocityRiskScore
                },

                signals = assessment.RiskSignals.Select(x => new
                {
                    x.Category,
                    x.Signal,
                    x.Score,
                    x.Severity
                })
            },

            remainingBalance =
                transfer.Status == "Completed"
                    ? account.CurrentBalance
                    : (decimal?)null
        });
    }
}