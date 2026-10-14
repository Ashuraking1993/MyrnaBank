using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace KwentadorPH.Api.Services;

public class OpenRouterReceiptService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public OpenRouterReceiptService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> AnalyzeReceiptAsync(
        IFormFile image)
    {
        var apiKey = _configuration["DeepSeek:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new Exception("DeepSeek API key is missing.");

        // ==========================================
        // CONVERT RECEIPT IMAGE TO BASE64
        // ==========================================

        using var memoryStream = new MemoryStream();

        await image.CopyToAsync(memoryStream);

        var imageBytes = memoryStream.ToArray();

        if (imageBytes.Length == 0)
            throw new Exception("Receipt image is empty.");

        var base64Image =
            Convert.ToBase64String(imageBytes);

        var mimeType =
            string.IsNullOrWhiteSpace(image.ContentType)
                ? "image/jpeg"
                : image.ContentType;

        var imageUrl =
            $"data:{mimeType};base64,{base64Image}";

        // ==========================================
        // PROMPT
        // ==========================================

        var prompt = """
Analyze this Philippine receipt.

Return ONLY valid JSON using this exact structure:

{
  "merchantName": "string",
  "description": "string",
  "amount": 0,
  "category": "string",
  "transactionDate": "yyyy-MM-dd",
  "confidence": 0.0
}

Category MUST be exactly one of:

Food & Dining
Transportation
Groceries
Bills & Utilities
Shopping
Travel & Fares
Health & Medical
Clothing
Entertainment
Education
Housing
Subscriptions
Personal Care
Insurance
Pets
Others

Rules for amount:
- Find the FINAL TOTAL or AMOUNT DUE paid by the customer.
- Do NOT use VAT, tax, service charge, discount, change,
  item price, quantity, tendered cash, or receipt number.
- If multiple monetary values exist, prioritize:
  GRAND TOTAL, TOTAL, AMOUNT DUE, or NET TOTAL.
- Return the amount as a numeric Philippine peso value.

Rules for transactionDate:
- Use the actual transaction date shown on the receipt.
- Return format yyyy-MM-dd.
- Do not invent a date if it cannot be read.

Rules for confidence:
- Must be a numeric value between 0 and 1.
- Lower the confidence when important receipt details
  are unclear or difficult to read.

Do not invent receipt information.
Do not include markdown.
Do not include explanations.
Return JSON only.
""";

        // ==========================================
        // DEEPSEEK VISION REQUEST
        // ==========================================

        var requestBody = new
        {
            model = "deepseek-flash",

            messages = new object[]
            {
                new
                {
                    role = "user",

                    content = new object[]
                    {
                        new
                        {
                            type = "text",
                            text = prompt
                        },

                        new
                        {
                            type = "image_url",

                            image_url = new
                            {
                                url = imageUrl,
                                detail = "original"
                            }
                        }
                    }
                }
            },

            // Receipt scanner needs structured JSON.
            response_format = new
            {
                type = "json_object"
            },

            // No extended reasoning required.
            thinking = new
            {
                type = "disabled"
            },

            max_tokens = 500
        };

        var json =
            JsonSerializer.Serialize(requestBody);

        using var request =
            new HttpRequestMessage(
                HttpMethod.Post,
                "https://api.deepseek.com/chat/completions"
            );

        request.Headers.Authorization =
            new AuthenticationHeaderValue(
                "Bearer",
                apiKey
            );

        request.Content =
            new StringContent(
                json,
                Encoding.UTF8,
                "application/json"
            );

        // Vision can take slightly longer than text AI.
        using var cts =
            new CancellationTokenSource(
                TimeSpan.FromSeconds(20)
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

            // ==========================================
            // API ERROR
            // ==========================================

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine(
                    $"DeepSeek Receipt Error: {responseContent}"
                );

                throw new Exception(
                    $"DeepSeek Receipt request failed: " +
                    $"{response.StatusCode}"
                );
            }

            // ==========================================
            // PARSE DEEPSEEK RESPONSE
            // ==========================================

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
                    "DeepSeek returned no receipt analysis."
                );
            }

            var firstChoice =
                choices[0];

            if (!firstChoice.TryGetProperty(
                    "message",
                    out var message))
            {
                throw new Exception(
                    "DeepSeek receipt response contains no message."
                );
            }

            if (!message.TryGetProperty(
                    "content",
                    out var contentElement) ||
                contentElement.ValueKind !=
                    JsonValueKind.String)
            {
                throw new Exception(
                    "DeepSeek receipt response contains no content."
                );
            }

            var result =
                contentElement.GetString();

            if (string.IsNullOrWhiteSpace(result))
            {
                throw new Exception(
                    "DeepSeek returned empty receipt analysis."
                );
            }

            // ==========================================
            // VERIFY THAT AI RETURNED VALID JSON
            // ==========================================

            try
            {
                using var validation =
                    JsonDocument.Parse(result);
            }
            catch (JsonException)
            {
                Console.WriteLine(
                    $"Invalid Receipt JSON: {result}"
                );

                throw new Exception(
                    "DeepSeek returned invalid receipt JSON."
                );
            }

            Console.WriteLine(
                "Receipt successfully analyzed using DeepSeek Vision."
            );

            return result.Trim();
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine(
                "DeepSeek Receipt Scanner timed out."
            );

            throw new Exception(
                "DeepSeek Receipt Scanner request timed out."
            );
        }
    }
}