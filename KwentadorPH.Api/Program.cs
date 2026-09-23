using KwentadorPH.Api.Data;
using Microsoft.EntityFrameworkCore;
using KwentadorPH.Api.Services;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<FinancialHealthService>();
builder.Services.AddHttpClient<OpenRouterReceiptService>();
builder.Services.AddHttpClient<OpenRouterVoiceExpenseService>();
builder.Services.AddSingleton<LocalWhisperService>();
builder.Services.AddSingleton<AudioConversionService>();
builder.Services.AddHttpClient<OpenRouterInsightsService>();
builder.Services.AddHttpClient<OpenRouterAIChatService>();
builder.Services.AddScoped<DebtStrategyService>();
builder.Services.AddHttpClient<OpenRouterDebtCoachService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<SentinelRiskService>();
builder.Services.AddDbContext<KwentadorDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();