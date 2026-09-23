using Microsoft.AspNetCore.Mvc;
using KwentadorPH.Api.Services;
using KwentadorPH.Api.Models.Requests;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReceiptAnalyzerController : ControllerBase
{
    private readonly OpenRouterReceiptService _receiptService;

    public ReceiptAnalyzerController(
        OpenRouterReceiptService receiptService)
    {
        _receiptService = receiptService;
    }

    [HttpPost("analyze")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Analyze(
        [FromForm] ReceiptAnalyzeRequest request)
    {
        if (request.Image == null || request.Image.Length == 0)
        {
            return BadRequest("Receipt image is required.");
        }

        try
        {
            var result =
                await _receiptService.AnalyzeReceiptAsync(request.Image);

            return Content(
                result,
                "application/json"
            );
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = ex.Message
            });
        }
    }
}