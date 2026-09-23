import {
  Pressable,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Text,
  View,
} from "react-native";
import PieChart from "react-native-pie-chart";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import {
  getTransactions,
  getExpenseCategories,
} from "../services/api";


export default function ExpensesScreen() {

    const [expenses, setExpenses] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
      async function loadExpenses() {
        try {
          const transactions = await getTransactions();
          const categoryData = await getExpenseCategories();
          setCategories(categoryData);

          const expenseOnly = transactions.filter(
            (item: any) => item.transactionType === "Expense"
          );

          setExpenses(expenseOnly);
        } catch (error) {
          console.log("Expense API Error:", error);
        }
      }

      loadExpenses();
    }, []);

    const totalExpenses = expenses.reduce(
      (total, item) => total + Number(item.amount),
      0
    );

const categoryTotals = expenses.reduce(
  (result: Record<string, number>, item: any) => {
    const category = item.category || "Others";

    result[category] =
      (result[category] || 0) + Number(item.amount);

    return result;
  },
  {}
);

const topCategories = Object.entries(categoryTotals)
  .map(([name, amount]) => {
    const category = categories.find(
      (item: any) => item.name === name
    );

    return {
      name,
      amount,
      icon: category?.icon ?? "💰",
      percentage:
        totalExpenses > 0
          ? (amount / totalExpenses) * 100
          : 0,
    };
  })
  .sort((a, b) => b.amount - a.amount)
  .slice(0, 4);

const categoryColors: Record<string, string> = {
  "Food & Dining": "#EF4444",
  Transportation: "#3B82F6",
  Groceries: "#22C55E",
  "Bills & Utilities": "#F59E0B",
  Shopping: "#8B5CF6",
  "Travel & Fares": "#06B6D4",
  "Health & Medical": "#EC4899",
  Clothing: "#6366F1",
  Entertainment: "#F97316",
  Education: "#14B8A6",
  Housing: "#64748B",
  Subscriptions: "#A855F7",
  "Personal Care": "#FB7185",
  Insurance: "#0EA5E9",
  Pets: "#84CC16",
  Others: "#94A3B8",
};

const chartData = Object.entries(categoryTotals).map(
  ([category, value]) => ({
    value,
    color: categoryColors[category] || categoryColors.Others,
  })
);

  return (

     <SafeAreaView style={styles.container}>
       <ScrollView
         style={styles.scroll}
         contentContainerStyle={styles.content}
         showsVerticalScrollIndicator={false}
       >
         {/* HEADER */}
         <View style={styles.header}>
           <View>
             <Text style={styles.title}>Expenses</Text>
             <Text style={styles.subtitle}>
               Track where your money goes
             </Text>
           </View>

           <Pressable style={styles.monthButton}>
             <Text style={styles.monthText}>September 2026⌄</Text>
           </Pressable>
         </View>

         {/* TOTAL EXPENSE */}
        <ImageBackground
          source={require("../../assets/images/expenses-bg.png")}
          style={styles.totalCard}
          imageStyle={styles.totalCardBackground}
          resizeMode="cover"
        >
          <Text style={styles.totalLabel}>Total Expenses</Text>

          <Text style={styles.totalAmount}>
            ₱{totalExpenses.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>

          <View style={styles.compareRow}>
            <Text style={styles.compareText}>vs last month</Text>
            <Text style={styles.downText}>↓ -18%</Text>
          </View>
        </ImageBackground>

         {/* SPENDING BREAKDOWN */}
         <View style={styles.breakdownCard}>
           <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Spending Breakdown</Text>
             <Text style={styles.seeDetails}>See Details ›</Text>
           </View>

           <View style={styles.chartArea}>
             {/* TEMP PIE / DONUT */}
            <View style={styles.chartWrapper}>
              {chartData.length > 0 && (
                <PieChart
                  widthAndHeight={115}
                  series={chartData}
                  cover={{
                    radius: 0.62,
                    color: "#FFFFFF",
                  }}
                />
              )}

              <View style={styles.chartCenter}>
                <Text style={styles.donutAmount}>
                  ₱{totalExpenses.toLocaleString("en-PH")}
                </Text>
                <Text style={styles.donutLabel}>Total</Text>
              </View>
            </View>

            <View style={styles.legend}>
              {Object.entries(categoryTotals).map(([category, amount]) => {
                const percentage =
                  totalExpenses > 0
                    ? (amount / totalExpenses) * 100
                    : 0;

                return (
                  <View key={category} style={styles.legendRow}>
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor:
                            categoryColors[category] || categoryColors.Others,
                        },
                      ]}
                    />

                    <Text style={styles.legendName}>
                      {category}
                    </Text>

                    <Text style={styles.legendPercent}>
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                );
              })}
            </View>
           </View>
         </View>

         {/* TOP CATEGORIES */}
        <View style={styles.categoryGrid}>
          {topCategories.map((category) => (
            <View style={styles.categoryBox} key={category.name}>
              <Text style={styles.categoryEmoji}>
                {category.icon}
              </Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.categoryName}>
                  {category.name}
                </Text>

                <Text style={styles.categoryAmount}>
                  ₱{category.amount.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Text>

                <Text style={styles.categoryPercentage}>
                  {category.percentage.toFixed(1)}% of spending
                </Text>
              </View>
            </View>
          ))}
        </View>


         {/* RECENT EXPENSES */}
         <View style={styles.recentCard}>
           <View style={styles.sectionHeader}>
             <Text style={styles.sectionTitle}>Recent Expenses</Text>
             <Text style={styles.seeDetails}>See All ›</Text>
           </View>

           {expenses.map((item) => {
             const category = categories.find(
               (category: any) => category.name === item.category
             );

             const icon = category?.icon ?? "💰";

             const date = new Date(item.transactionDate).toLocaleDateString(
               "en-US",
               {
                 month: "short",
                 day: "numeric",
               }
             );

             return (
               <Pressable key={item.id} style={styles.transaction}>
                 <View style={styles.transactionIcon}>
                   <Text>{icon}</Text>
                 </View>

                 <View style={styles.transactionInfo}>
                   <Text style={styles.merchant}>
                     {item.merchantName || item.description}
                   </Text>

                   <Text style={styles.transactionCategory}>
                     {item.category} • {item.account?.institution}
                   </Text>
                 </View>

                 <View style={styles.transactionRight}>
                   <Text style={styles.transactionAmount}>
                     -₱
                     {Number(item.amount).toLocaleString("en-PH", {
                       minimumFractionDigits: 2,
                       maximumFractionDigits: 2,
                     })}
                   </Text>

                   <Text style={styles.transactionDate}>
                     {date}
                   </Text>
                 </View>
               </Pressable>
             );
           })}
         </View>
       </ScrollView>

       {/* FIXED BOTTOM NAV later */}
     </SafeAreaView>
   );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F1",
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 12,
    paddingBottom: 85,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },

  title: {
    color: "#063B8F",
    fontSize: 24,
    fontWeight: "900",
  },

  subtitle: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 2,
  },

  monthButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
  },

  monthText: {
    color: "#063B8F",
    fontSize: 9,
    fontWeight: "700",
  },

  totalCard: {
    backgroundColor: "#FF8A1F",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
  },

  totalLabel: {
    color: "#DCEAFF",
    fontSize: 11,
  },

  totalAmount: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 3,
  },

  compareRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },

  compareText: {
    color: "#DCEAFF",
    fontSize: 9,
  },

  downText: {
    color: "#6FFFC0",
    fontSize: 9,
    fontWeight: "800",
  },

  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 11,
    marginBottom: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionHeaderOutside: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },

  sectionTitle: {
    color: "#063B8F",
    fontSize: 13,
    fontWeight: "800",
  },

  seeDetails: {
    color: "#075FEA",
    fontSize: 9,
    fontWeight: "600",
  },

  chartArea: {
    flexDirection: "row",
    alignItems: "center",
  },

  donutOuter: {
    width: 115,
    height: 115,
    borderRadius: 58,
    borderWidth: 22,
    borderColor: "#FF5A63",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  donutInner: {
    alignItems: "center",
  },

  donutAmount: {
    color: "#063B8F",
    fontSize: 12,
    fontWeight: "900",
  },

  donutLabel: {
    color: "#64748B",
    fontSize: 8,
  },

  legend: {
    flex: 1,
  },

  legendItem: {
    color: "#334155",
    fontSize: 8,
    marginVertical: 2,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  categoryBox: {
    width: "49%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },

  categoryEmoji: {
    fontSize: 22,
    marginRight: 7,
  },

  categoryName: {
    color: "#334155",
    fontSize: 9,
    fontWeight: "600",
  },

  categoryAmount: {
    color: "#063B8F",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 1,
  },

  increase: {
    color: "#EF4444",
    fontSize: 8,
  },

  decrease: {
    color: "#16A66A",
    fontSize: 8,
  },

  recentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
  },

  transaction: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },

  transactionIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  transactionInfo: {
    flex: 1,
  },

  merchant: {
    color: "#1E3A5F",
    fontSize: 10,
    fontWeight: "700",
  },

  transactionCategory: {
    color: "#94A3B8",
    fontSize: 8,
  },

  transactionRight: {
    alignItems: "flex-end",
  },

  transactionAmount: {
    color: "#E43B45",
    fontSize: 10,
    fontWeight: "800",
  },

  transactionDate: {
    color: "#94A3B8",
    fontSize: 8,
  },

chartWrapper: {
  width: 115,
  height: 115,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
},

chartCenter: {
  position: "absolute",
  alignItems: "center",
  justifyContent: "center",
},

legendRow: {
  flexDirection: "row",
  alignItems: "center",
  marginVertical: 3,
},

legendDot: {
  width: 7,
  height: 7,
  borderRadius: 4,
  marginRight: 6,
},

legendName: {
  flex: 1,
  color: "#334155",
  fontSize: 8,
},

legendPercent: {
  color: "#063B8F",
  fontSize: 8,
  fontWeight: "800",
},

categoryPercentage: {
  color: "#64748B",
  fontSize: 8,
  marginTop: 2,
},

});