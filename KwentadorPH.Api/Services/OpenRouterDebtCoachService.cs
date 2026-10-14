using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using KwentadorPH.Api.Models;

namespace KwentadorPH.Api.Services;

public class OpenRouterDebtCoachService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public OpenRouterDebtCoachService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> GenerateCoachAdviceAsync(
        IEnumerable<DebtAccount> debts,
        DebtStrategyResult recommendedStrategy,
        decimal extraMonthlyPayment,
        decimal interestSaved)
    {
        var apiKey = _configuration["DeepSeek:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new Exception("DeepSeek API key is missing.");

        var debtList = string.Join(
            "\n",
            debts.Select(d =>
                $"- {d.Name}: Balance PHP {d.CurrentBalance:N2}, " +
                $"APR {d.InterestRate:N2}%, " +
                $"Minimum PHP {d.MinimumPayment:N2}")
        );

        var payoffOrder = string.Join(
            " -> ",
            recommendedStrategy.PayoffOrder
        );

        var prompt = $$"""
You are Myrna, the AI Debt Coach of Money Mentor.

The system has already calculated the user's debt payoff plan
using a deterministic financial engine.

DEBT PROFILE:
{{debtList}}

CALCULATED STRATEGY:
Recommended Strategy: {{recommendedStrategy.Strategy}}
Extra Monthly Payment: PHP {{extraMonthlyPayment:N2}}
Months Until Debt-Free: {{recommendedStrategy.MonthsToDebtFree}}
Estimated Debt-Free Date: {{recommendedStrategy.EstimatedDebtFreeDate:MMMM yyyy}}
Calculated Total Interest: PHP {{recommendedStrategy.TotalInterestPaid:N2}}
Calculated Interest Savings vs Snowball: PHP {{interestSaved:N2}}
Payoff Order: {{payoffOrder}}

Explain why this strategy is useful for the user's current debt profile.

Rules:
- Use clear and simple English.
- Maximum 3 short sentences.
- Professional, friendly, and encouraging.
- Explain the main reason behind the strategy.
- Mention the most important high-interest debt when useful.
- Mention the calculated savings or payoff period when useful.
- Do NOT perform new financial calculations.
- Do NOT change any provided numbers.
- Do NOT invent balances, APRs, savings, dates, or payoff periods.
- Treat all provided financial calculations as authoritative.
- Do NOT recommend new loans, credit cards, investments, or financial products.
- Do NOT claim guaranteed financial outcomes.
- Return plain text only.
""";

        var body = new
        {
            model = "deepseek-flash",

            messages = new[]
            {
                new
                {
                    role = "user",
                    content = prompt
                }
            },

            // We only need a short explanation.
            // No extended reasoning is required.
            thinking = new
            {
                type = "disabled"
            },

            max_tokens = 300
        };

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "https://api.deepseek.com/chat/completions"
        );

        request.Headers.Authorization =
            new AuthenticationHeaderValue(
                "Bearer",
                apiKey
            );

        request.Content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json"
        );

        // Prevent AI from making the Debt Planner wait too long.
        using var cts =
            new CancellationTokenSource(
                TimeSpan.FromSeconds(10)
            );

        try
        {
            var response =
                await _httpClient.SendAsync(
                    request,
                    cts.Token
                );

            var responseContent =
                await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine(
                    $"DeepSeek Debt Coach Error: {responseContent}"
                );

                throw new Exception(
                    $"DeepSeek Debt Coach request failed: " +
                    $"{response.StatusCode}"
                );
            }

            using var document =
                JsonDocument.Parse(responseContent);

            var root =
                document.RootElement;

            if (!root.TryGetProperty(
                    "choices",
                    out var choices) ||
                choices.ValueKind != JsonValueKind.Array ||
                choices.GetArrayLength() == 0)
            {
                throw new Exception(
                    "DeepSeek Debt Coach returned no choices."
                );
            }

            var firstChoice =
                choices[0];

            if (!firstChoice.TryGetProperty(
                    "message",
                    out var message))
            {
                throw new Exception(
                    "DeepSeek Debt Coach returned no message."
                );
            }

            string? result = null;

            if (message.TryGetProperty(
                    "content",
                    out var contentElement) &&
                contentElement.ValueKind ==
                    JsonValueKind.String)
            {
                result =
                    contentElement.GetString();
            }

            if (string.IsNullOrWhiteSpace(result))
            {
                throw new Exception(
                    "DeepSeek Debt Coach returned an empty response."
                );
            }

            Console.WriteLine(
                "Debt Coach successful using DeepSeek."
            );

            return result.Trim();
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine(
                "DeepSeek Debt Coach timed out."
            );

            throw new Exception(
                "DeepSeek Debt Coach request timed out."
            );
        }
    }
}