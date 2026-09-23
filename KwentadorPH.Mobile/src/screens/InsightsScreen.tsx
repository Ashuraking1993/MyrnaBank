import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAIInsights } from "../services/api";

export default function InsightsScreen() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);

      const result = await getAIInsights();
      setData(result);
    } catch (error) {
      console.log("AI Insights Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const money = (value: number) =>
    `₱${Number(value || 0).toLocaleString()}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

         {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>
              Analyzing your finances...
            </Text>
          </View>
        ) : data ? (
          <>
          <View style={styles.aiCard}>
            <Image
              source={require("../../assets/images/kwentador-mascot.png")}
              style={styles.aiMascot}
              resizeMode="contain"
            />

            <View style={styles.aiContent}>
              <Text style={styles.aiLabel}>
                Myrna AI
              </Text>

              <Text style={styles.insight}>
                {data.insight}
              </Text>
            </View>
          </View>

            <View style={styles.alertCard}>
              <View style={styles.alertHeader}>
                <Text style={styles.alertIcon}>⚠️</Text>

                <View>
                  <Text style={styles.alertTitle}>
                    Spending Alert
                  </Text>

                  <Text style={styles.alertCategory}>
                    {data.topCategory}
                  </Text>
                </View>
              </View>

              <Text style={styles.alertText}>
                {data.spendingAlert}
              </Text>

              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>
                  {data.spendingPercentage}% of monthly income
                </Text>
              </View>
            </View>

            <View style={styles.savingsCard}>
              <Text style={styles.savingsTitle}>
                💰 Savings Opportunity
              </Text>

              <Text style={styles.savingsAmount}>
                {money(data.suggestedSavings)} / month
              </Text>

              <Text style={styles.savingsText}>
                {data.savingsOpportunity}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>
                Monthly Overview
              </Text>

              <View style={styles.row}>
                <Text>Income</Text>
                <Text style={styles.value}>
                  {money(data.monthlyIncome)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text>Expenses</Text>
                <Text style={styles.value}>
                  {money(data.monthlyExpenses)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text>Net Cash Flow</Text>
                <Text style={styles.value}>
                  {money(data.netCashFlow)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text>Top Spending</Text>
                <Text style={styles.value}>
                  {data.topCategory}
                </Text>
              </View>

              <Text style={styles.topAmount}>
                {money(data.topCategoryAmount)}
              </Text>
            </View>
          </>
        ) : (
          <Text>Unable to load insights.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: "#FFF7F1",
},

  content: {
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#123A8C",
  },

  subtitle: {
    marginTop: 4,
    color: "#64748B",
    marginBottom: 10,
  },

  loading: {
    alignItems: "center",
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 12,
    color: "#64748B",
  },



  aiLabel: {
    fontWeight: "800",
    color: "#1746A2",
    marginBottom: 12,
  },

  insight: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1E293B",
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 10,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 16,
    color: "#1E293B",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  value: {
    fontWeight: "700",
    color: "#123A8C",
  },

  topAmount: {
    textAlign: "right",
    fontSize: 12,
    color: "#64748B",
    marginTop: -8,
  },

alertCard: {
  backgroundColor: "#FFF8E7",
  padding: 18,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#F4D58D",
  marginBottom: 16,
},

alertHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
},

alertIcon: {
  fontSize: 24,
  marginRight: 10,
},

alertTitle: {
  fontSize: 16,
  fontWeight: "800",
  color: "#92400E",
},

alertCategory: {
  fontSize: 12,
  color: "#B45309",
},

alertText: {
  fontSize: 14,
  lineHeight: 21,
  color: "#78350F",
},

percentageBadge: {
  alignSelf: "flex-start",
  backgroundColor: "#FDE7B2",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 20,
  marginTop: 12,
},

percentageText: {
  fontSize: 12,
  fontWeight: "700",
  color: "#92400E",
},
savingsCard: {
  backgroundColor: "#ECFDF5",
  padding: 10,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#A7F3D0",
  marginBottom: 16,
},

savingsTitle: {
  fontSize: 13,
  fontWeight: "800",
  color: "#047857",
  marginBottom: 10,
},

savingsAmount: {
  fontSize: 15,
  fontWeight: "800",
  color: "#065F46",
  marginBottom: 8,
},

savingsText: {
  fontSize: 14,
  lineHeight: 21,
  color: "#065F46",
},

aiCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FFF1E6",
  borderRadius: 14,
  padding: 12,
  marginBottom: 16,
},

aiMascot: {
  width: 80,
  height: 90,
  marginRight: 10,
},

aiContent: {
  flex: 1,
},

aiLabel: {
  color: "#FF6A00",
  fontSize: 14,
  fontWeight: "900",
  marginBottom: 5,
},

insight: {
  color: "#667085",
  fontSize: 12,
  lineHeight: 18,
},

});