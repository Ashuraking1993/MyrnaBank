import {
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
  getDebtAccounts,
  getDebtRecommendation,
  getDebtAICoach,
} from "../services/api";



export default function DebtPlannerScreen() {
  const navigation = useNavigation<any>();
  const [aiCoach, setAiCoach] = useState<any>(null);

  const [debts, setDebts] = useState<any[]>([]);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

const loadDebtPlanner = useCallback(async () => {
  try {
    setLoading(true);

    const [
      debtData,
      recommendationData,
      aiCoachData,
    ] = await Promise.all([
      getDebtAccounts(),
      getDebtRecommendation(3000),
      getDebtAICoach(3000),
    ]);

    setDebts(debtData);
    setRecommendation(recommendationData);
    setAiCoach(aiCoachData);
  } catch (error) {
    console.log("Debt Planner Error:", error);
  } finally {
    setLoading(false);
  }
}, []);

useFocusEffect(
  useCallback(() => {
    loadDebtPlanner();
  }, [loadDebtPlanner])
);

const totalDebt = debts.reduce(
  (sum, debt) => sum + Number(debt.currentBalance || 0),
  0
);

const totalMinimumPayment = debts.reduce(
  (sum, debt) => sum + Number(debt.minimumPayment || 0),
  0
);

const averageInterest =
  debts.length > 0
    ? debts.reduce(
        (sum, debt) => sum + Number(debt.interestRate || 0),
        0
      ) / debts.length
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
     <ScrollView
       style={styles.scroll}
       contentContainerStyle={styles.content}
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
            <Text style={styles.title}>Smart Debt Planner</Text>
            <Text style={styles.subtitle}>AI-powered payoff strategy</Text>
          </View>

          <View style={styles.aiBadge}>

          </View>
        </View>

        {/* DEBT OVERVIEW */}
       <ImageBackground
         source={require("../../assets/images/debt-bg.png")}
         style={styles.overviewCard}
         imageStyle={styles.overviewCardBackground}
         resizeMode="cover"
       >
          <Text style={styles.overviewLabel}>TOTAL DEBT</Text>
          <Text style={styles.totalDebt}>
            ₱{totalDebt.toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>

          <View style={styles.overviewDivider} />

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Monthly Minimum</Text>
              <Text style={styles.statValue}>
                ₱{totalMinimumPayment.toLocaleString("en-PH")}
              </Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Active Debts</Text>
              <Text style={styles.statValue}>{debts.length}</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statLabel}>Avg. Interest</Text>
              <Text style={styles.warning}>
                {averageInterest.toFixed(1)}%
              </Text>
            </View>
          </View>
      </ImageBackground>

        {/* AI COACH */}
        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Text style={styles.aiIconText}>✦</Text>
          </View>

          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>Myrna Debt Coach</Text>

          <Text style={styles.aiStrategy}>
            {aiCoach?.recommendedStrategy
              ? `${aiCoach.recommendedStrategy} Strategy`
              : recommendation?.recommendedStrategy
              ? `${recommendation.recommendedStrategy} Strategy`
              : ""}
          </Text>

           <View style={styles.planActions}>
             <Pressable
               style={styles.whyPlanButton}
               onPress={() => navigation.navigate("DebtStrategyDetail")}
             >
               <Text style={styles.whyPlanButtonText}>
                 Why This Plan?
               </Text>
               <Text style={styles.buttonArrow}>→</Text>
             </Pressable>

             <Pressable
               style={styles.compareButton}
               onPress={() => navigation.navigate("DebtStrategies")}
             >
               <Text style={styles.compareButtonText}>
                 Compare Strategies
               </Text>
               <Text style={styles.compareArrow}>→</Text>
             </Pressable>
           </View>

          </View>
        </View>

        {/* PAYOFF FORECAST */}
        <View style={styles.forecastCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Debt-Free Forecast</Text>

            <View style={styles.strategyBadge}>
             <Text style={styles.strategyBadgeText}>
               {recommendation?.recommendedStrategy?.toUpperCase() || "ANALYZING"}
             </Text>
            </View>
          </View>

          <View style={styles.forecastRow}>
            <View>
              <Text style={styles.forecastLabel}>Debt free in</Text>
             <Text style={styles.months}>
               {recommendation
                 ? `${recommendation.monthsToDebtFree} months`
                 : "--"}
             </Text>
            </View>

            <View style={styles.forecastRight}>
              <Text style={styles.forecastLabel}>Estimated</Text>
              <Text style={styles.date}>May 2028</Text>
            </View>
          </View>

          <View style={styles.savingBox}>
            <Text style={styles.savingLabel}>Potential interest savings</Text>
           <Text style={styles.savingAmount}>
             {recommendation
               ? `₱${Number(
                   recommendation.interestSaved
                 ).toLocaleString("en-PH", {
                   minimumFractionDigits: 2,
                   maximumFractionDigits: 2,
                 })}`
               : "₱0.00"}
           </Text>
          </View>
        </View>

        {/* YOUR DEBTS */}
        <View style={styles.debtCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Debts</Text>
            <Text style={styles.viewAll}>
              {debts.length} active
            </Text>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>
              Loading debts...
            </Text>
          ) : debts.length === 0 ? (
            <Text style={styles.emptyText}>
              No active debts yet.
            </Text>
          ) : (
            debts.map((debt) => {
              const originalBalance = Number(debt.originalBalance || 0);
              const currentBalance = Number(debt.currentBalance || 0);

              const paidPercent =
                originalBalance > 0
                  ? ((originalBalance - currentBalance) / originalBalance) * 100
                  : 0;

              return (
               <Pressable
                 key={debt.id}
                 onPress={() =>
                   navigation.navigate("DebtDetail", {
                     debtId: debt.id,
                   })
                 }
               >
                 <DebtItem
                   name={debt.name}
                   type={debt.debtType}
                   balance={`₱${currentBalance.toLocaleString("en-PH")}`}
                   apr={`${Number(debt.interestRate).toFixed(0)}% APR`}
                   progress={Math.max(0, Math.min(100, paidPercent))}
                 />
               </Pressable>
              );
            })
          )}

         <Pressable
           style={styles.addButton}
           onPress={() => navigation.navigate("AddDebt")}
         >
           <Text style={styles.addButtonText}>＋ Add Debt</Text>
         </Pressable>
        </View>

        {/* WHAT IF */}
        <Pressable
          style={styles.whatIfCard}
          onPress={() => navigation.navigate("DebtWhatIf")}
        >
          <View>
            <Text style={styles.whatIfTitle}>What-If Simulator</Text>

            <Text style={styles.whatIfText}>
              See how extra payments can shorten your debt journey.
            </Text>
          </View>

          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function DebtItem({
  name,
  type,
  balance,
  apr,
  progress,
}: {
  name: string;
  type: string;
  balance: string;
  apr: string;
  progress: number;
}) {
  return (
    <View style={styles.debtItem}>
      <View style={styles.debtTop}>
        <View style={styles.debtIcon}>
          <Text style={styles.debtIconText}>₱</Text>
        </View>

        <View style={styles.debtInfo}>
          <Text style={styles.debtName}>{name}</Text>
          <Text style={styles.debtType}>{type}</Text>
        </View>

        <View style={styles.debtAmount}>
          <Text style={styles.balance}>{balance}</Text>
          <Text style={styles.apr}>{apr}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%` as `${number}%` },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F8FF",
  },

container: {
  flex: 1,
  backgroundColor: "#FFF0E3",
},

scroll: {
  flex: 1,
  backgroundColor: "#FFF0E3",
},


  content: {
    padding: 10,
    paddingBottom: 25,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    color: "#0646B8",
    fontSize: 28,
    lineHeight: 30,
  },

  headerText: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    color: "#FF6A00",
    fontSize: 18,
    fontWeight: "900",
  },

  subtitle: {
    color: "#64748B",
    fontSize: 10,
    marginTop: 2,
  },

  aiBadge: {
    backgroundColor: "#EAF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },

  aiBadgeText: {
    color: "#075FEA",
    fontSize: 10,
    fontWeight: "900",
  },

  overviewCard: {
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    overflow: "hidden",
  },

  overviewCardBackground: {
    borderRadius: 16,
  },

  overviewLabel: {
    color: "#CFE1FF",
    fontSize: 10,
    fontWeight: "900",
  },

  totalDebt: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
    marginTop: 4,
  },

  overviewDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginVertical: 10,
  },

  statsRow: {
    flexDirection: "row",
  },

  stat: {
    flex: 1,
  },

  statLabel: {
    color: "#CFE1FF",
    fontSize: 8,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },

  warning: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3,
  },

aiCard: {
  backgroundColor: "#FFF1E6",
  borderRadius: 14,
  padding: 14,
  flexDirection: "row",
  marginBottom: 10,
},

aiIcon: {
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: "#FF6A00",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 10,
},

  aiIconText: {
    color: "#FFFFFF",
    fontSize: 20,
  },

  aiContent: {
    flex: 1,
  },

aiTitle: {
  color: "#FF6A00",
  fontSize: 13,
  fontWeight: "900",
},

  aiMessage: {
    color: "#475569",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  viewPlanButton: {
    marginTop: 8,
  },

viewPlanText: {
  color: "#FF6A00",
  fontSize: 10,
  fontWeight: "800",
},

  forecastCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

sectionTitle: {
  color: "#1F2937",
  fontSize: 14,
  fontWeight: "900",
},

  strategyBadge: {
    backgroundColor: "#E7F8F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },

  strategyBadgeText: {
    color: "#15965D",
    fontSize: 7,
    fontWeight: "900",
  },

  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  forecastRight: {
    alignItems: "flex-end",
  },

  forecastLabel: {
    color: "#94A3B8",
    fontSize: 9,
  },

months: {
  color: "#1F2937",
  fontSize: 18,
  fontWeight: "900",
  marginTop: 2,
},

date: {
  color: "#1F2937",
  fontSize: 15,
  fontWeight: "800",
  marginTop: 3,
},

  savingBox: {
    backgroundColor: "#F0FAF6",
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  savingLabel: {
    color: "#64748B",
    fontSize: 9,
  },

  savingAmount: {
    color: "#15965D",
    fontSize: 11,
    fontWeight: "900",
  },

  debtCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  viewAll: {
    color: "#64748B",
    fontSize: 9,
  },

  debtItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },

  debtTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  debtIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFF0F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  debtIconText: {
    color: "#EF3340",
    fontWeight: "900",
  },

  debtInfo: {
    flex: 1,
  },

  debtName: {
    color: "#1E3A5F",
    fontSize: 10,
    fontWeight: "800",
  },

  debtType: {
    color: "#94A3B8",
    fontSize: 8,
    marginTop: 2,
  },

  debtAmount: {
    alignItems: "flex-end",
  },

  balance: {
    color: "#063B8F",
    fontSize: 10,
    fontWeight: "900",
  },

  apr: {
    color: "#E43B45",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 2,
  },

  progressTrack: {
    height: 4,
    backgroundColor: "#E8EDF5",
    borderRadius: 5,
    marginTop: 8,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#EF3340",
    borderRadius: 5,
  },

addButton: {
  height: 38,
  borderWidth: 1,
  borderColor: "#FFD8BD",
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 12,
},

addButtonText: {
  color: "#FF6A00",
  fontSize: 10,
  fontWeight: "800",
},

  whatIfCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

whatIfTitle: {
  color: "#1F2937",
  fontSize: 12,
  fontWeight: "900",
},

  whatIfText: {
    color: "#64748B",
    fontSize: 9,
    marginTop: 3,
  },

chevron: {
  color: "#FF6A00",
  fontSize: 25,
},

loadingText: {
  color: "#64748B",
  fontSize: 10,
  paddingVertical: 20,
  textAlign: "center",
},

emptyText: {
  color: "#94A3B8",
  fontSize: 10,
  paddingVertical: 20,
  textAlign: "center",
},

aiStrategy: {
  color: "#FF6A00",
  fontSize: 8,
  fontWeight: "900",
  marginTop: 5,
},
planActions: {
  marginTop: 10,
  gap: 8,
},

whyPlanButton: {
  width: "100%",
  height: 36,
  borderRadius: 10,
  backgroundColor: "#FF6A00",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 10,
},

whyPlanButtonText: {
  color: "#FFFFFF",
  fontSize: 9,
  fontWeight: "900",
},

buttonArrow: {
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: "900",
  marginLeft: 5,
},

compareButton: {
  width: "100%",
  height: 36,
  borderRadius: 10,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#FFD8BD",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 10,
},

compareButtonText: {
  color: "#FF6A00",
  fontSize: 9,
  fontWeight: "900",
},


compareArrow: {
  color: "#FF6A00",
  fontSize: 12,
  fontWeight: "900",
  marginLeft: 5,
},

});