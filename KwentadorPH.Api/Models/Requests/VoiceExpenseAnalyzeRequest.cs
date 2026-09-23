namespace KwentadorPH.Api.Models.Requests;

public class VoiceExpenseAnalyzeRequest
{
    public IFormFile Audio { get; set; } = null!;
}