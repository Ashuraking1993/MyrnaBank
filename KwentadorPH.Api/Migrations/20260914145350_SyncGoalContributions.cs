using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KwentadorPH.Api.Migrations
{
    /// <inheritdoc />
    public partial class SyncGoalContributions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GoalContribution_FinancialAccounts_FinancialAccountId",
                table: "GoalContribution");

            migrationBuilder.DropForeignKey(
                name: "FK_GoalContribution_FinancialGoals_FinancialGoalId",
                table: "GoalContribution");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GoalContribution",
                table: "GoalContribution");

            migrationBuilder.RenameTable(
                name: "GoalContribution",
                newName: "GoalContributions");

            migrationBuilder.RenameIndex(
                name: "IX_GoalContribution_FinancialGoalId",
                table: "GoalContributions",
                newName: "IX_GoalContributions_FinancialGoalId");

            migrationBuilder.RenameIndex(
                name: "IX_GoalContribution_FinancialAccountId",
                table: "GoalContributions",
                newName: "IX_GoalContributions_FinancialAccountId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GoalContributions",
                table: "GoalContributions",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GoalContributions_FinancialAccounts_FinancialAccountId",
                table: "GoalContributions",
                column: "FinancialAccountId",
                principalTable: "FinancialAccounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GoalContributions_FinancialGoals_FinancialGoalId",
                table: "GoalContributions",
                column: "FinancialGoalId",
                principalTable: "FinancialGoals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GoalContributions_FinancialAccounts_FinancialAccountId",
                table: "GoalContributions");

            migrationBuilder.DropForeignKey(
                name: "FK_GoalContributions_FinancialGoals_FinancialGoalId",
                table: "GoalContributions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GoalContributions",
                table: "GoalContributions");

            migrationBuilder.RenameTable(
                name: "GoalContributions",
                newName: "GoalContribution");

            migrationBuilder.RenameIndex(
                name: "IX_GoalContributions_FinancialGoalId",
                table: "GoalContribution",
                newName: "IX_GoalContribution_FinancialGoalId");

            migrationBuilder.RenameIndex(
                name: "IX_GoalContributions_FinancialAccountId",
                table: "GoalContribution",
                newName: "IX_GoalContribution_FinancialAccountId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GoalContribution",
                table: "GoalContribution",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GoalContribution_FinancialAccounts_FinancialAccountId",
                table: "GoalContribution",
                column: "FinancialAccountId",
                principalTable: "FinancialAccounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GoalContribution_FinancialGoals_FinancialGoalId",
                table: "GoalContribution",
                column: "FinancialGoalId",
                principalTable: "FinancialGoals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
