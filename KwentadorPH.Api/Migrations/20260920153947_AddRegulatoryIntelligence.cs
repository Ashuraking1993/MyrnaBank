using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KwentadorPH.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRegulatoryIntelligence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RegulatoryUpdates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Regulator = table.Column<string>(type: "text", nullable: false),
                    ReferenceNumber = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Summary = table.Column<string>(type: "text", nullable: false),
                    PublishedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ImpactLevel = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    DetectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegulatoryUpdates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RegulatoryImpacts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RegulatoryUpdateId = table.Column<Guid>(type: "uuid", nullable: false),
                    SystemName = table.Column<string>(type: "text", nullable: false),
                    ImpactDescription = table.Column<string>(type: "text", nullable: false),
                    RequiredAction = table.Column<string>(type: "text", nullable: false),
                    RiskLevel = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegulatoryImpacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegulatoryImpacts_RegulatoryUpdates_RegulatoryUpdateId",
                        column: x => x.RegulatoryUpdateId,
                        principalTable: "RegulatoryUpdates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RegulatoryImpacts_RegulatoryUpdateId",
                table: "RegulatoryImpacts",
                column: "RegulatoryUpdateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RegulatoryImpacts");

            migrationBuilder.DropTable(
                name: "RegulatoryUpdates");
        }
    }
}
