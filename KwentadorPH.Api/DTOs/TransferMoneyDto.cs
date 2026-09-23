namespace KwentadorPH.Api.DTOs;

public class TransferMoneyDto
{
    public Guid FromAccountId { get; set; }

    public Guid ToAccountId { get; set; }

    public decimal Amount { get; set; }

    public string? Description { get; set; }
}