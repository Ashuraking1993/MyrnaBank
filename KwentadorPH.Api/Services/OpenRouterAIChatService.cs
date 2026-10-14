using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace KwentadorPH.Api.Services;

public class OpenRouterAIChatService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public OpenRouterAIChatService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> GenerateResponseAsync(
        string userMessage,
        string financialContext)
    {
        var apiKey = _configuration["DeepSeek:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new Exception("DeepSeek API key is missing.");

        var prompt = $$"""
You are Myrna, the official AI financial assistant of Money Mentor.

Always identify yourself as Myrna.
Never call yourself Kwentador PH-AI, Kwentador AI, or any other name.

The user asked:
"{{userMessage}}"

Here is the user's VERIFIED financial data and backend-calculated
financial breakdown:

{{financialContext}}

Answer the user's question using ONLY the provided financial data.

Rules:
- Use clear and simple English.
- Be professional, friendly, and encouraging.
- Do not use Tagalog or Taglish.
- Never invent income, expenses, balances, goals, dates, or calculations.
- Trust the backend-calculated values.
- Explain whether the goal is achievable when relevant.
- Mention the required monthly savings when relevant.
- Mention surplus or shortfall when relevant.
- Give practical next steps.
- Do not recommend loans or investments.
- Do not invent banks, interest rates, fees, or financial products.
- If the user asks where to keep their money and verified product data
  is not provided, clearly say that current savings options should be
  compared first.
- Keep the answer concise.
- Return plain text only.
- Answer the user's actual question first.
- Only discuss financial goals when the user's question is about goals,
  saving targets, goal feasibility, or goal progress.
- Do not mention a goal just because goal data exists in the financial context.
- If the user asks about expenses, answer using expense data.
- If the user asks about income or cash flow, answer using income and cash-flow data.
- If the user asks about account balances, answer using balance data.
- If the user asks a general financial question, use only the relevant
  verified data from the context.
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

            thinking = new
            {
                type = "disabled"
            },

            max_tokens = 800
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

        using var cts = new CancellationTokenSource(
            TimeSpan.FromSeconds(15)
        );

        HttpResponseMessage response;

        try
        {
            response = await _httpClient.SendAsync(
                request,
                cts.Token
            );
        }
        catch (OperationCanceledException)
        {
            throw new Exception(
                "DeepSeek request timed out."
            );
        }

        var responseContent =
            await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine(
                $"DeepSeek Error: {responseContent}"
            );

            throw new Exception(
                $"DeepSeek API request failed: {response.StatusCode}"
            );
        }

        using var document =
            JsonDocument.Parse(responseContent);

        var root = document.RootElement;

        if (!root.TryGetProperty(
                "choices",
                out var choices) ||
            choices.ValueKind != JsonValueKind.Array ||
            choices.GetArrayLength() == 0)
        {
            throw new Exception(
                "DeepSeek returned no AI choices."
            );
        }

        var message =
            choices[0].GetProperty("message");

        string? result = null;

        if (message.TryGetProperty(
                "content",
                out var contentElement) &&
            contentElement.ValueKind == JsonValueKind.String)
        {
            result = contentElement.GetString();
        }

        if (string.IsNullOrWhiteSpace(result))
        {
            throw new Exception(
                "DeepSeek returned an empty response."
            );
        }

        Console.WriteLine(
            "AI Chat successful using DeepSeek."
        );

        return result.Trim();
    }
}