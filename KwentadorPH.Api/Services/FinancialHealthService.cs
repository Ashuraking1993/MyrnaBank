namespace KwentadorPH.Api.Services;

public class FinancialHealthService
{
    public object Calculate(
        decimal monthlyIncome,
        decimal monthlyExpenses,
        decimal totalBalance)
    {
        decimal score = 0;

        // 1. Savings Rate — maximum 40 points
        decimal savingsRate = 0;

        if (monthlyIncome > 0)
        {
            savingsRate =
                ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
        }

        decimal savingsScore = savingsRate switch
        {
            >= 30 => 40,
            >= 20 => 35,
            >= 10 => 25,
            >= 5 => 15,
            > 0 => 10,
            _ => 0
        };

        score += savingsScore;

        // 2. Expense Control — maximum 30 points
        decimal expenseRatio = 0;

        if (monthlyIncome > 0)
        {
            expenseRatio =
                (monthlyExpenses / monthlyIncome) * 100;
        }

        decimal expenseScore = expenseRatio switch
        {
            <= 50 => 30,
            <= 70 => 20,
            <= 90 => 10,
            _ => 0
        };

        score += expenseScore;

        // 3. Cash Reserve — maximum 30 points
        decimal monthsOfExpenses = 0;

        if (monthlyExpenses > 0)
        {
            monthsOfExpenses = totalBalance / monthlyExpenses;
        }

        decimal reserveScore = monthsOfExpenses switch
        {
            >= 6 => 30,
            >= 3 => 25,
            >= 1 => 15,
            > 0 => 5,
            _ => 0
        };

        score += reserveScore;

        score = Math.Min(score, 100);

        string rating = score switch
        {
            >= 85 => "Excellent",
            >= 70 => "Good",
            >= 50 => "Fair",
            _ => "At Risk"
        };

        return new
        {
            score,
            rating,

            factors = new
            {
                savingsRate = Math.Round(savingsRate, 2),
                savingsScore,

                expenseRatio = Math.Round(expenseRatio, 2),
                expenseScore,

                monthsOfExpenses = Math.Round(monthsOfExpenses, 2),
                reserveScore
            }
        };
    }
}