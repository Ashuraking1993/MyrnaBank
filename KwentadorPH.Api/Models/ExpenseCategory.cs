namespace KwentadorPH.Api.Models;

public class ExpenseCategory
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public string Icon { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}