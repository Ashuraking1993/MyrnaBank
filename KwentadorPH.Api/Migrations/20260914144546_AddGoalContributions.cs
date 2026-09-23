using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KwentadorPH.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGoalContributions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GoalContribution",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FinancialGoalId = table.Column<Guid>(type: "uuid", nullable: false),
                    FinancialAccountId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    ContributionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GoalContribution", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GoalContribution_FinancialAccounts_FinancialAccountId",
                        column: x => x.FinancialAccountId,
                        principalTable: "FinancialAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GoalContribution_FinancialGoals_FinancialGoalId",
                        column: x => x.FinancialGoalId,
                        principalTable: "FinancialGoals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GoalContribution_FinancialAccountId",
                table: "GoalContribution",
                column: "FinancialAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_GoalContribution_FinancialGoalId",
                table: "GoalContribution",
                column: "FinancialGoalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GoalContribution");
        }
    }
}
