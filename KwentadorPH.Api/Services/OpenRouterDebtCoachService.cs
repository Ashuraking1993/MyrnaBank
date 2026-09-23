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
        var apiKey = _configuration["OpenRouter:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new Exception("OpenRouter API key is missing.");

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
You are Kwentador PH-AI Debt Coach, a friendly Filipino personal finance coach.

The system has already calculated the user's debt payoff plan using a deterministic financial engine.

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

      var models = new[]
{
    "inclusionai/ling-3.0-flash-vl:free",

    "nvidia/nemotron-3.5-lightning:free",

    "nvidia/nemotron-3-ultra-550b-a55b:free",

    // Paid/reliable fallback
    "~deepseek/deepseek-pro-latest",

    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",

    // Last-resort OpenRouter free router
    "openrouter/free"
};

string? lastError = null;

foreach (var model in models)
{
    try
    {
        var body = new
        {
            model = model,

            messages = new[]
            {
                new
                {
                    role = "user",
                    content = prompt
                }
            }
        };

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            "https://openrouter.ai/api/v1/chat/completions"
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

        var response =
            await _httpClient.SendAsync(request);

        var responseContent =
            await response.Content.ReadAsStringAsync();

        // ==========================================
        // MODEL FAILED
        // ==========================================

        if (!response.IsSuccessStatusCode)
        {
            lastError = responseContent;

            Console.WriteLine(
                $"Debt Coach model failed [{model}]: " +
                responseContent
            );

            continue;
        }

        using var document =
            JsonDocument.Parse(responseContent);

        var root =
            document.RootElement;

        // ==========================================
        // CHECK CHOICES
        // ==========================================

        if (!root.TryGetProperty(
                "choices",
                out var choices) ||
            choices.ValueKind != JsonValueKind.Array ||
            choices.GetArrayLength() == 0)
        {
            lastError = responseContent;

            Console.WriteLine(
                $"Debt Coach returned no choices [{model}]: " +
                responseContent
            );

            continue;
        }

        var firstChoice =
            choices[0];

        if (!firstChoice.TryGetProperty(
                "message",
                out var message))
        {
            lastError = responseContent;

            Console.WriteLine(
                $"Debt Coach returned no message [{model}]"
            );

            continue;
        }

        string? result = null;

        // ==========================================
        // NORMAL CONTENT
        // ==========================================

        if (message.TryGetProperty(
                "content",
                out var contentElement) &&
            contentElement.ValueKind ==
                JsonValueKind.String)
        {
            result =
                contentElement.GetString();
        }

        // ==========================================
        // REASONING FALLBACK
        // ==========================================

        if (string.IsNullOrWhiteSpace(result) &&
            message.TryGetProperty(
                "reasoning",
                out var reasoningElement) &&
            reasoningElement.ValueKind ==
                JsonValueKind.String)
        {
            result =
                reasoningElement.GetString();
        }

        // ==========================================
        // SUCCESS
        // ==========================================

        if (!string.IsNullOrWhiteSpace(result))
        {
            Console.WriteLine(
                $"Debt Coach successful using: {model}"
            );

            return result.Trim();
        }

        lastError = responseContent;
    }
    catch (Exception ex)
    {
        lastError = ex.Message;

        Console.WriteLine(
            $"Debt Coach model exception [{model}]: " +
            ex.Message
        );
    }
    }

    throw new Exception(
        $"All Debt Coach AI models failed. " +
        $"Last error: {lastError}"
    );      

       
    }
}