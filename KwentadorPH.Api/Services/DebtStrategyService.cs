using KwentadorPH.Api.Models;

namespace KwentadorPH.Api.Services;

public class DebtStrategyService
{
    public DebtStrategyResult Simulate(
        IEnumerable<DebtAccount> accounts,
        string strategy,
        decimal extraMonthlyPayment = 0)
    {
        if (extraMonthlyPayment < 0)
            extraMonthlyPayment = 0;

        var debts = accounts
            .Where(d => d.IsActive && d.CurrentBalance > 0)
            .Select(d => new SimulationDebt
            {
                Name = d.Name,
                Balance = d.CurrentBalance,
                InterestRate = d.InterestRate,
                MinimumPayment = d.MinimumPayment
            })
            .ToList();

        if (!debts.Any())
        {
            return new DebtStrategyResult
            {
                Strategy = strategy,
                MonthsToDebtFree = 0,
                TotalInterestPaid = 0,
                TotalAmountPaid = 0,
                EstimatedDebtFreeDate = DateTime.UtcNow.Date,
                PayoffOrder = new List<string>()
            };
        }

        decimal totalInterest = 0;
        decimal totalPaid = 0;
        int months = 0;

        var payoffOrder = new List<string>();

        // IMPORTANT:
        // Keep the original monthly debt budget constant.
        //
        // Example:
        // Minimums = ₱13,500
        // Extra     = ₱3,000
        //
        // Monthly debt budget = ₱16,500
        //
        // When one debt is paid off, its old minimum payment
        // becomes available to attack the next priority debt.
        var monthlyDebtBudget =
            debts.Sum(d => d.MinimumPayment)
            + extraMonthlyPayment;

        while (
            debts.Any(d => d.Balance > 0)
            && months < 600)
        {
            months++;

            // ==========================================
            // 1. APPLY MONTHLY INTEREST
            // ==========================================

            foreach (var debt in debts.Where(d => d.Balance > 0))
            {
                var monthlyRate =
                    debt.InterestRate / 100m / 12m;

                var interest =
                    debt.Balance * monthlyRate;

                debt.Balance += interest;
                totalInterest += interest;
            }

            // ==========================================
            // 2. START WITH FULL MONTHLY BUDGET
            // ==========================================

            decimal remainingBudget =
                monthlyDebtBudget;

            // ==========================================
            // 3. PAY REQUIRED MINIMUMS
            // ==========================================

            var activeDebts =
                debts.Where(d => d.Balance > 0)
                    .ToList();

            foreach (var debt in activeDebts)
            {
                if (remainingBudget <= 0)
                    break;

                var requiredPayment =
                    Math.Min(
                        debt.MinimumPayment,
                        debt.Balance);

                var payment =
                    Math.Min(
                        requiredPayment,
                        remainingBudget);

                debt.Balance -= payment;
                remainingBudget -= payment;
                totalPaid += payment;

                if (debt.Balance <= 0)
                {
                    debt.Balance = 0;

                    AddToPayoffOrder(
                        payoffOrder,
                        debt.Name);
                }
            }

            // ==========================================
            // 4. ROLLOVER / EXTRA PAYMENT
            // ==========================================
            //
            // Any money remaining from:
            //
            // - extra monthly payment
            // - minimum payment of already-paid debts
            // - unused portion when a debt needed less
            //   than its minimum
            //
            // attacks the priority debt.

            while (
                remainingBudget > 0
                && debts.Any(d => d.Balance > 0))
            {
                var target =
                    GetPriorityDebt(
                        debts,
                        strategy);

                if (target == null)
                    break;

                var payment =
                    Math.Min(
                        remainingBudget,
                        target.Balance);

                target.Balance -= payment;
                remainingBudget -= payment;
                totalPaid += payment;

                if (target.Balance <= 0)
                {
                    target.Balance = 0;

                    AddToPayoffOrder(
                        payoffOrder,
                        target.Name);
                }
            }
        }

        // Normalize date so results generated during the
        // same request don't differ by milliseconds.
        var estimatedDebtFreeDate =
            DateTime.UtcNow.Date.AddMonths(months);

        return new DebtStrategyResult
        {
            Strategy = NormalizeStrategyName(strategy),

            MonthsToDebtFree = months,

            TotalInterestPaid =
                Math.Round(
                    totalInterest,
                    2,
                    MidpointRounding.AwayFromZero),

            TotalAmountPaid =
                Math.Round(
                    totalPaid,
                    2,
                    MidpointRounding.AwayFromZero),

            EstimatedDebtFreeDate =
                estimatedDebtFreeDate,

            PayoffOrder =
                payoffOrder
        };
    }

    private SimulationDebt? GetPriorityDebt(
        List<SimulationDebt> debts,
        string strategy)
    {
        var active =
            debts.Where(d => d.Balance > 0);

        return strategy
            .Trim()
            .ToLowerInvariant() switch
        {
            // ======================================
            // SNOWBALL
            // Smallest remaining balance first
            // ======================================

            "snowball" => active
                .OrderBy(d => d.Balance)
                .ThenByDescending(d => d.InterestRate)
                .FirstOrDefault(),

            // ======================================
            // AVALANCHE
            // Highest APR first
            // ======================================

            "avalanche" => active
                .OrderByDescending(d => d.InterestRate)
                .ThenBy(d => d.Balance)
                .FirstOrDefault(),

            // ======================================
            // CASH FLOW
            //
            // Prioritize debt that releases more
            // minimum-payment cash relative to its
            // remaining balance.
            // ======================================

            "cashflow" => active
                .OrderByDescending(d =>
                    d.Balance > 0
                        ? d.MinimumPayment / d.Balance
                        : 0)
                .ThenBy(d => d.Balance)
                .FirstOrDefault(),

            // ======================================
            // HYBRID
            //
            // 50% APR
            // 30% cash-flow efficiency
            // 20% smaller balance
            //
            // This remains a deterministic heuristic.
            // ======================================

            "hybrid" => active
                .OrderByDescending(d =>
                    CalculateHybridScore(d))
                .FirstOrDefault(),

            _ => active
                .OrderByDescending(d => d.InterestRate)
                .FirstOrDefault()
        };
    }

    private decimal CalculateHybridScore(
        SimulationDebt debt)
    {
        if (debt.Balance <= 0)
            return decimal.MinValue;

        var aprScore =
            debt.InterestRate * 0.50m;

        var cashFlowScore =
            (debt.MinimumPayment / debt.Balance)
            * 100m
            * 0.30m;

        var balanceScore =
            (1m / debt.Balance)
            * 100000m
            * 0.20m;

        return
            aprScore
            + cashFlowScore
            + balanceScore;
    }

    private void AddToPayoffOrder(
        List<string> payoffOrder,
        string debtName)
    {
        if (!payoffOrder.Contains(debtName))
        {
            payoffOrder.Add(debtName);
        }
    }

    private string NormalizeStrategyName(
        string strategy)
    {
        return strategy
            .Trim()
            .ToLowerInvariant() switch
        {
            "snowball" => "Snowball",
            "avalanche" => "Avalanche",
            "cashflow" => "Cash Flow",
            "hybrid" => "Hybrid",
            _ => strategy
        };
    }

    private class SimulationDebt
    {
        public string Name { get; set; }
            = string.Empty;

        public decimal Balance { get; set; }

        public decimal InterestRate { get; set; }

        public decimal MinimumPayment { get; set; }
    }
}