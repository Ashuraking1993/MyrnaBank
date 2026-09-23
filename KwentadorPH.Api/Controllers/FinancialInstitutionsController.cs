using KwentadorPH.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinancialInstitutionsController : ControllerBase
{
    private readonly KwentadorDbContext _context;

    public FinancialInstitutionsController(KwentadorDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var institutions = await _context.FinancialInstitutions
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.ShortName,
                x.InstitutionType,
                x.LogoUrl
            })
            .ToListAsync();

        return Ok(institutions);
    }
}