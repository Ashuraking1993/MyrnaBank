import {
  Pressable,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { getGoals } from "../services/api";

export default function GoalDetailScreen({ navigation }: any) {

 const [goal, setGoal] = useState<any>(null);
 const [loading, setLoading] = useState(true);


const money = (value: number) =>
  `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;


useEffect(() => {
  const unsubscribe = navigation.addListener("focus", async () => {
    try {
      setLoading(true);

      const goals = await getGoals();

      if (goals.length > 0) {
        setGoal(goals[0]);
      } else {
        setGoal(null);
      }
    } catch (error) {
      console.error("Goal Load Error:", error);
    } finally {
      setLoading(false);
    }
  });

  return unsubscribe;
}, [navigation]);

if (loading) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading goal plan...</Text>
      </View>
    </SafeAreaView>
  );
}

if (!goal) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>No active goal found.</Text>
      </View>
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.headerTitle}>Goal Plan</Text>
           <Text style={styles.headerSub}>
             MYRNA BANK
           </Text>
          </View>
        </View>

        <View style={styles.goalsTop}>
          <View>
            <Text style={styles.goalsTitle}>My Goals</Text>
            <Text style={styles.goalsSubtitle}>
              Plan today. Achieve tomorrow.
            </Text>
          </View>

          <Pressable
            style={styles.addGoalButton}
            onPress={() => navigation.navigate("AddGoal")}
          >
            <Text style={styles.addGoalIcon}>＋</Text>
            <Text style={styles.addGoalText}>Add Goal</Text>
          </Pressable>
        </View>

        <View style={styles.goalSummary}>
          <View>
            <Text style={styles.summaryLabel}>Total Goal Savings</Text>
            <Text style={styles.summaryAmount}>
              {money(goal.currentAmount)}
            </Text>
          </View>

          <View style={styles.activeGoalBox}>
            <Text style={styles.activeGoalNumber}>1</Text>
            <Text style={styles.activeGoalLabel}>Active Goal</Text>
          </View>
        </View>

       <ImageBackground
         source={require("../../assets/images/goal-bg.png")}
         style={styles.goalCard}
         imageStyle={styles.goalCardBackground}
         resizeMode="cover"
       >
         <Text style={styles.goalIcon}>✈️</Text>
         <Text style={styles.goalName}>{goal.name}</Text>

         <Text style={styles.saved}>
           {money(goal.currentAmount)}
         </Text>

         <Text style={styles.target}>
           saved of {money(goal.targetAmount)}
         </Text>

         <View style={styles.progressTrack}>
           <View
             style={[
               styles.progressFill,
               { width: `${goal.progressPercentage}%` },
             ]}
           />
         </View>

         <Text style={styles.progressText}>
           {goal.progressPercentage}% complete
         </Text>
       </ImageBackground>

        <Text style={styles.sectionTitle}>
          Your Goal Breakdown
        </Text>

        <View style={styles.breakdownCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Remaining</Text>
            <Text style={styles.value}>
              {money(goal.remainingAmount)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time remaining</Text>
            <Text style={styles.value}>
              {goal.monthsRemaining} months
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Required monthly</Text>
            <Text style={styles.highlight}>
              {money(goal.requiredMonthlySavings)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>
              Cash flow after goal
            </Text>
            <Text style={styles.value}>
              {money(goal.monthlyDifference)}
            </Text>
          </View>
        </View>

        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>
              ✨ AI Goal Plan
            </Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
               {goal.feasibilityStatus}
              </Text>
            </View>
          </View>

        <Text style={styles.aiText}>
          Save at least {money(goal.requiredMonthlySavings)} per
          month for the next {goal.monthsRemaining} months to
          complete your {goal.name}.
        </Text>

          <Text style={styles.aiSubText}>
            Based on your current cash flow, you would still have
            around {money(goal.monthlyDifference)} available each month.
          </Text>
        </View>
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
    padding: 18,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  back: {
    fontSize: 36,
    color: "#1746A2",
    marginRight: 14,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#102A56",
  },

  headerSub: {
    fontSize: 11,
    color: "#78859A",
  },

goalCard: {
  borderRadius: 10,
  padding: 10,
  overflow: "hidden",
},

goalCardBackground: {
  borderRadius: 10,
},

  goalIcon: {
    fontSize: 20,
  },

  goalName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 5,
  },

  saved: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5,
  },

  target: {
    color: "#DDE8FF",
    fontSize: 12,
    marginTop: 2,
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#6384C6",
    borderRadius: 8,
    marginTop: 15,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },

  progressText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 7,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#102A56",
    marginTop: 24,
    marginBottom: 10,
  },

  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
  },

  label: {
    color: "#718096",
    fontSize: 13,
  },

  value: {
    color: "#17233C",
    fontSize: 13,
    fontWeight: "700",
  },

  highlight: {
    color: "#1746A2",
    fontSize: 16,
    fontWeight: "900",
  },

  aiCard: {
    backgroundColor: "#FFF1E6",
    borderWidth: 1,
    borderColor: "#D7E4FF",
    borderRadius: 10,
    padding: 17,
    marginTop: 16,
  },

  aiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  aiTitle: {
    color: "#1746A2",
    fontSize: 15,
    fontWeight: "800",
  },

  statusBadge: {
    backgroundColor: "#E2F7E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusText: {
    color: "#168447",
    fontSize: 10,
    fontWeight: "800",
  },

  aiText: {
    color: "#34435E",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 14,
  },

  aiSubText: {
    color: "#66758D",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

loadingContainer: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
},

loadingText: {
  fontSize: 14,
  color: "#78859A",
},

goalsTop: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
},

goalsTitle: {
  fontSize: 22,
  fontWeight: "900",
  color: "#102A56",
},

goalsSubtitle: {
  fontSize: 11,
  color: "#78859A",
  marginTop: 2,
},

addGoalButton: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#FF8A1F",
  paddingHorizontal: 13,
  paddingVertical: 9,
  borderRadius: 12,
},

addGoalIcon: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "800",
  marginRight: 4,
},

addGoalText: {
  color: "#FFFFFF",
  fontSize: 11,
  fontWeight: "800",
},

goalSummary: {
 backgroundColor: "#FFF1E6",
  borderRadius: 10,
  padding: 16,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
},

summaryLabel: {
  fontSize: 11,
  color: "#66758D",
},

summaryAmount: {
  fontSize: 24,
  fontWeight: "900",
  color: "#1746A2",
  marginTop: 3,
},

activeGoalBox: {
  alignItems: "center",
  paddingHorizontal: 14,
},

activeGoalNumber: {
  fontSize: 22,
  fontWeight: "900",
  color: "#D62839",
},

activeGoalLabel: {
  fontSize: 10,
  color: "#78859A",
},


});