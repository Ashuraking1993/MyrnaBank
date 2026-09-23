using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace KwentadorPH.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddExpenseCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExpenseCategories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Icon = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExpenseCategories", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ExpenseCategories",
                columns: new[] { "Id", "Icon", "IsActive", "Name" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), "🍔", true, "Food & Dining" },
                    { new Guid("10000000-0000-0000-0000-000000000002"), "🚌", true, "Transportation" },
                    { new Guid("10000000-0000-0000-0000-000000000003"), "🛒", true, "Groceries" },
                    { new Guid("10000000-0000-0000-0000-000000000004"), "💡", true, "Bills & Utilities" },
                    { new Guid("10000000-0000-0000-0000-000000000005"), "🛍️", true, "Shopping" },
                    { new Guid("10000000-0000-0000-0000-000000000006"), "✈️", true, "Travel & Fares" },
                    { new Guid("10000000-0000-0000-0000-000000000007"), "❤️", true, "Health & Medical" },
                    { new Guid("10000000-0000-0000-0000-000000000008"), "👕", true, "Clothing" },
                    { new Guid("10000000-0000-0000-0000-000000000009"), "🎮", true, "Entertainment" },
                    { new Guid("10000000-0000-0000-0000-000000000010"), "📚", true, "Education" },
                    { new Guid("10000000-0000-0000-0000-000000000011"), "🏠", true, "Housing" },
                    { new Guid("10000000-0000-0000-0000-000000000012"), "📱", true, "Subscriptions" },
                    { new Guid("10000000-0000-0000-0000-000000000013"), "💇", true, "Personal Care" },
                    { new Guid("10000000-0000-0000-0000-000000000014"), "🛡️", true, "Insurance" },
                    { new Guid("10000000-0000-0000-0000-000000000015"), "🐾", true, "Pets" },
                    { new Guid("10000000-0000-0000-0000-000000000016"), "💰", true, "Others" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExpenseCategories");
        }
    }
}
