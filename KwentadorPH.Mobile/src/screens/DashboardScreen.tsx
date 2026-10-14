import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,

} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  getFinancialAccounts,
  getTransactions,
  getFinancialHealth,
} from "../services/api";
import MyrnaVoiceButton from "../components/MyrnaVoiceButton";
export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [financialHealth, setFinancialHealth] = useState<any>(null);
  const [financialAccounts, setFinancialAccounts] =
    useState<any[]>([]);

const headerMessages = [
  "Payday is here. Make it count.",
  "Make your money work smarter.",
  "Spend wisely. Save confidently.",
  "Every peso has a purpose.",
  "Build today. Enjoy tomorrow.",
  "Your money. Your next move.",
];

const [headerMessageIndex, setHeaderMessageIndex] = useState(0);


useEffect(() => {
  const loadDashboard = async () => {
    // LOAD ACCOUNTS
    try {
      const accounts = await getFinancialAccounts();

      setFinancialAccounts(
        Array.isArray(accounts) ? accounts : []
      );
    } catch (error) {
      console.log("Financial Accounts Error:", error);
    }


    // LOAD FINANCIAL HEALTH
    try {
      const health = await getFinancialHealth();
      setFinancialHealth(health);
    } catch (error) {
      console.log("Financial Health Error:", error);
    }


    // LOAD RECENT ACTIVITIES
    try {
      const transactions = await getTransactions();
      const income = transactions
        .filter(
          (t: any) =>
            t.transactionType?.toLowerCase() === "income"
        )
        .reduce(
          (sum: number, t: any) =>
            sum + Number(t.amount || 0),
          0
        );

      const expenses = transactions
        .filter(
          (t: any) =>
            t.transactionType?.toLowerCase() === "expense"
        )
        .reduce(
          (sum: number, t: any) =>
            sum + Number(t.amount || 0),
          0
        );

      setTotalIncome(income);
      setTotalExpenses(expenses);


      setRecentActivities(
        transactions
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
          .slice(0, 3)
      );
    } catch (error) {
      console.log("Recent Activity Error:", error);
    }
  };

  loadDashboard();
}, []);


 const totalBalance = financialAccounts.reduce(
   (sum, account) =>
     sum + Number(account.currentBalance || 0),
   0
 );

  const formattedBalance =
    totalBalance.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const healthColor =
    (financialHealth?.score ?? 0) >= 85
      ? "#16A66A" // Excellent - Green
      : (financialHealth?.score ?? 0) >= 70
      ? "#2563EB" // Good - Blue
      : (financialHealth?.score ?? 0) >= 50
      ? "#F59E0B" // Fair - Orange
      : "#E43B45"; // Needs Attention - Red


   const myrnaMessages = [
     "Hi, I'm Myrna. How may I help you?",
     "Ask me anything about your financial.",
   ];

   const [myrnaText, setMyrnaText] = useState("");
   const [messageIndex, setMessageIndex] = useState(0);
   const [isDeleting, setIsDeleting] = useState(false);

   useEffect(() => {
     const currentMessage = myrnaMessages[messageIndex];

     let delay = isDeleting ? 35 : 55;

     // Pause after fully typing
     if (!isDeleting && myrnaText === currentMessage) {
       delay = 1800;
     }

     // Pause after deleting
     if (isDeleting && myrnaText === "") {
       delay = 400;
     }

     const timer = setTimeout(() => {
       if (!isDeleting) {
         // Finished typing
         if (myrnaText === currentMessage) {
           setIsDeleting(true);
           return;
         }

         setMyrnaText(
           currentMessage.slice(0, myrnaText.length + 1)
         );
       } else {
         // Finished deleting
         if (myrnaText === "") {
           setIsDeleting(false);
           setMessageIndex(
             (prev) => (prev + 1) % myrnaMessages.length
           );
           return;
         }

         setMyrnaText(
           currentMessage.slice(0, myrnaText.length - 1)
         );
       }
     }, delay);

     return () => clearTimeout(timer);
   }, [myrnaText, messageIndex, isDeleting]);


   useEffect(() => {
     const interval = setInterval(() => {
       setHeaderMessageIndex(
         (prev) => (prev + 1) % headerMessages.length
       );
     }, 3500);

     return () => clearInterval(interval);
   }, []);
  return (
    <SafeAreaView style={styles.container}>

         <ScrollView
               style={styles.container}
               contentContainerStyle={styles.content}
               showsVerticalScrollIndicator={false}
             >
               {/* HEADER */}
               <View style={styles.header}>
                 <View>
                   <Text style={styles.brand}>MYRNA BANK</Text>
                 <View style={styles.dynamicGreeting}>
                   <View style={styles.greetingDot} />

                   <Text style={styles.dynamicGreetingText}>
                     {headerMessages[headerMessageIndex]}
                   </Text>
                 </View>
                 </View>

                 <View style={styles.avatar}>
                   <Text>👤</Text>
                 </View>
               </View>

               {/* BALANCE */}
             <Pressable
               onPress={() => navigation.navigate("Accounts")}
             >
               <ImageBackground
                 source={require("../../assets/images/balance-bg.png")}
                 style={styles.balanceCard}
                 imageStyle={styles.balanceBackground}
                 resizeMode="cover"
               >
                 <Text style={styles.balanceLabel}>
                   Total Balance
                 </Text>

                 <Text style={styles.balance}>
                   ₱{formattedBalance}
                 </Text>

                 <Text style={styles.accounts}>
                   Across {financialAccounts.length}{" "}
                   {financialAccounts.length === 1
                     ? "account"
                     : "accounts"} ›
                 </Text>
               </ImageBackground>
             </Pressable>

               {/* INCOME / EXPENSE */}
               <View style={styles.statsRow}>
                 <View style={styles.statCard}>
                   <View style={[styles.circleIcon, styles.incomeCircle]}>
                     <Text style={styles.arrow}>↑</Text>
                   </View>

                   <View>
                     <Text style={styles.statLabel}>Total Income</Text>
                     <Text style={styles.income}>
                       ₱{totalIncome.toLocaleString("en-PH")}
                     </Text>
                     <Text style={styles.statSub}>This month</Text>
                   </View>
                 </View>

                 <View style={styles.statCard}>
                   <View style={[styles.circleIcon, styles.expenseCircle]}>
                     <Text style={styles.arrow}>↓</Text>
                   </View>

                   <View>
                     <Text style={styles.statLabel}>Total Expenses</Text>
                     <Text style={styles.expense}>
                       ₱{totalExpenses.toLocaleString("en-PH")}
                     </Text>
                     <Text style={styles.statSub}>This month</Text>
                   </View>
                 </View>
               </View>

               {/* HEALTH */}
               <View style={styles.healthCard}>
                 <View>
                   <Text style={styles.sectionTitle}>
                     Financial Health
                   </Text>

                  <Text
                    style={[
                      styles.excellent,
                      { color: healthColor },
                    ]}
                  >
                    ● {financialHealth?.status ?? "Loading..."}
                  </Text>

                  <Text style={styles.savings}>
                    {financialHealth
                      ? `${Number(financialHealth.savingsRate).toFixed(2)}% savings rate`
                      : "Calculating..."}
                  </Text>
                 </View>

                 <View
                   style={[
                     styles.scoreCircle,
                     { borderColor: healthColor },
                   ]}
                 >
                   <Text style={styles.score}>
                     {financialHealth?.score ?? "--"}
                   </Text>
                   <Text style={styles.scoreMax}>/100</Text>
                 </View>
               </View>

                 {/* COACH*/}
               <View style={styles.aiCard}>
                 <Image
                   source={require("../../assets/images/kwentador-mascot.png")}
                   style={styles.aiMascot}
                   resizeMode="contain"
                 />

                 <View style={styles.aiContent}>
                   <Text style={styles.aiTitle}>Myrna AI Assistant</Text>

                 <Text style={styles.aiText}>
                   {myrnaText}
                   <Text style={styles.typingCursor}>|</Text>
                 </Text>

                 <Pressable
                   style={({ pressed }) => [
                     styles.askButton,
                     pressed && { opacity: 0.8 },
                   ]}
                   onPress={() => navigation.navigate("AIChat")}
                 >
                   <Text style={styles.askButtonText}>Ask</Text>
                 </Pressable>
                 </View>

                 <Text style={styles.aiChevron}>›</Text>
               </View>

            {/* SMART TOOLS */}
            <View style={styles.smartToolsSection}>
              <Text style={styles.smartToolsTitle}>Advance Features</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.smartToolsRow}
              >
                {/* DEBT PLANNER */}
                <Pressable
                  style={styles.smartToolCard}
                  onPress={() => navigation.navigate("DebtPlanner")}
                >
                  <ImageBackground
                    source={require("../../assets/images/debt.png")}
                    style={styles.smartToolBackground}
                    imageStyle={styles.smartToolImage}
                    resizeMode="cover"
                  >
                    <View style={styles.smartToolOverlay}>
                      <Text style={styles.smartToolBadge}>AI DEBT STRATEGY</Text>

                      <View>


                        <Text style={styles.smartToolDescription}>
                          Find your smartest payoff strategy
                        </Text>

                        <Text style={styles.smartToolArrow}>→</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </Pressable>

                {/* FINANCIAL CHECKUP */}
                <Pressable
                  style={styles.smartToolCard}
                  onPress={() => navigation.navigate("FinancialCheckup")}
                >
                  <ImageBackground
                    source={require("../../assets/images/checkup.png")}
                    style={styles.smartToolBackground}
                    imageStyle={styles.smartToolImage}
                    resizeMode="cover"
                  >
                    <View style={styles.smartToolOverlay}>
                      <Text style={styles.smartToolBadge}>
                        HEALTH SCORE
                      </Text>

                      <View>


                        <Text style={styles.smartToolDescription}>
                          See what affects your financial health
                        </Text>

                        <Text style={styles.smartToolArrow}>→</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </Pressable>

                {/* FOREX */}
                <Pressable
                  style={styles.smartToolCard}
                  onPress={() => navigation.navigate("Forex")}
                >
                  <ImageBackground
                    source={require("../../assets/images/forex.png")}
                    style={styles.smartToolBackground}
                    imageStyle={styles.smartToolImage}
                    resizeMode="cover"
                  >
                    <View style={styles.smartToolOverlay}>
                      <Text style={styles.smartToolBadge}>
                        CURRENCY
                      </Text>

                      <View>


                        <Text style={styles.smartToolDescription}>
                          Plan spending in other currencies
                        </Text>

                        <Text style={styles.smartToolArrow}>→</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </Pressable>

                {/* FORECAST */}
               {/* REGULATORY INTELLIGENCE */}
               <Pressable
                 style={styles.smartToolCard}
                 onPress={() =>
                   navigation.navigate("RegulatoryIntelligence")
                 }
               >
                 <ImageBackground
                   source={require("../../assets/images/forecast.png")}
                   style={styles.smartToolBackground}
                   imageStyle={styles.smartToolImage}
                   resizeMode="cover"
                 >
                   <View style={styles.smartToolOverlay}>
                     <Text style={styles.smartToolBadge}>
                       AI COMPLIANCE
                     </Text>

                     <View>


                       <Text style={styles.smartToolDescription}>
                         Detect, map and simulate regulatory impact
                       </Text>

                       <Text style={styles.smartToolArrow}>→</Text>
                     </View>
                   </View>
                 </ImageBackground>
               </Pressable>
              </ScrollView>
            </View>

                        {/* GOALS*/}

                <View style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalTitle}>Your Goal</Text>
                    <Pressable>
                      <Text style={styles.viewAll}>View All ›</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    style={styles.goalContent}
                    onPress={() => navigation.navigate("GoalDetail")}
                    >
                    <View style={styles.goalEmoji}>
                      <Text style={styles.goalEmojiText}>🇯🇵</Text>
                    </View>

                    <View style={styles.goalInfo}>
                      <View style={styles.goalNameRow}>
                        <Text style={styles.goalName}>Japan Travel Fund</Text>

                        <View style={styles.achievableBadge}>
                          <Text style={styles.achievableText}>Achievable</Text>
                        </View>
                      </View>

                      <View style={styles.goalAmountRow}>
                        <Text style={styles.goalCurrent}>₱40,000</Text>
                        <Text style={styles.goalTarget}> / ₱150,000</Text>
                      </View>

                      <View style={styles.progressRow}>
                        <View style={styles.progressTrack}>
                          <View style={[styles.progressFill, { width: "26.67%" }]} />
                        </View>

                        <Text style={styles.progressText}>26.67%</Text>
                      </View>

                      <View style={styles.goalFooter}>
                        <Text style={styles.goalDetail}>₱9,166/mo needed</Text>
                        <Text style={styles.goalDetail}>12 months left</Text>
                      </View>
                    </View>
                   </Pressable>
                </View>

                         {/* RECENT ACTIVITY*/}
               <View style={styles.activityCard}>
                 <View style={styles.activityHeader}>
                   <Text style={styles.activityTitle}>Recent Activity</Text>
                   <Pressable>
                     <Text style={styles.viewAll}>View All ›</Text>
                   </Pressable>
                 </View>

                {recentActivities.map((item, index) => {
                  const isIncome = item.transactionType === "Income";
                  const isTransfer = item.transactionType === "Transfer";
                  const isExpense = item.transactionType === "Expense";

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.activityItem,
                        index === recentActivities.length - 1 && styles.lastActivity,
                      ]}
                    >
                      <View
                        style={[
                          styles.activityIcon,
                          isIncome
                            ? styles.incomeActivity
                            : isTransfer
                            ? styles.transferActivity
                            : styles.expenseActivity,
                        ]}
                      >
                        <Text
                          style={
                            isTransfer
                              ? styles.transferText
                              : styles.activityArrow
                          }
                        >
                          {isIncome ? "↑" : isTransfer ? "⇄" : "↓"}
                        </Text>
                      </View>

                      <View style={styles.activityInfo}>
                        <Text style={styles.activityName}>
                          {item.merchantName || item.description}
                        </Text>

                        <Text style={styles.activitySub}>
                          {item.category} • {item.account?.institution}
                        </Text>
                      </View>

                      <Text
                        style={
                          isIncome
                            ? styles.activityIncome
                            : isExpense
                            ? styles.activityExpense
                            : styles.activityAmount
                        }
                      >
                        {isIncome ? "+" : isExpense ? "-" : ""}
                        ₱{Number(item.amount).toLocaleString("en-PH")}
                      </Text>
                    </View>
                  );
                })}
            </View>

    </ScrollView>



    <MyrnaVoiceButton navigation={navigation} />

     {/* FIXED BOTTOM NAV */}
        <View style={styles.bottomNav}>
          <Pressable style={styles.navItem}>
            <Image
              source={require("../../assets/images/home.png")}
              style={styles.navIconImage}
              resizeMode="contain"
            />
           </Pressable>

         <Pressable
           style={styles.navItem}
           onPress={() => navigation.navigate("Expenses")}
         >
           <Image
             source={require("../../assets/images/expenses.png")}
             style={styles.navIconImage}
             resizeMode="contain"
           />

         </Pressable>


         <Pressable
           style={styles.scanNavItem}
           onPress={() => navigation.navigate("ScanReceipt")}
         >
           <View style={styles.scanButton}>
             <Image
               source={require("../../assets/images/scanner.png")}
               style={styles.navIconImage}
               resizeMode="contain"
             />
           </View>


         </Pressable>

         <Pressable
           style={styles.navItem}
           onPress={() => navigation.navigate("GoalDetail")}
         >
           <Image
             source={require("../../assets/images/goal.png")}
             style={styles.navIconImage}
             resizeMode="contain"
           />
         </Pressable>

          <Pressable
            style={styles.navItem}
            onPress={() => navigation.navigate("Insights")}
          >
            <Image
              source={require("../../assets/images/insights.png")}
              style={styles.navIconImage}
              resizeMode="contain"
            />

          </Pressable>

        </View>

      </SafeAreaView>
    );

}

const styles = StyleSheet.create({
 safe: {
   flex: 1,
   backgroundColor: "#FFF0E3",
 },

 container: {
   flex: 1,
   backgroundColor: "#FFF0E3",
 },

  content: {
    padding: 10,
    paddingBottom: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  brand: {
    color: "#FF6A00",
    fontSize: 18,
    fontWeight: "900",
  },

  greeting: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 3,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E2EBFA",
    alignItems: "center",
    justifyContent: "center",
  },

 balanceCard: {
   minHeight: 115,
   padding: 12,
   marginBottom: 8,
   justifyContent: "center",
   overflow: "hidden",
   borderRadius: 10,
   backgroundColor: "#FF6A00",
 },

balanceBackground: {
  borderRadius: 14,
},

balanceLabel: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "600",
},

  balance: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5,
  },

accounts: {
  color: "#D8E8FF",
  fontSize: 11,
  marginTop: 3,
},

statsRow: {
  flexDirection: "row",
  gap: 8,
  marginBottom: 8,
},

statCard: {
  flex: 1,
  minHeight: 64,
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  padding: 10,
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
},

circleIcon: {
  width: 32,
  height: 32,
  minWidth: 32,
  minHeight: 32,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
},

incomeCircle: {
  backgroundColor: "#27B978",
},

expenseCircle: {
  backgroundColor: "#FF5158",
},

arrow: {
  color: "#FFFFFF",
  fontSize: 20,
  fontWeight: "800",
  lineHeight: 22,
},

statLabel: {
  color: "#64748B",
  fontSize: 10,
},


income: {
  color: "#1F2937",
  fontSize: 14,
  fontWeight: "800",
},



expense: {
  color: "#1F2937",
  fontSize: 14,
  fontWeight: "800",
},

statSub: {
  color: "#94A3B8",
  fontSize: 9,
  marginTop: 1,
},

  expenseIcon: {
    color: "#E51C2A",
    fontSize: 20,
    fontWeight: "900",
  },


  healthCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },

sectionTitle: {
  color: "#1F2937",
  fontSize: 17,
  fontWeight: "800",
},


  excellent: {
    color: "#16A66A",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },

  savings: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },

  scoreCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 5,
    borderColor: "#17B987",
    alignItems: "center",
    justifyContent: "center",
  },

score: {
  color: "#1F2937",
  fontSize: 15,
  fontWeight: "900",
},

  scoreMax: {
    color: "#64748B",
    fontSize: 9,
  },

aiCard: {
  backgroundColor: "#FFF1E6",
  borderRadius: 14,
  padding: 5,
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 8,
  minHeight: 100,
  borderWidth: 1,
  borderColor: "#FFD8BD",
},

aiMascot: {
  width: 100,
  height: 120,
  marginRight: 8,
},

aiContent: {
  flex: 1,
},

aiTitle: {
  color: "#FF6A00",
  fontSize: 13,
  fontWeight: "800",
},

aiMessage: {
  color: "#334155",
  fontSize: 10,
  lineHeight: 14,
  marginTop: 3,
},

aiButton: {
  height: 28,
  backgroundColor: "#075FEA",
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 6,
},

aiButtonText: {
  color: "#FFFFFF",
  fontSize: 10,
  fontWeight: "700",
},

aiChevron: {
  color: "#FF6A00",
  fontSize: 22,
  marginLeft: 5,
},


quickCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 14,
  padding: 10,
  marginBottom: 8,
},

quickTitle: {
  color: "#063B8F",
  fontSize: 13,
  fontWeight: "800",
  marginBottom: 8,
},

quickRow: {
  flexDirection: "row",
  justifyContent: "space-between",
},

quickItem: {
  width: "24%",
  alignItems: "center",
},

quickIcon: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: "#EAF2FF",
  alignItems: "center",
  justifyContent: "center",
},

quickIconText: {
  color: "#1769E8",
  fontSize: 19,
  fontWeight: "700",
},

goalIcon: {
  backgroundColor: "#FFF0F1",
},

goalIconText: {
  color: "#EF3340",
  fontSize: 20,
  fontWeight: "800",
},

quickLabel: {
  color: "#475569",
  fontSize: 9,
  marginTop: 4,
  textAlign: "center",
},

goalCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 14,
  padding: 10,
  marginBottom: 8,
},

goalHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 7,
},

goalTitle: {
  color: "#1F2937",
  fontSize: 13,
  fontWeight: "800",
},


viewAll: {
  color: "#FF6A00",
  fontSize: 9,
  fontWeight: "600",
},

goalContent: {
  flexDirection: "row",
  alignItems: "center",
},

goalEmoji: {
  width: 50,
  height: 58,
  borderRadius: 10,
  backgroundColor: "#F1F5F9",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 9,
},

goalEmojiText: {
  fontSize: 25,
},

goalInfo: {
  flex: 1,
},

goalNameRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},


goalName: {
  color: "#1F2937",
  fontSize: 11,
  fontWeight: "800",
},


achievableBadge: {
  backgroundColor: "#DDF8E9",
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 10,
},

achievableText: {
  color: "#15965D",
  fontSize: 7,
  fontWeight: "700",
},

goalAmountRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 3,
},


goalCurrent: {
  color: "#1F2937",
  fontSize: 11,
  fontWeight: "800",
},

goalTarget: {
  color: "#64748B",
  fontSize: 9,
},

progressRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 5,
},

progressTrack: {
  flex: 1,
  height: 5,
  borderRadius: 10,
  backgroundColor: "#E2E8F0",
  overflow: "hidden",
},

progressFill: {
  height: "100%",
  backgroundColor: "#19B88A",
  borderRadius: 10,
},


progressText: {
  width: 40,
  textAlign: "right",
  color: "#FF6A00",
  fontSize: 8,
  fontWeight: "700",
},


goalFooter: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 4,
},

goalDetail: {
  color: "#64748B",
  fontSize: 8,
},

activityCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 14,
  padding: 10,
  marginBottom: 8,
},

activityHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
},

activityTitle: {
  color: "#1F2937",
  fontSize: 13,
  fontWeight: "800",
},

activityItem: {
  minHeight: 47,
  flexDirection: "row",
  alignItems: "center",
  borderBottomWidth: 1,
  borderBottomColor: "#EEF2F7",
},

lastActivity: {
  borderBottomWidth: 0,
},

activityIcon: {
  width: 28,
  height: 28,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 8,
},

incomeActivity: {
  backgroundColor: "#25B979",
},

expenseActivity: {
  backgroundColor: "#F0525B",
},

transferActivity: {
  backgroundColor: "#FFF1E6",
},

activityArrow: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "800",
},

transferText: {
  color: "#FF6A00",
  fontSize: 15,
  fontWeight: "800",
},

activityInfo: {
  flex: 1,
},

activityName: {
  color: "#1F2937",
  fontSize: 10,
  fontWeight: "700",
},

activitySub: {
  color: "#94A3B8",
  fontSize: 8,
  marginTop: 1,
},

activityIncome: {
  color: "#15965D",
  fontSize: 10,
  fontWeight: "800",
},

activityExpense: {
  color: "#E43B45",
  fontSize: 10,
  fontWeight: "800",
},

activityAmount: {
  color: "#475569",
  fontSize: 10,
  fontWeight: "700",
},

bottomNav: {
  height: 62,
  backgroundColor: "#FFFFFF",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-around",
  paddingHorizontal: 6,
  borderTopWidth: 1,
  borderTopColor: "#E8EDF5",
},

navItem: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
},

navIcon: {
  color: "#94A3B8",
  fontSize: 19,
},

navIconActive: {
  color: "#075FEA",
  fontSize: 20,
  fontWeight: "800",
},

navText: {
  color: "#94A3B8",
  fontSize: 8,
  marginTop: 2,
  fontWeight: "600",
},

navTextActive: {
  color: "#075FEA",
  fontSize: 8,
  marginTop: 2,
  fontWeight: "700",
},

scanNavItem: {
  flex: 1,
  alignItems: "center",

},

scanButton: {
  width: 26,
  height: 26,
  alignItems: "center",
  justifyContent: "center",
},

scanIcon: {
  color: "#FFFFFF",
  fontSize: 20,
  fontWeight: "800",
},

askButton: {
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 16,
  paddingVertical: 7,
  borderRadius: 18,
  alignSelf: "flex-start",
  marginTop: 10,
},

askButtonText: {
  color: "#FF6A00",
  fontSize: 12,
  fontWeight: "800",
},

smartToolsSection: {
  marginBottom: 8,
},

smartToolsTitle: {
  color: "#063B8F",
  fontSize: 13,
  fontWeight: "800",
  marginBottom: 8,
},

smartToolsRow: {
  gap: 8,
  paddingRight: 10,
},

smartToolCard: {
  width: 300,
  height: 150,
  borderRadius: 10,
  overflow: "hidden",
},

smartToolBackground: {
  flex: 1,
},

smartToolImage: {
  borderRadius: 10,
},

smartToolOverlay: {
  flex: 1,
  padding: 10,
  justifyContent: "space-between",
  backgroundColor: "rgba(5, 35, 90, 0.38)",
},

smartToolBadge: {
  alignSelf: "flex-start",
  color: "#FFFFFF",
  fontSize: 7,
  fontWeight: "800",
  backgroundColor: "rgba(255,255,255,0.18)",
  paddingHorizontal: 6,
  paddingVertical: 3,
  borderRadius: 10,
},

smartToolTitle: {
  color: "#FFFFFF",
  fontSize: 13,
  fontWeight: "900",
},

smartToolDescription: {
  color: "#EAF3FF",
  fontSize: 8,
  marginTop: 3,
  paddingRight: 15,
},

smartToolArrow: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "800",
  position: "absolute",
  right: 0,
  bottom: -2,
},

navIconImage: {
  width: 45,
  height: 45,
},
typingCursor: {
  color: "#FF6A00",
  fontWeight: "900",
},

aiText: {
  color: "#64748B",
  fontSize:18,   //
  lineHeight: 20,
  marginTop: 5,
  fontWeight: 500,
},

dynamicGreeting: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 4,
},

greetingDot: {
  width: 5,
  height: 5,
  borderRadius: 3,
  backgroundColor: "#FF6A00",
  marginRight: 6,
},

dynamicGreetingText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#667085",
  letterSpacing: 0.2,
},

});