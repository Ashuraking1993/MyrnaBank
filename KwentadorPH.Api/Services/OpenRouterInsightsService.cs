using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace KwentadorPH.Api.Services;

public class OpenRouterInsightsService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public OpenRouterInsightsService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> GenerateInsightAsync(
        decimal monthlyIncome,
        decimal monthlyExpenses,
        decimal netCashFlow,
        string topCategory,
        decimal topCategoryAmount)
    {
        var apiKey = _configuration["DeepSeek:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new Exception("DeepSeek API key is missing.");

        var prompt = $$"""
You are Myrna, the AI financial coach of Money Mentor.

Analyze this user's VERIFIED monthly financial summary:

Monthly Income: PHP {{monthlyIncome:N2}}
Monthly Expenses: PHP {{monthlyExpenses:N2}}
Net Cash Flow: PHP {{netCashFlow:N2}}
Highest Spending Category: {{topCategory}}
Highest Category Spending: PHP {{topCategoryAmount:N2}}

Give ONE short, practical and personalized financial insight.

Rules:
- Use clear and simple English.
- Keep the tone professional, friendly, and encouraging.
- Avoid Tagalog or Taglish.
- Maximum 2 short sentences.
- Be encouraging but realistic.
- Mention actual provided numbers when useful.
- Do NOT perform new financial calculations.
- Do NOT change any provided numbers.
- Do NOT invent financial data.
- Treat all provided financial data as authoritative.
- Do NOT recommend loans, investments, credit cards, or financial products.
- Focus on spending habits, cash flow, and saving opportunities.
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

            // Fast response is more important for a short insight.
            thinking = new
            {
                type = "disabled"
            },

            max_tokens = 200
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

        // Prevent AI Insights from hanging the UI.
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
                    $"DeepSeek Insights Error: {responseContent}"
                );

                throw new Exception(
                    $"DeepSeek Insights request failed: " +
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
                Console.WriteLine(
                    $"DeepSeek returned no choices: {responseContent}"
                );

                throw new Exception(
                    "DeepSeek returned no AI choices."
                );
            }

            var firstChoice =
                choices[0];

            if (!firstChoice.TryGetProperty(
                    "message",
                    out var message))
            {
                throw new Exception(
                    "DeepSeek returned no AI message."
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
                Console.WriteLine(
                    $"DeepSeek returned empty output: {responseContent}"
                );

                throw new Exception(
                    "DeepSeek returned no usable insight."
                );
            }

            Console.WriteLine(
                "AI Insight successful using DeepSeek."
            );

            return result.Trim();
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine(
                "DeepSeek AI Insights timed out."
            );

            throw new Exception(
                "DeepSeek AI Insights request timed out."
            );
        }
    }
}