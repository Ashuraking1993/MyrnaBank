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
        var apiKey = _configuration["DeepSeek:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new Exception("DeepSeek API key is missing.");

        if (string.IsNullOrWhiteSpace(transcript))
            throw new Exception("Voice transcript is empty.");

        var today = DateTime.UtcNow.ToString("yyyy-MM-dd");

        var prompt = $$"""
You are Myrna, the AI financial assistant of Money Mentor.

The following text came from speech recognition and may contain
incorrect spelling, especially Filipino or Taglish words.

Interpret the intended expense.

Speech transcript:
"{{transcript}}"

Example:
"Gula y sapelingue 500 pesos"
means:
"Gulay sa palengke 500 pesos"

Return ONLY valid JSON using this exact structure:

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
- confidence must be a numeric value between 0 and 1.
- Do not include markdown.
- Do not include explanations.
- Return JSON only.
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

            response_format = new
            {
                type = "json_object"
            },

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
                    $"DeepSeek Voice Expense Error: {responseContent}"
                );

                throw new Exception(
                    $"DeepSeek Voice Expense request failed: " +
                    $"{response.StatusCode}"
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
                    "DeepSeek returned no Voice Expense choices."
                );
            }

            var firstChoice = choices[0];

            if (!firstChoice.TryGetProperty(
                    "message",
                    out var message))
            {
                throw new Exception(
                    "DeepSeek returned no Voice Expense message."
                );
            }

            if (!message.TryGetProperty(
                    "content",
                    out var contentElement) ||
                contentElement.ValueKind != JsonValueKind.String)
            {
                throw new Exception(
                    "DeepSeek returned no Voice Expense content."
                );
            }

            var result = contentElement.GetString();

            if (string.IsNullOrWhiteSpace(result))
            {
                throw new Exception(
                    "DeepSeek returned empty Voice Expense content."
                );
            }

            // ==========================================
            // CLEAN RESPONSE
            // ==========================================

            var cleanResult = result
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();

            var jsonStart =
                cleanResult.IndexOf('{');

            var jsonEnd =
                cleanResult.LastIndexOf('}');

            if (jsonStart == -1 ||
                jsonEnd == -1 ||
                jsonEnd <= jsonStart)
            {
                throw new Exception(
                    $"DeepSeek returned invalid expense JSON: " +
                    $"{cleanResult}"
                );
            }

            var json = cleanResult.Substring(
                jsonStart,
                jsonEnd - jsonStart + 1
            );

            // ==========================================
            // VALIDATE JSON
            // ==========================================

            using var validatedJson =
                JsonDocument.Parse(json);

            Console.WriteLine(
                "Voice Expense successfully parsed using DeepSeek."
            );

            return json;
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine(
                "DeepSeek Voice Expense timed out."
            );

            throw new Exception(
                "DeepSeek Voice Expense request timed out."
            );
        }
    }
}