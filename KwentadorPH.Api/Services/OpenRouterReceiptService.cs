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
        var apiKey = _configuration["OpenRouter:ApiKey"];

        if (string.IsNullOrWhiteSpace(apiKey))
            throw new Exception("OpenRouter API key is missing.");

        using var memoryStream = new MemoryStream();
        await image.CopyToAsync(memoryStream);

        var base64Image =
            Convert.ToBase64String(memoryStream.ToArray());

        var mimeType = string.IsNullOrWhiteSpace(image.ContentType)
            ? "image/jpeg"
            : image.ContentType;

        var imageUrl =
            $"data:{mimeType};base64,{base64Image}";

        // API request natin next step
       var requestBody = new
{
    model = "openrouter/free",
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
                    text = """
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

                    For amount:
                    - Find the FINAL TOTAL or AMOUNT DUE paid by the customer.
                    - Do NOT use VAT, tax, service charge, discount, change, item price,
                    quantity, tendered cash, or receipt number as the amount.
                    - If multiple monetary values exist, prioritize GRAND TOTAL, TOTAL,
                    AMOUNT DUE, or NET TOTAL.
                    - Return the amount as a numeric Philippine peso value.

                    confidence must be between 0 and 1.
                    Do not include markdown or explanations.
                    confidence must be between 0 and 1.
                    Do not include markdown or explanations.
                    """
                },
                new
                {
                    type = "image_url",
                    image_url = new
                    {
                        url = imageUrl
                    }
                }
            }
        }
    }
};

var json = JsonSerializer.Serialize(requestBody);

using var request = new HttpRequestMessage(
    HttpMethod.Post,
    "https://openrouter.ai/api/v1/chat/completions"
);

request.Headers.Authorization =
    new AuthenticationHeaderValue("Bearer", apiKey);

request.Content = new StringContent(
    json,
    Encoding.UTF8,
    "application/json"
);

var response = await _httpClient.SendAsync(request);

var responseContent =
    await response.Content.ReadAsStringAsync();

if (!response.IsSuccessStatusCode)
{
    throw new Exception(
        $"OpenRouter error: {response.StatusCode} - {responseContent}"
    );
}

using var document = JsonDocument.Parse(responseContent);

var root = document.RootElement;

if (!root.TryGetProperty("choices", out var choices) ||
    choices.GetArrayLength() == 0)
{
    throw new Exception(
        $"Invalid OpenRouter response: {responseContent}"
    );
}

var message = choices[0].GetProperty("message");

if (!message.TryGetProperty("content", out var content))
{
    throw new Exception(
        $"OpenRouter content missing: {responseContent}"
    );
}

var result = content.GetString();

if (string.IsNullOrWhiteSpace(result))
{
    throw new Exception(
        $"OpenRouter returned empty content: {responseContent}"
    );
}

return result;
    }
}