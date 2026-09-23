using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace KwentadorPH.Api.Services;

public class OpenRouterVoiceExpenseService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public OpenRouterVoiceExpenseService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> ParseExpenseAsync(
        string transcript)
    {
        var apiKey = _configuration["OpenRouter:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new Exception("OpenRouter API key is missing.");

        var today = DateTime.UtcNow.ToString("yyyy-MM-dd");

        var prompt = $$"""
You are Kwentador PH-AI.

The following text came from speech recognition and may contain
incorrect spelling, especially Filipino or Taglish words.

Interpret the intended expense.

Speech transcript:
"{{transcript}}"

Example:
"Gula y sapelingue 500 pesos"
means:
"Gulay sa palengke 500 pesos"

Return ONLY valid JSON:

{
  "description": "string",
  "amount": 0,
  "category": "string",
  "transactionDate": "{{today}}",
  "confidence": 0.0
}

Allowed categories:
Food & Dining,
Transportation,
Groceries,
Bills & Utilities,
Shopping,
Travel & Fares,
Health & Medical,
Clothing,
Entertainment,
Education,
Housing,
Subscriptions,
Personal Care,
Insurance,
Pets,
Others.

Rules:
- Correct obvious speech-to-text spelling mistakes.
- Extract the Philippine peso amount.
- Keep the description short and natural.
- "gulay", "palengke", meat, fish, rice = Groceries.
- "fare", "pamasahe", jeep, bus, tricycle, Grab = Transportation.
- Food, lunch, dinner, breakfast, restaurant = Food & Dining.
- If uncertain about category, use Others.
- Do NOT invent an amount.
- transactionDate must be {{today}}.
- confidence must be between 0 and 1.
- Return JSON only.
""";

        var body = new
        {
            model = "openrouter/free",
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

        using var document =
            JsonDocument.Parse(responseContent);

        var result = document.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        if (string.IsNullOrWhiteSpace(result))
            throw new Exception("AI returned empty content.");

        var cleanResult = result
            .Replace("```json", "")
            .Replace("```", "")
            .Trim();

        // Find actual JSON object in case the model
        // adds extra text before or after it
        var jsonStart = cleanResult.IndexOf('{');
        var jsonEnd = cleanResult.LastIndexOf('}');

        if (jsonStart == -1 || jsonEnd == -1 || jsonEnd <= jsonStart)
        {
            throw new Exception(
                $"AI returned invalid expense JSON: {cleanResult}"
            );
        }

        var json = cleanResult.Substring(
            jsonStart,
            jsonEnd - jsonStart + 1
        );

        // Validate JSON before returning to mobile
        using var validatedJson = JsonDocument.Parse(json);

        return json;
            }
}