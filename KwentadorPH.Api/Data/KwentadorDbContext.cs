using KwentadorPH.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace KwentadorPH.Api.Data;

public class KwentadorDbContext : DbContext
{
    public KwentadorDbContext(DbContextOptions<KwentadorDbContext> options)
        : base(options)
    {
    }

    public DbSet<FinancialInstitution> FinancialInstitutions => Set<FinancialInstitution>();
    public DbSet<FinancialAccount> FinancialAccounts => Set<FinancialAccount>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<FinancialGoal> FinancialGoals => Set<FinancialGoal>();

    public DbSet<DebtAccount> DebtAccounts => Set<DebtAccount>();
    public DbSet<DebtPayment> DebtPayments => Set<DebtPayment>();

    public DbSet<RegulatoryUpdate> RegulatoryUpdates { get; set; }
    public DbSet<RegulatoryImpact> RegulatoryImpacts { get; set; }
    public DbSet<GoalContribution> GoalContributions
    => Set<GoalContribution>();
    public DbSet<ExpenseCategory> ExpenseCategories { get; set; }

    public DbSet<Transfer> Transfers { get; set; }

    public DbSet<SentinelRiskAssessment> SentinelRiskAssessments { get; set; }

    public DbSet<SentinelRiskSignal> SentinelRiskSignals { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    modelBuilder.Entity<FinancialInstitution>().HasData(
        new FinancialInstitution
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Name = "GCash",
            ShortName = "GCash",
            InstitutionType = "EWallet",
            IsActive = true
        },
        new FinancialInstitution
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Name = "Maya",
            ShortName = "Maya",
            InstitutionType = "DigitalBank",
            IsActive = true
        },
        new FinancialInstitution
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "GoTyme Bank",
            ShortName = "GoTyme",
            InstitutionType = "DigitalBank",
            IsActive = true
        },
        new FinancialInstitution
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            Name = "CIMB Bank Philippines",
            ShortName = "CIMB",
            InstitutionType = "DigitalBank",
            IsActive = true
        },
        new FinancialInstitution
        {
            Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
            Name = "MariBank Philippines",
            ShortName = "MariBank",
            InstitutionType = "DigitalBank",
            IsActive = true
        },
        new FinancialInstitution
        {
            Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
            Name = "Bank of the Philippine Islands",
            ShortName = "BPI",
            InstitutionType = "Bank",
            IsActive = true
        },
        new FinancialInstitution
        {
            Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
            Name = "BDO Unibank",
            ShortName = "BDO",
            InstitutionType = "Bank",
            IsActive = true
        },
        new FinancialInstitution
        {
            Id = Guid.Parse("88888888-8888-8888-8888-888888888888"),
            Name = "Metrobank",
            ShortName = "Metrobank",
            InstitutionType = "Bank",
            IsActive = true
        }

        
    );
        modelBuilder.Entity<ExpenseCategory>().HasData(
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000001"), Name = "Food & Dining", Icon = "🍔" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000002"), Name = "Transportation", Icon = "🚌" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000003"), Name = "Groceries", Icon = "🛒" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000004"), Name = "Bills & Utilities", Icon = "💡" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000005"), Name = "Shopping", Icon = "🛍️" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000006"), Name = "Travel & Fares", Icon = "✈️" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000007"), Name = "Health & Medical", Icon = "❤️" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000008"), Name = "Clothing", Icon = "👕" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000009"), Name = "Entertainment", Icon = "🎮" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000010"), Name = "Education", Icon = "📚" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000011"), Name = "Housing", Icon = "🏠" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000012"), Name = "Subscriptions", Icon = "📱" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000013"), Name = "Personal Care", Icon = "💇" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000014"), Name = "Insurance", Icon = "🛡️" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000015"), Name = "Pets", Icon = "🐾" },
        new ExpenseCategory { Id = Guid.Parse("10000000-0000-0000-0000-000000000016"), Name = "Others", Icon = "💰" }
        
    );

    modelBuilder.Entity<DebtAccount>()
    .HasMany(d => d.Payments)
    .WithOne(p => p.DebtAccount)
    .HasForeignKey(p => p.DebtAccountId)
    .OnDelete(DeleteBehavior.Cascade);

    modelBuilder.Entity<DebtAccount>()
    .Property(d => d.OriginalBalance)
    .HasPrecision(18, 2);

    modelBuilder.Entity<DebtAccount>()
    .Property(d => d.CurrentBalance)
    .HasPrecision(18, 2);

    modelBuilder.Entity<DebtAccount>()
    .Property(d => d.InterestRate)
    .HasPrecision(8, 4);

    modelBuilder.Entity<DebtAccount>()
    .Property(d => d.MinimumPayment)
    .HasPrecision(18, 2);

    modelBuilder.Entity<DebtPayment>()
    .Property(p => p.Amount)
    .HasPrecision(18, 2);





}


}

