using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KwentadorPH.Api.Data;

namespace KwentadorPH.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpenseCategoriesController : ControllerBase
{
   private readonly KwentadorDbContext _context;

    public ExpenseCategoriesController(KwentadorDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _context.ExpenseCategories
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Icon
            })
            .ToListAsync();

        return Ok(categories);
    }
}