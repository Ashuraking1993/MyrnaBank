using Microsoft.AspNetCore.Mvc;
using KwentadorPH.Api.Models.Requests;
using KwentadorPH.Api.Services;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VoiceExpenseController : ControllerBase
{
    private readonly AudioConversionService _audioConverter;
    private readonly LocalWhisperService _whisperService;
    private readonly OpenRouterVoiceExpenseService _aiService;

  public VoiceExpenseController(
    AudioConversionService audioConverter,
    LocalWhisperService whisperService,
    OpenRouterVoiceExpenseService aiService)
{
    _audioConverter = audioConverter;
    _whisperService = whisperService;
    _aiService = aiService;
}

    [HttpPost("analyze")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Analyze(
        [FromForm] VoiceExpenseAnalyzeRequest request)
    {
        if (request.Audio == null ||
            request.Audio.Length == 0)
        {
            return BadRequest("Voice audio is required.");
        }

        string? wavPath = null;

        try
        {
            // M4A -> WAV
            wavPath =
                await _audioConverter.ConvertToWavAsync(
                    request.Audio
                );

            // WAV -> Text
            await using var wavStream =
                System.IO.File.OpenRead(wavPath);

          var transcript =
                await _whisperService.TranscribeAsync(
                    wavStream
                );

            var result =
                await _aiService.ParseExpenseAsync(
                    transcript
                );

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
        finally
        {
            if (wavPath != null &&
                System.IO.File.Exists(wavPath))
            {
                System.IO.File.Delete(wavPath);
            }
        }
    }
}