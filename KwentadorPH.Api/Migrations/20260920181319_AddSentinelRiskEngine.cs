using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KwentadorPH.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSentinelRiskEngine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SentinelRiskAssessments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TransferId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeviceRiskScore = table.Column<int>(type: "integer", nullable: false),
                    IdentityRiskScore = table.Column<int>(type: "integer", nullable: false),
                    BehaviorRiskScore = table.Column<int>(type: "integer", nullable: false),
                    TransactionRiskScore = table.Column<int>(type: "integer", nullable: false),
                    VelocityRiskScore = table.Column<int>(type: "integer", nullable: false),
                    OverallRiskScore = table.Column<int>(type: "integer", nullable: false),
                    RiskLevel = table.Column<string>(type: "text", nullable: false),
                    Decision = table.Column<string>(type: "text", nullable: false),
                    AssessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SentinelRiskAssessments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SentinelRiskAssessments_Transfers_TransferId",
                        column: x => x.TransferId,
                        principalTable: "Transfers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SentinelRiskSignals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SentinelRiskAssessmentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    Signal = table.Column<string>(type: "text", nullable: false),
                    Score = table.Column<int>(type: "integer", nullable: false),
                    Severity = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SentinelRiskSignals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SentinelRiskSignals_SentinelRiskAssessments_SentinelRiskAss~",
                        column: x => x.SentinelRiskAssessmentId,
                        principalTable: "SentinelRiskAssessments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SentinelRiskAssessments_TransferId",
                table: "SentinelRiskAssessments",
                column: "TransferId");

            migrationBuilder.CreateIndex(
                name: "IX_SentinelRiskSignals_SentinelRiskAssessmentId",
                table: "SentinelRiskSignals",
                column: "SentinelRiskAssessmentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SentinelRiskSignals");

            migrationBuilder.DropTable(
                name: "SentinelRiskAssessments");
        }
    }
}
