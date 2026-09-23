namespace KwentadorPH.Api.Models;

public class FinancialInstitution
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;

    // Bank, DigitalBank, EWallet
    public string InstitutionType { get; set; } = string.Empty;

    public string? LogoUrl { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<FinancialAccount> Accounts { get; set; }
        = new List<FinancialAccount>();
}