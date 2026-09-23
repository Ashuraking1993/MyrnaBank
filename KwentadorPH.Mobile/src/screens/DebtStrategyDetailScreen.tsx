import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
} from "react-native";

import { useCallback, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";

import {
  getDebtRecommendation,
  getDebtStrategyComparison,
  getDebtAICoach,
} from "../services/api";

type StrategyResult = {
  strategy: string;
  monthsToDebtFree: number;
  totalInterestPaid: number;
  totalAmountPaid: number;
  estimatedDebtFreeDate: string;
  payoffOrder: string[];
};

type Recommendation = {
  recommendedStrategy: string;
  reason: string;
  totalDebt: number;
  monthlyDebtBudget: number;
  extraMonthlyPayment: number;
  interestSaved: number;
  monthsSaved: number;
  monthsToDebtFree: number;
  estimatedDebtFreeDate: string;
  totalInterestPaid: number;
  totalAmountPaid: number;
  payoffOrder: string[];
  strategies?: StrategyResult[];
};

type StrategyComparison = {
  totalDebt: number;
  totalMinimumPayments: number;
  extraMonthlyPayment: number;
  snowball: StrategyResult;
  avalanche: StrategyResult;
  cashFlow: StrategyResult;
  hybrid: StrategyResult;
};

type AICoach = {
  recommendedStrategy: string;
  coachMessage: string;
  aiGenerated?: boolean;
  monthsToDebtFree: number;
  estimatedDebtFreeDate: string;
  totalInterestPaid: number;
  interestSaved: number;
  payoffOrder: string[];
};

export default function DebtStrategyDetailScreen() {
  const navigation = useNavigation<any>();

  const [recommendation, setRecommendation] =
    useState<Recommendation | null>(null);

  const [comparison, setComparison] =
    useState<StrategyComparison | null>(null);

  const [aiCoach, setAiCoach] =
    useState<AICoach | null>(null);

  const [loading, setLoading] = useState(true);

  const extraMonthlyPayment = 3000;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Core deterministic data first.
      const [recommendationData, comparisonData] =
        await Promise.all([
          getDebtRecommendation(extraMonthlyPayment),
          getDebtStrategyComparison(extraMonthlyPayment),
        ]);

      setRecommendation(recommendationData);
      setComparison(comparisonData);

      // AI is optional.
      // If OpenRouter is unavailable, the screen still works.
      try {
        const aiData =
          await getDebtAICoach(extraMonthlyPayment);

        setAiCoach(aiData);
      } catch (error) {
        console.log(
          "Debt Strategy AI unavailable:",
          error
        );

        setAiCoach(null);
      }
    } catch (error) {
      console.log(
        "Debt Strategy Detail Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const formatMoney = (value?: number) => {
    return `₱${Number(value ?? 0).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );
  };

  const coachText =
    aiCoach?.coachMessage ??
    recommendation?.reason ??
    "Your strategy was selected using your current balances, interest rates, and payment plan.";

  const strategies: StrategyResult[] =
    comparison
      ? [
          comparison.snowball,
          comparison.avalanche,
          comparison.cashFlow,
          comparison.hybrid,
        ]
      : [];

  const recommendedInterest =
    recommendation?.totalInterestPaid ?? 0;

  if (loading && !recommendation) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Analyzing your debt plan...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
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

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Why This Plan?
            </Text>

            <Text style={styles.subtitle}>
              Your personalized debt payoff strategy
            </Text>
          </View>
        </View>

        {/* RECOMMENDED STRATEGY */}

        <ImageBackground
          source={require("../../assets/images/debt-plan-bg.png")}
          style={styles.heroCard}
          imageStyle={styles.heroCardBackground}
          resizeMode="cover"
            >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>
                RECOMMENDED STRATEGY
              </Text>

              <Text style={styles.heroTitle}>
                {recommendation?.recommendedStrategy ??
                  "—"}
              </Text>
            </View>

            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedBadgeText}>
                BEST PLAN
              </Text>
            </View>
          </View>

          <Text style={styles.heroDescription}>
            {recommendation?.reason ??
              "Calculating your recommended debt strategy."}
          </Text>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>
                Debt Free
              </Text>

              <Text style={styles.heroStatValue}>
                {recommendation?.monthsToDebtFree ?? 0} months
              </Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>
                Interest Saved
              </Text>

              <Text style={styles.heroStatValue}>
                {formatMoney(
                  recommendation?.interestSaved
                )}
              </Text>
            </View>
          </View>

          <Text style={styles.debtFreeDate}>
            Estimated debt-free date:{" "}
            {formatDate(
              recommendation?.estimatedDebtFreeDate
            )}
          </Text>
       </ImageBackground>

        {/* WHY THIS PLAN */}

        <Text style={styles.sectionTitle}>
          WHY THIS PLAN?
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>✓</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Lower projected interest
            </Text>

            <Text style={styles.infoText}>
              Your current strategy is selected using
              the calculated payoff period and projected
              total interest from your debt profile.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>₱</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Fixed monthly debt budget
            </Text>

            <Text style={styles.infoText}>
              Your plan uses{" "}
              {formatMoney(
                recommendation?.monthlyDebtBudget
              )}{" "}
              per month, including{" "}
              {formatMoney(
                recommendation?.extraMonthlyPayment
              )}{" "}
              in extra payments.
            </Text>
          </View>
        </View>

        {/* PAYOFF ORDER */}

        <Text style={styles.sectionTitle}>
          PAYOFF ORDER
        </Text>

        <View style={styles.sectionCard}>
          {recommendation?.payoffOrder?.map(
            (debtName, index) => (
              <View
                key={`${debtName}-${index}`}
                style={[
                  styles.payoffRow,
                  index ===
                    recommendation.payoffOrder.length -
                      1 && styles.lastRow,
                ]}
              >
                <View style={styles.orderNumber}>
                  <Text style={styles.orderNumberText}>
                    {index + 1}
                  </Text>
                </View>

                <View style={styles.payoffContent}>
                  <Text style={styles.payoffName}>
                    {debtName}
                  </Text>

                  <Text style={styles.payoffHint}>
                    {index === 0
                      ? "Focus debt"
                      : "Next in payoff sequence"}
                  </Text>
                </View>

                {index === 0 && (
                  <View style={styles.focusBadge}>
                    <Text style={styles.focusBadgeText}>
                      FIRST
                    </Text>
                  </View>
                )}
              </View>
            )
          )}
        </View>

        {/* STRATEGY TRADE-OFFS */}

        <Text style={styles.sectionTitle}>
          STRATEGY TRADE-OFFS
        </Text>

        <View style={styles.sectionCard}>
          {strategies.map((strategy, index) => {
            const isRecommended =
              strategy.strategy ===
              recommendation?.recommendedStrategy;

            const difference =
              strategy.totalInterestPaid -
              recommendedInterest;

            return (
              <View
                key={strategy.strategy}
                style={[
                  styles.strategyRow,
                  isRecommended &&
                    styles.strategyRowRecommended,
                  index === strategies.length - 1 &&
                    styles.lastRow,
                ]}
              >
                <View style={styles.strategyContent}>
                  <View style={styles.strategyTitleRow}>
                    <Text style={styles.strategyName}>
                      {strategy.strategy}
                    </Text>

                    {isRecommended && (
                      <View style={styles.smallBadge}>
                        <Text
                          style={styles.smallBadgeText}
                        >
                          RECOMMENDED
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.strategyMeta}>
                    {strategy.monthsToDebtFree} months •{" "}
                    {formatMoney(
                      strategy.totalInterestPaid
                    )}{" "}
                    interest
                  </Text>
                </View>

                <View style={styles.differenceBox}>
                  {isRecommended ? (
                    <Text style={styles.bestText}>
                      Best
                    </Text>
                  ) : (
                    <>
                      <Text
                        style={styles.differenceLabel}
                      >
                        Extra interest
                      </Text>

                      <Text
                        style={styles.differenceValue}
                      >
                        +{formatMoney(difference)}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* AI / SMART COACH */}

        <Text style={styles.sectionTitle}>
          KWENTADOR DEBT COACH
        </Text>

        <View style={styles.coachCard}>
          <View style={styles.coachHeader}>
            <View style={styles.coachIcon}>
              <Text style={styles.coachIconText}>
                AI
              </Text>
            </View>

            <View style={styles.coachHeaderText}>
              <Text style={styles.coachTitle}>
                {aiCoach?.aiGenerated
                  ? "AI Coach Insight"
                  : "Smart Plan Insight"}
              </Text>

              <Text style={styles.coachStatus}>
                {aiCoach?.aiGenerated
                  ? "AI-generated explanation"
                  : "Based on calculated strategy"}
              </Text>
            </View>
          </View>

          <Text style={styles.coachMessage}>
            {coachText}
          </Text>
        </View>

        {/* SUMMARY */}

        <Text style={styles.sectionTitle}>
          PLAN SUMMARY
        </Text>

        <View style={styles.summaryCard}>
          <SummaryRow
            label="Current Debt"
            value={formatMoney(
              recommendation?.totalDebt
            )}
          />

          <SummaryRow
            label="Monthly Debt Budget"
            value={formatMoney(
              recommendation?.monthlyDebtBudget
            )}
          />

          <SummaryRow
            label="Projected Interest"
            value={formatMoney(
              recommendation?.totalInterestPaid
            )}
          />

          <SummaryRow
            label="Debt-Free"
            value={
              recommendation
                ? `${recommendation.monthsToDebtFree} months`
                : "—"
            }
          />

          <SummaryRow
            label="Target Date"
            value={formatDate(
              recommendation?.estimatedDebtFreeDate
            )}
            last
          />
        </View>

        <Text style={styles.disclaimer}>
          Projections are estimates based on your
          current debt balances, interest rates and
          payment assumptions. Actual results may vary.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.summaryRow,
        last && styles.lastRow,
      ]}
    >
      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text style={styles.summaryValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
safe: {
  flex: 1,
  backgroundColor: "#FFF0E3",
},

  container: {
    flex: 1,
  },

  content: {
    padding: 12,
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },

backText: {
  fontSize: 28,
  lineHeight: 29,
  color: "#FF6A00",
  fontWeight: "500",
},

  headerText: {
    flex: 1,
  },

title: {
  fontSize: 19,
  fontWeight: "900",
  color: "#1F2937",
},

  subtitle: {
    marginTop: 2,
    fontSize: 10,
    color: "#748198",
    fontWeight: "600",
  },

heroCard: {
  borderRadius: 10,
  padding: 14,
  marginBottom: 14,
  overflow: "hidden",
},

heroCardBackground: {
  borderRadius: 10,
},

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  heroLabel: {
    fontSize: 8,
    fontWeight: "900",
    color: "#D9E8FF",
    letterSpacing: 0.8,
  },

  heroTitle: {
    marginTop: 3,
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  recommendedBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

recommendedBadgeText: {
  fontSize: 7,
  fontWeight: "900",
  color: "#FF6A00",
},


  heroDescription: {
    marginTop: 8,
    color: "#EAF2FF",
    fontSize: 10,
    lineHeight: 15,
    fontWeight: "600",
  },

  heroStats: {
    flexDirection: "row",
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: 10,
  },

  heroStat: {
    flex: 1,
  },

  heroDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 10,
  },

  heroStatLabel: {
    fontSize: 8,
    color: "#D9E8FF",
    fontWeight: "700",
  },

  heroStatValue: {
    marginTop: 2,
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "900",
  },

  debtFreeDate: {
    marginTop: 8,
    color: "#D9E8FF",
    fontSize: 9,
    fontWeight: "700",
  },

  sectionTitle: {
    marginTop: 4,
    marginBottom: 7,
    fontSize: 9,
    fontWeight: "900",
    color: "#748198",
    letterSpacing: 0.7,
  },

  infoCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 7,
    borderWidth: 1,
    borderColor: "#E7EBF2",
  },

infoIcon: {
  width: 30,
  height: 30,
  borderRadius: 10,
  backgroundColor: "#FFF1E6",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 9,
},

infoIconText: {
  color: "#FF6A00",
  fontSize: 13,
  fontWeight: "900",
},
  infoContent: {
    flex: 1,
  },

infoTitle: {
  fontSize: 11,
  fontWeight: "900",
  color: "#1F2937",
},


  infoText: {
    marginTop: 2,
    fontSize: 9,
    lineHeight: 14,
    color: "#667085",
    fontWeight: "500",
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E7EBF2",
    marginBottom: 14,
  },

  payoffRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },

orderNumber: {
  width: 28,
  height: 28,
  borderRadius: 10,
  backgroundColor: "#FFF1E6",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 9,
},

orderNumberText: {
  color: "#FF6A00",
  fontSize: 10,
  fontWeight: "900",
},

  payoffContent: {
    flex: 1,
  },

  payoffName: {
    color: "#172B4D",
    fontSize: 10,
    fontWeight: "800",
  },

  payoffHint: {
    marginTop: 2,
    color: "#8A94A6",
    fontSize: 8,
    fontWeight: "600",
  },

  focusBadge: {
    borderRadius: 10,
    backgroundColor: "#FFF0F1",
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  focusBadgeText: {
    color: "#EF3340",
    fontSize: 7,
    fontWeight: "900",
  },

  strategyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },

strategyRowRecommended: {
  backgroundColor: "#FFF7F1",
  marginHorizontal: -10,
  paddingHorizontal: 10,
},


  strategyContent: {
    flex: 1,
  },

  strategyTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  strategyName: {
    fontSize: 11,
    fontWeight: "900",
    color: "#172B4D",
  },

  strategyMeta: {
    marginTop: 3,
    fontSize: 8,
    color: "#7B879A",
    fontWeight: "600",
  },

smallBadge: {
  marginLeft: 6,
  borderRadius: 10,
  paddingHorizontal: 6,
  paddingVertical: 3,
  backgroundColor: "#FFF1E6",
},


smallBadgeText: {
  fontSize: 6,
  fontWeight: "900",
  color: "#FF6A00",
},

  differenceBox: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  differenceLabel: {
    fontSize: 7,
    color: "#9A6570",
    fontWeight: "600",
  },

  differenceValue: {
    marginTop: 2,
    fontSize: 9,
    color: "#EF3340",
    fontWeight: "900",
  },


bestText: {
  fontSize: 9,
  color: "#FF6A00",
  fontWeight: "900",
},


coachCard: {
  backgroundColor: "#FFF1E6",
  borderRadius: 10,
  padding: 12,
  borderWidth: 1,
  borderColor: "#FFD8BD",
  marginBottom: 14,
},

  coachHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

coachIcon: {
  width: 34,
  height: 34,
  borderRadius: 10,
  backgroundColor: "#FF6A00",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 9,
},

  coachIconText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  coachHeaderText: {
    flex: 1,
  },

coachTitle: {
  color: "#1F2937",
  fontSize: 11,
  fontWeight: "900",
},

coachStatus: {
  marginTop: 1,
  color: "#A65A2E",
  fontSize: 8,
  fontWeight: "600",
},


coachMessage: {
  marginTop: 9,
  color: "#4B5563",
  fontSize: 10,
  lineHeight: 15,
  fontWeight: "600",
},


  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E7EBF2",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1F5",
  },

  summaryLabel: {
    color: "#758196",
    fontSize: 9,
    fontWeight: "600",
  },

  summaryValue: {
    color: "#172B4D",
    fontSize: 10,
    fontWeight: "900",
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  disclaimer: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 4,
    color: "#98A2B3",
    fontSize: 8,
    lineHeight: 12,
    textAlign: "center",
  },



});