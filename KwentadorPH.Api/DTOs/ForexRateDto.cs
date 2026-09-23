namespace KwentadorPH.Api.DTOs;

public class ForexRateDto
{
    public string FromCurrency { get; set; } = string.Empty;
    public string ToCurrency { get; set; } = string.Empty;

    public decimal Rate { get; set; }

    public DateTime? RateDate { get; set; }
}