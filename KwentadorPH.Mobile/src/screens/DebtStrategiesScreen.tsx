import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";

import { getDebtStrategyComparison } from "../services/api";

export default function DebtStrategiesScreen() {
  const navigation = useNavigation<any>();

  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStrategies = async () => {
      try {
        setLoading(true);

        const data = await getDebtStrategyComparison(3000);

        setComparison(data);
      } catch (error) {
        console.log("Debt Strategy Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStrategies();
  }, []);

  const formatMoney = (value: number) =>
    `₱${Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.title}>Payoff Strategies</Text>
            <Text style={styles.subtitle}>
              Compare ways to become debt-free
            </Text>
          </View>
        </View>

        {/* MONTHLY PLAN */}
        <ImageBackground
          source={require("../../assets/images/debt-strategy-bg.png")}
          style={styles.budgetCard}
          imageStyle={styles.budgetCardBackground}
          resizeMode="cover"
        >
          <View>
            <Text style={styles.budgetLabel}>TOTAL DEBT</Text>
            <Text style={styles.budgetValue}>
              {comparison
                ? formatMoney(comparison.totalDebt)
                : "--"}
            </Text>
          </View>

          <View style={styles.budgetRight}>
            <Text style={styles.budgetLabel}>EXTRA PAYMENT</Text>
            <Text style={styles.extraValue}>
              {comparison
                ? `+${formatMoney(comparison.extraMonthlyPayment)}`
                : "--"}
            </Text>
          </View>
       </ImageBackground>

        <Text style={styles.sectionTitle}>
          Strategy Comparison
        </Text>

        {loading ? (
          <Text style={styles.loadingText}>
            Calculating payoff strategies...
          </Text>
        ) : comparison ? (
          <>
            <StrategyCard
              icon="◉"
              title="Debt Snowball"
              subtitle="Smallest balance first"
              data={comparison.snowball}
              formatMoney={formatMoney}
            />

            <StrategyCard
              icon="↓"
              title="Debt Avalanche"
              subtitle="Highest interest first"
              data={comparison.avalanche}
              formatMoney={formatMoney}
              recommended
            />

            <StrategyCard
              icon="↗"
              title="Cash Flow"
              subtitle="Free monthly cash flow faster"
              data={comparison.cashFlow}
              formatMoney={formatMoney}
            />

            <StrategyCard
              icon="✦"
              title="AI Hybrid"
              subtitle="Balances interest, debt size & cash flow"
              data={comparison.hybrid}
              formatMoney={formatMoney}
              ai
            />
          </>
        ) : (
          <Text style={styles.loadingText}>
            Unable to load strategies.
          </Text>
        )}

        {/* EXPLANATION */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            How does this work?
          </Text>

          <Text style={styles.infoText}>
            Each strategy uses the same debts and extra monthly
            payment. The difference is which debt receives the
            additional payment first.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StrategyCard({
  icon,
  title,
  subtitle,
  data,
  formatMoney,
  recommended = false,
  ai = false,
}: any) {
  return (
    <View
      style={[
        styles.strategyCard,
        recommended && styles.recommendedCard,
      ]}
    >
      <View style={styles.strategyHeader}>
        <View
          style={[
            styles.strategyIcon,
            ai && styles.aiStrategyIcon,
          ]}
        >
          <Text
            style={[
              styles.strategyIconText,
              ai && styles.aiStrategyIconText,
            ]}
          >
            {icon}
          </Text>
        </View>

        <View style={styles.strategyInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.strategyTitle}>
              {title}
            </Text>

            {recommended && (
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>
                  LOWEST INTEREST
                </Text>
              </View>
            )}

            {ai && (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            )}
          </View>

          <Text style={styles.strategySubtitle}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>
            Debt Free
          </Text>

          <Text style={styles.metricValue}>
            {data.monthsToDebtFree} mo
          </Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>
            Interest
          </Text>

          <Text style={styles.metricValue}>
            {formatMoney(data.totalInterestPaid)}
          </Text>
        </View>

        <View style={styles.metric}>
          <Text style={styles.metricLabel}>
            Total Paid
          </Text>

          <Text style={styles.metricValue}>
            {formatMoney(data.totalAmountPaid)}
          </Text>
        </View>
      </View>

      <View style={styles.orderBox}>
        <Text style={styles.orderLabel}>
          PAYOFF ORDER
        </Text>

        <Text style={styles.orderText}>
          {data.payoffOrder.join("  →  ")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
safe: {
  flex: 1,
  backgroundColor: "#FFF0E3",
},

backText: {
  color: "#FF6A00",
  fontSize: 28,
  lineHeight: 30,
},


  content: {
    padding: 12,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },



title: {
  color: "#1F2937",
  fontSize: 18,
  fontWeight: "900",
},

  subtitle: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 2,
  },

 budgetCard: {
   borderRadius: 10,
   padding: 15,
   flexDirection: "row",
   justifyContent: "space-between",
   marginBottom: 16,
   overflow: "hidden",
 },

 budgetCardBackground: {
   borderRadius: 15,
 },

  budgetRight: {
    alignItems: "flex-end",
  },

  budgetLabel: {
    color: "#CFE1FF",
    fontSize: 8,
    fontWeight: "700",
  },

  budgetValue: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 4,
  },

  extraValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },

sectionTitle: {
  color: "#1F2937",
  fontSize: 14,
  fontWeight: "900",
  marginBottom: 9,
},

  loadingText: {
    color: "#64748B",
    fontSize: 11,
    textAlign: "center",
    paddingVertical: 30,
  },

  strategyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 13,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "#EDF1F7",
  },

  recommendedCard: {
    borderWidth: 1.5,
    borderColor: "#20AD77",
  },

  strategyHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

strategyIcon: {
  width: 38,
  height: 38,
  borderRadius: 11,
  backgroundColor: "#FFF1E6",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 9,
},

  aiStrategyIcon: {
    backgroundColor: "#FFF0F1",
  },


strategyIconText: {
  color: "#FF6A00",
  fontSize: 17,
  fontWeight: "900",
},


  aiStrategyIconText: {
    color: "#EF3340",
  },

  strategyInfo: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
  },

strategyTitle: {
  color: "#1F2937",
  fontSize: 12,
  fontWeight: "900",
},


  strategySubtitle: {
    color: "#94A3B8",
    fontSize: 8,
    marginTop: 2,
  },

  bestBadge: {
    backgroundColor: "#DDF8E9",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },

  bestBadgeText: {
    color: "#15965D",
    fontSize: 6,
    fontWeight: "900",
  },

  aiBadge: {
    backgroundColor: "#FFF0F1",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },

  aiBadgeText: {
    color: "#EF3340",
    fontSize: 6,
    fontWeight: "900",
  },

  metricsRow: {
    flexDirection: "row",
    marginTop: 13,
    backgroundColor: "#F8FAFD",
    borderRadius: 10,
    paddingVertical: 10,
  },

  metric: {
    flex: 1,
    alignItems: "center",
  },

  metricLabel: {
    color: "#94A3B8",
    fontSize: 7,
  },

  metricValue: {
    color: "#063B8F",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
  },

  orderBox: {
    marginTop: 10,
  },

  orderLabel: {
    color: "#94A3B8",
    fontSize: 7,
    fontWeight: "800",
  },

  orderText: {
    color: "#475569",
    fontSize: 8,
    lineHeight: 13,
    marginTop: 4,
  },

infoCard: {
  backgroundColor: "#FFF1E6",
  borderRadius: 12,
  padding: 13,
  marginTop: 3,
},


infoTitle: {
  color: "#FF6A00",
  fontSize: 11,
  fontWeight: "900",
},


  infoText: {
    color: "#475569",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },
});