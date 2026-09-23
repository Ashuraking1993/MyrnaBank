using System.Text.Json;
using KwentadorPH.Api.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ForexController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;

    public ForexController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("rate")]
    public async Task<ActionResult<ForexRateDto>> GetRate(
        string from,
        string to)
    {
        if (string.IsNullOrWhiteSpace(from) ||
            string.IsNullOrWhiteSpace(to))
        {
            return BadRequest("From and To currencies are required.");
        }

        from = from.Trim().ToUpperInvariant();
        to = to.Trim().ToUpperInvariant();

        if (from == to)
        {
            return Ok(new ForexRateDto
            {
                FromCurrency = from,
                ToCurrency = to,
                Rate = 1,
                RateDate = DateTime.UtcNow
            });
        }

        try
        {
            var client = _httpClientFactory.CreateClient();

            var url =
                $"https://api.frankfurter.dev/v2/rate/{from}/{to}";

            using var response = await client.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                return BadRequest(
                    $"Unable to retrieve exchange rate for {from}/{to}."
                );
            }

            var json = await response.Content.ReadAsStringAsync();

            using var document = JsonDocument.Parse(json);

            var root = document.RootElement;

            var rate = root.GetProperty("rate").GetDecimal();

            DateTime? rateDate = null;

            if (root.TryGetProperty("date", out var dateElement) &&
                DateTime.TryParse(
                    dateElement.GetString(),
                    out var parsedDate))
            {
                rateDate = parsedDate;
            }

            return Ok(new ForexRateDto
            {
                FromCurrency = from,
                ToCurrency = to,
                Rate = rate,
                RateDate = rateDate
            });
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                $"Forex service error: {ex.Message}"
            );
        }
    }

    [HttpGet("trend")]
public async Task<ActionResult<ForexTrendDto>> GetTrend(
    string from,
    string to,
    string period = "7D")
{
    if (string.IsNullOrWhiteSpace(from) ||
        string.IsNullOrWhiteSpace(to))
    {
        return BadRequest("From and To currencies are required.");
    }

    from = from.Trim().ToUpperInvariant();
    to = to.Trim().ToUpperInvariant();
    period = period.Trim().ToUpperInvariant();

    var endDate = DateTime.UtcNow.Date;

    var startDate = period switch
    {
        "7D" => endDate.AddDays(-7),
        "30D" => endDate.AddDays(-30),
        "3M" => endDate.AddMonths(-3),
        "1Y" => endDate.AddYears(-1),
        _ => endDate.AddDays(-7)
    };

    if (from == to)
    {
        return Ok(new ForexTrendDto
        {
            FromCurrency = from,
            ToCurrency = to,
            Period = period,
            CurrentRate = 1,
            LowRate = 1,
            HighRate = 1,
            ChangePercent = 0,
            Points = new List<ForexTrendPointDto>
            {
                new()
                {
                    Date = startDate,
                    Rate = 1
                },
                new()
                {
                    Date = endDate,
                    Rate = 1
                }
            }
        });
    }

    try
    {
        var client = _httpClientFactory.CreateClient();

        var start = startDate.ToString("yyyy-MM-dd");
        var end = endDate.ToString("yyyy-MM-dd");

        var url =
        $"https://api.frankfurter.dev/v2/rates" +
        $"?base={from}" +
        $"&quotes={to}" +
        $"&from={start}" +
        $"&to={end}";
        using var response = await client.GetAsync(url);

        if (!response.IsSuccessStatusCode)
        {
            return BadRequest(
                $"Unable to retrieve trend for {from}/{to}."
            );
        }

        var json =
            await response.Content.ReadAsStringAsync();

        using var document = JsonDocument.Parse(json);

        var points = new List<ForexTrendPointDto>();

        foreach (var item in document.RootElement.EnumerateArray())
        {
            if (!item.TryGetProperty("date", out var dateElement) ||
                !item.TryGetProperty("rate", out var rateElement))
            {
                continue;
            }

            if (!DateTime.TryParse(
                    dateElement.GetString(),
                    out var date))
            {
                continue;
            }

            points.Add(new ForexTrendPointDto
            {
                Date = date,
                Rate = rateElement.GetDecimal()
            });
        }

        points = points
            .OrderBy(x => x.Date)
            .ToList();

        if (points.Count == 0)
        {
            return NotFound(
                $"No trend data available for {from}/{to}."
            );
        }

        var firstRate = points.First().Rate;
        var currentRate = points.Last().Rate;

        var changePercent =
            firstRate == 0
                ? 0
                : ((currentRate - firstRate) / firstRate) * 100;

        return Ok(new ForexTrendDto
        {
            FromCurrency = from,
            ToCurrency = to,
            Period = period,

            CurrentRate = currentRate,
            LowRate = points.Min(x => x.Rate),
            HighRate = points.Max(x => x.Rate),

            ChangePercent =
                Math.Round(changePercent, 2),

            Points = points
        });
    }
    catch (Exception ex)
    {
        return StatusCode(
            500,
            $"Forex trend service error: {ex.Message}"
        );
    }
}
}