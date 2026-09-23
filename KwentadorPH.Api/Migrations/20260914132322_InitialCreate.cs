using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace KwentadorPH.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FinancialInstitutions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ShortName = table.Column<string>(type: "text", nullable: false),
                    InstitutionType = table.Column<string>(type: "text", nullable: false),
                    LogoUrl = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialInstitutions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FinancialAccounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FinancialInstitutionId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccountName = table.Column<string>(type: "text", nullable: false),
                    MaskedAccountNumber = table.Column<string>(type: "text", nullable: true),
                    AccountType = table.Column<string>(type: "text", nullable: false),
                    CurrentBalance = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    ConnectionType = table.Column<string>(type: "text", nullable: false),
                    IsConnected = table.Column<bool>(type: "boolean", nullable: false),
                    LastSyncedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FinancialAccounts_FinancialInstitutions_FinancialInstitutio~",
                        column: x => x.FinancialInstitutionId,
                        principalTable: "FinancialInstitutions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FinancialAccountId = table.Column<Guid>(type: "uuid", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    MerchantName = table.Column<string>(type: "text", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    TransactionType = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    IsAiCategorized = table.Column<bool>(type: "boolean", nullable: false),
                    AiConfidenceScore = table.Column<decimal>(type: "numeric", nullable: true),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_FinancialAccounts_FinancialAccountId",
                        column: x => x.FinancialAccountId,
                        principalTable: "FinancialAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "FinancialInstitutions",
                columns: new[] { "Id", "InstitutionType", "IsActive", "LogoUrl", "Name", "ShortName" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), "EWallet", true, null, "GCash", "GCash" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), "DigitalBank", true, null, "Maya", "Maya" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), "DigitalBank", true, null, "GoTyme Bank", "GoTyme" },
                    { new Guid("44444444-4444-4444-4444-444444444444"), "DigitalBank", true, null, "CIMB Bank Philippines", "CIMB" },
                    { new Guid("55555555-5555-5555-5555-555555555555"), "DigitalBank", true, null, "MariBank Philippines", "MariBank" },
                    { new Guid("66666666-6666-6666-6666-666666666666"), "Bank", true, null, "Bank of the Philippine Islands", "BPI" },
                    { new Guid("77777777-7777-7777-7777-777777777777"), "Bank", true, null, "BDO Unibank", "BDO" },
                    { new Guid("88888888-8888-8888-8888-888888888888"), "Bank", true, null, "Metrobank", "Metrobank" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_FinancialAccounts_FinancialInstitutionId",
                table: "FinancialAccounts",
                column: "FinancialInstitutionId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_FinancialAccountId",
                table: "Transactions",
                column: "FinancialAccountId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "FinancialAccounts");

            migrationBuilder.DropTable(
                name: "FinancialInstitutions");
        }
    }
}
