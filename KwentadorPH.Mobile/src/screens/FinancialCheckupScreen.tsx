import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { getFinancialHealth } from "../services/api";

type Props = {
  navigation: any;
};

type FinancialHealth = {
  score: number;
  status: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  expenseRatio: number;
  monthsOfExpenses: number;
  monthlyDebtPayments: number;
  debtPaymentRatio: number;
};

export default function FinancialCheckupScreen({
  navigation,
}: Props) {
  const [health, setHealth] =
    useState<FinancialHealth | null>(null);

  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    try {
      setLoading(true);

      const data = await getFinancialHealth();

      setHealth(data);
    } catch (error) {
      console.log("Financial Checkup Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHealth();
    }, [])
  );

  const formatMoney = (value: number) =>
    `₱${Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#FF6A00"
        />

        <Text style={styles.loadingText}>
          Checking your financial health...
        </Text>
      </SafeAreaView>
    );
  }

  if (!health) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorTitle}>
          Unable to load Financial Checkup
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadHealth}
        >
          <Text style={styles.retryText}>
            Try Again
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const savingsScore =
    health.savingsRate >= 20
      ? 35
      : health.savingsRate >= 10
      ? 25
      : health.savingsRate > 0
      ? 15
      : 0;

  const spendingScore =
    health.expenseRatio <= 50
      ? 25
      : health.expenseRatio <= 70
      ? 18
      : health.expenseRatio <= 85
      ? 10
      : 5;

  const emergencyScore =
    health.monthsOfExpenses >= 6
      ? 25
      : health.monthsOfExpenses >= 3
      ? 20
      : health.monthsOfExpenses >= 1
      ? 10
      : 5;

  const debtScore =
    health.debtPaymentRatio <= 10
      ? 15
      : health.debtPaymentRatio <= 20
      ? 10
      : health.debtPaymentRatio <= 30
      ? 7
      : 3;

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>
            Financial Checkup
          </Text>

          <Text style={styles.headerSubtitle}>
            Your financial health at a glance
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* SCORE */}
        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.score}>
              {health.score}
            </Text>

            <Text style={styles.scoreTotal}>
              /100
            </Text>
          </View>

          <View style={styles.scoreInfo}>
            <Text style={styles.scoreLabel}>
              FINANCIAL HEALTH
            </Text>

            <Text style={styles.scoreStatus}>
              {health.status}
            </Text>

            <Text style={styles.scoreDescription}>
              Here's how your finances are performing
              this month.
            </Text>
          </View>
        </View>

        {/* HEALTH FACTORS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Health Factors
          </Text>

          <Text style={styles.sectionSubtitle}>
            What makes up your score
          </Text>
        </View>

        <View style={styles.factorCard}>
          <View style={styles.factorTop}>
            <View>
              <Text style={styles.factorTitle}>
                Savings
              </Text>

              <Text style={styles.factorDescription}>
                Monthly savings performance
              </Text>
            </View>

            <View style={styles.factorRight}>
              <Text style={styles.factorValue}>
                {health.savingsRate.toFixed(2)}%
              </Text>

              <Text style={styles.factorScore}>
                {savingsScore}/35
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    (savingsScore / 35) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.factorCard}>
          <View style={styles.factorTop}>
            <View>
              <Text style={styles.factorTitle}>
                Spending
              </Text>

              <Text style={styles.factorDescription}>
                Income used for monthly expenses
              </Text>
            </View>

            <View style={styles.factorRight}>
              <Text style={styles.factorValue}>
                {health.expenseRatio.toFixed(2)}%
              </Text>

              <Text style={styles.factorScore}>
                {spendingScore}/25
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    (spendingScore / 25) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.factorCard}>
          <View style={styles.factorTop}>
            <View>
              <Text style={styles.factorTitle}>
                Emergency Buffer
              </Text>

              <Text style={styles.factorDescription}>
                Months your balance can cover expenses
              </Text>
            </View>

            <View style={styles.factorRight}>
              <Text style={styles.factorValue}>
                {health.monthsOfExpenses.toFixed(2)}
              </Text>

              <Text style={styles.factorScore}>
                {emergencyScore}/25
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    (emergencyScore / 25) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.factorCard}>
          <View style={styles.factorTop}>
            <View>
              <Text style={styles.factorTitle}>
                Debt Load
              </Text>

              <Text style={styles.factorDescription}>
                Income committed to debt payments
              </Text>
            </View>

            <View style={styles.factorRight}>
              <Text style={styles.factorValue}>
                {health.debtPaymentRatio.toFixed(2)}%
              </Text>

              <Text style={styles.factorScore}>
                {debtScore}/15
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    (debtScore / 15) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* SNAPSHOT */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Financial Snapshot
          </Text>

          <Text style={styles.sectionSubtitle}>
            This month's key numbers
          </Text>
        </View>

        <View style={styles.snapshotGrid}>
          <View style={styles.snapshotCard}>
            <Text style={styles.snapshotLabel}>
              Monthly Income
            </Text>

            <Text style={styles.snapshotValue}>
              {formatMoney(health.monthlyIncome)}
            </Text>
          </View>

          <View style={styles.snapshotCard}>
            <Text style={styles.snapshotLabel}>
              Monthly Expenses
            </Text>

            <Text style={styles.snapshotValue}>
              {formatMoney(health.monthlyExpenses)}
            </Text>
          </View>

          <View style={styles.snapshotCard}>
            <Text style={styles.snapshotLabel}>
              Total Balance
            </Text>

            <Text style={styles.snapshotValue}>
              {formatMoney(health.totalBalance)}
            </Text>
          </View>

          <View style={styles.snapshotCard}>
            <Text style={styles.snapshotLabel}>
              Debt Payments
            </Text>

            <Text style={styles.snapshotValue}>
              {formatMoney(
                health.monthlyDebtPayments
              )}
            </Text>
          </View>
        </View>

        {/* AI DIAGNOSIS PLACEHOLDER */}
        <View style={styles.aiCard}>
          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>
              MYRNA AI
            </Text>
          </View>

          <Text style={styles.aiTitle}>
            Financial Diagnosis
          </Text>

          <Text style={styles.aiText}>
            Your financial score is calculated from
            your savings, spending, emergency buffer,
            and debt obligations. AI-powered guidance
            will help explain these results and suggest
            your next best financial actions.
          </Text>

          <View style={styles.aiNote}>
            <Text style={styles.aiNoteText}>
              AI recommendations coming next
            </Text>
          </View>
        </View>

        <View style={{ height: 25 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7F9",
  },

  content: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F7F9",
  },

  loadingText: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 10,
  },

  errorTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },

  retryButton: {
    backgroundColor: "#FF6A00",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 12,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },

  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },

  backText: {
    color: "#111827",
    fontSize: 30,
    lineHeight: 30,
  },

  headerTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900",
  },

  headerSubtitle: {
    color: "#7C8799",
    fontSize: 8,
    marginTop: 1,
  },

  scoreCard: {
    backgroundColor: "#FF6A00",
    borderRadius: 10,
    padding: 18,
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  scoreCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 7,
    borderColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },

  score: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
  },

  scoreTotal: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 13,
  },

  scoreInfo: {
    flex: 1,
    marginLeft: 17,
  },

  scoreLabel: {
    color: "#FFE4D1",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
  },

  scoreStatus: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 2,
  },

  scoreDescription: {
    color: "#FFF1E8",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },

  sectionHeader: {
    marginTop: 20,
    marginBottom: 9,
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#8A94A6",
    fontSize: 8,
    marginTop: 2,
  },

  factorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 13,
    marginBottom: 8,
  },

  factorTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  factorTitle: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "800",
  },

  factorDescription: {
    color: "#8A94A6",
    fontSize: 8,
    marginTop: 2,
  },

  factorRight: {
    alignItems: "flex-end",
  },

  factorValue: {
    color: "#FF6A00",
    fontSize: 13,
    fontWeight: "900",
  },

  factorScore: {
    color: "#94A3B8",
    fontSize: 8,
    marginTop: 1,
  },

  progressTrack: {
    height: 5,
    backgroundColor: "#F1F3F5",
    borderRadius: 10,
    marginTop: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#FF6A00",
    borderRadius: 10,
  },

  snapshotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  snapshotCard: {
    width: "48.5%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 13,
    marginBottom: 9,
  },

  snapshotLabel: {
    color: "#7C8799",
    fontSize: 8,
    fontWeight: "700",
  },

  snapshotValue: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 5,
  },

  aiCard: {
    backgroundColor: "#FFF7F1",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFE0CA",
    padding: 15,
    marginTop: 12,
  },

  aiBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FF6A00",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  aiBadgeText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  aiTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 9,
  },

  aiText: {
    color: "#64748B",
    fontSize: 9,
    lineHeight: 15,
    marginTop: 5,
  },

  aiNote: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 9,
    marginTop: 10,
  },

  aiNoteText: {
    color: "#FF6A00",
    fontSize: 8,
    fontWeight: "800",
  },
});