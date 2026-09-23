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
        var apiKey = _configuration["OpenRouter:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new Exception("OpenRouter API key is missing.");

        var prompt = $$"""
You are Myrna, the official AI financial assistant of Myrna Bank.
Always identify yourself as Myrna.
Never call yourself Kwentador PH-AI, Kwentador AI, or any other name.
If the user greets you or asks who you are, introduce yourself as Myrna from Myrna Bank.

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
- Only discuss financial goals when the user's question is about goals, saving targets, goal feasibility, or goal progress.
- Do not mention a goal just because goal data exists in the financial context.
- If the user asks about expenses, answer using expense data.
- If the user asks about income or cash flow, answer using income and cash-flow data.
- If the user asks about account balances, answer using balance data.
- If the user asks a general financial question, use only the relevant verified data from the context.
- Never force the Japan Travel Fund into unrelated answers.
""";

       var models = new[]
{
    // Primary

    "inclusionai/ling-3.0-flash-vl:free",
    
    "nvidia/nemotron-3.5-lightning:free",

    "nvidia/nemotron-3-ultra-550b-a55b:free",

    // Free fallback
    

    // Paid/reliable fallback
    "~deepseek/deepseek-pro-latest",

    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",

    // Last-resort free router
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

        if (!response.IsSuccessStatusCode)
        {
            lastError = responseContent;

            Console.WriteLine(
                $"AI model failed [{model}]: {responseContent}"
            );

            continue;
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
            lastError = responseContent;

            Console.WriteLine(
                $"AI model returned no choices [{model}]: {responseContent}"
            );

            continue;
        }

        var firstChoice = choices[0];

        if (!firstChoice.TryGetProperty(
                "message",
                out var message))
        {
            lastError = responseContent;
            continue;
        }

        string? result = null;

        if (message.TryGetProperty(
                "content",
                out var contentElement) &&
            contentElement.ValueKind == JsonValueKind.String)
        {
            result = contentElement.GetString();
        }

        if (string.IsNullOrWhiteSpace(result) &&
            message.TryGetProperty(
                "reasoning",
                out var reasoningElement) &&
            reasoningElement.ValueKind == JsonValueKind.String)
        {
            result = reasoningElement.GetString();
        }

        if (!string.IsNullOrWhiteSpace(result))
        {
            Console.WriteLine(
                $"AI Chat successful using: {model}"
            );

            return result.Trim();
        }

        lastError = responseContent;
    }
    catch (Exception ex)
    {
        lastError = ex.Message;

        Console.WriteLine(
            $"AI model exception [{model}]: {ex.Message}"
        );
    }
}

throw new Exception(
    $"All AI models failed. Last error: {lastError}"
);
    }
}