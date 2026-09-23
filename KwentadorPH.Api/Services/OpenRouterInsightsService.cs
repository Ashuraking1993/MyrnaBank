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
        var apiKey = _configuration["OpenRouter:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new Exception("OpenRouter API key is missing.");

        var prompt = $$"""
You are Kwentador PH-AI, a friendly Filipino personal financial coach.

Analyze this user's monthly financial summary:

Monthly Income: PHP {{monthlyIncome}}
Monthly Expenses: PHP {{monthlyExpenses}}
Net Cash Flow: PHP {{netCashFlow}}
Highest Spending Category: {{topCategory}}
Highest Category Spending: PHP {{topCategoryAmount}}

Give ONE short, practical and personalized financial insight.

Rules:
- Use clear and simple English.
- Keep the tone professional, friendly, and encouraging.
- Avoid Tagalog or Taglish.
- Maximum 2 sentences.
- Be encouraging but realistic.
- Mention actual numbers when useful.
- Do not invent financial data.
- Do not recommend loans, investments, or financial products.
- Focus on spending habits and saving opportunities.
- Return plain text only.
""";

        var body = new
        {
            model = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
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

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception(
                $"OpenRouter error: {responseContent}"
            );
        }


       using var document = JsonDocument.Parse(responseContent);

        var root = document.RootElement;

        if (!root.TryGetProperty("choices", out var choices) ||
            choices.ValueKind != JsonValueKind.Array ||
            choices.GetArrayLength() == 0)
        {
            Console.WriteLine(
                $"OpenRouter returned no choices: {responseContent}"
            );

            throw new Exception(
                "OpenRouter returned no AI choices."
            );
        }

        var firstChoice = choices[0];

        if (!firstChoice.TryGetProperty("message", out var message))
        {
            Console.WriteLine(
                $"OpenRouter returned no message: {responseContent}"
            );

            throw new Exception(
                "OpenRouter returned no AI message."
            );
        }

        string? result = null;

        if (message.TryGetProperty("content", out var contentElement) &&
            contentElement.ValueKind == JsonValueKind.String)
        {
            result = contentElement.GetString();
        }

        if (string.IsNullOrWhiteSpace(result) &&
            message.TryGetProperty("reasoning", out var reasoningElement) &&
            reasoningElement.ValueKind == JsonValueKind.String)
        {
            result = reasoningElement.GetString();
        }

        if (string.IsNullOrWhiteSpace(result))
        {
            Console.WriteLine(
                $"OpenRouter returned empty AI output: {responseContent}"
            );

            throw new Exception(
                "AI returned no usable insight."
            );
        }

        return result.Trim();

   
    }
}