namespace KwentadorPH.Api.DTOs;

public class ForexTrendDto
{
    public string FromCurrency { get; set; } = string.Empty;
    public string ToCurrency { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;

    public decimal CurrentRate { get; set; }
    public decimal LowRate { get; set; }
    public decimal HighRate { get; set; }
    public decimal ChangePercent { get; set; }

    public List<ForexTrendPointDto> Points { get; set; } = new();
}

public class ForexTrendPointDto
{
    public DateTime Date { get; set; }
    public decimal Rate { get; set; }
}