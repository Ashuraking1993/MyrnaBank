import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";

import { getDebtWhatIf } from "../services/api";

export default function DebtWhatIfScreen() {
  const navigation = useNavigation<any>();

  const [extraPayment, setExtraPayment] = useState("3000");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const formatMoney = (value: number) =>
    `₱${Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const calculate = async (amount?: number) => {
    try {
      setLoading(true);

      const value =
        amount !== undefined
          ? amount
          : Number(extraPayment.replace(/,/g, ""));

      if (isNaN(value) || value < 0) {
        return;
      }

      const data = await getDebtWhatIf(value);
      setResult(data);
    } catch (error) {
      console.log("Debt What-If Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculate(3000);
  }, []);

  const selectPreset = (amount: number) => {
    setExtraPayment(amount.toString());
    calculate(amount);
  };

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
            <Text style={styles.title}>What-If Simulator</Text>
            <Text style={styles.subtitle}>
              See the impact of paying a little more
            </Text>
          </View>
        </View>

        {/* EXTRA PAYMENT INPUT */}
        <View style={styles.paymentCard}>
          <Text style={styles.paymentLabel}>
            EXTRA MONTHLY PAYMENT
          </Text>

          <View style={styles.inputRow}>
            <Text style={styles.peso}>₱</Text>

            <TextInput
              style={styles.input}
              value={extraPayment}
              onChangeText={setExtraPayment}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={styles.helper}>
            This amount is added on top of your required minimum
            payments.
          </Text>

          {/* PRESETS */}
          <View style={styles.presetRow}>
            {[1000, 3000, 5000, 10000].map((amount) => (
              <Pressable
                key={amount}
                style={[
                  styles.preset,
                  Number(extraPayment) === amount &&
                    styles.presetActive,
                ]}
                onPress={() => selectPreset(amount)}
              >
                <Text
                  style={[
                    styles.presetText,
                    Number(extraPayment) === amount &&
                      styles.presetTextActive,
                  ]}
                >
                  +₱{amount.toLocaleString()}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.calculateButton}
            onPress={() => calculate()}
            disabled={loading}
          >
            <Text style={styles.calculateText}>
              {loading ? "Calculating..." : "Calculate Impact"}
            </Text>
          </Pressable>
        </View>

        {result && (
          <>
            {/* MAIN RESULT */}
            <View style={styles.resultCard}>
              <Text style={styles.resultEyebrow}>
                YOUR POTENTIAL IMPACT
              </Text>

              <Text style={styles.resultTitle}>
                Debt-free {result.monthsSaved} months earlier
              </Text>

              <Text style={styles.resultSubtitle}>
                By adding{" "}
                {formatMoney(result.extraMonthlyPayment)} every month
              </Text>

              <View style={styles.savingsBox}>
                <Text style={styles.savingsLabel}>
                  INTEREST YOU COULD SAVE
                </Text>

                <Text style={styles.savingsAmount}>
                  {formatMoney(result.interestSaved)}
                </Text>
              </View>
            </View>

            {/* BEFORE VS AFTER */}
            <Text style={styles.sectionTitle}>
              Before vs After
            </Text>

            <View style={styles.compareCard}>
              <View style={styles.compareColumn}>
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>
                    CURRENT PLAN
                  </Text>
                </View>

                <Text style={styles.compareMonths}>
                  {result.baseline.monthsToDebtFree}
                </Text>

                <Text style={styles.compareLabel}>
                  months
                </Text>

                <Text style={styles.compareInterest}>
                  {formatMoney(
                    result.baseline.totalInterestPaid
                  )}
                </Text>

                <Text style={styles.smallLabel}>
                  total interest
                </Text>
              </View>

              <View style={styles.arrowBox}>
                <Text style={styles.arrow}>→</Text>
              </View>

              <View style={styles.compareColumn}>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>
                    NEW PLAN
                  </Text>
                </View>

                <Text style={styles.newMonths}>
                  {result.scenario.monthsToDebtFree}
                </Text>

                <Text style={styles.compareLabel}>
                  months
                </Text>

                <Text style={styles.newInterest}>
                  {formatMoney(
                    result.scenario.totalInterestPaid
                  )}
                </Text>

                <Text style={styles.smallLabel}>
                  total interest
                </Text>
              </View>
            </View>

            {/* DEBT FREE DATE */}
            <View style={styles.dateCard}>
              <View>
                <Text style={styles.dateLabel}>
                  New debt-free estimate
                </Text>

                <Text style={styles.dateValue}>
                  {new Date(
                    result.scenario.estimatedDebtFreeDate
                  ).toLocaleDateString("en-PH", {
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>

              <View style={styles.calendarIcon}>
                <Text style={styles.calendarText}>✓</Text>
              </View>
            </View>

            {/* BACKEND MESSAGE */}
            <View style={styles.coachCard}>
              <View style={styles.coachIcon}>
                <Text style={styles.coachIconText}>✦</Text>
              </View>

              <View style={styles.coachContent}>
               <Text style={styles.coachTitle}>
                 Myrna Insight
               </Text>

                <Text style={styles.coachMessage}>
                  {result.message}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF7F1",
  },

  content: {
    padding: 14,
    paddingBottom: 36,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
    borderWidth: 1,
    borderColor: "#FFE0C7",
  },

  backText: {
    color: "#E85D04",
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "700",
  },

  title: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "900",
  },

  subtitle: {
    color: "#667085",
    fontSize: 10,
    marginTop: 2,
  },

  // EXTRA PAYMENT
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#FFE1CA",
  },

  paymentLabel: {
    color: "#E85D04",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  inputRow: {
    height: 58,
    backgroundColor: "#FFF8F3",
    borderWidth: 1,
    borderColor: "#FFD8BD",
    borderRadius: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  peso: {
    color: "#E85D04",
    fontSize: 22,
    fontWeight: "900",
    marginRight: 5,
  },

  input: {
    flex: 1,
    color: "#1F2937",
    fontSize: 22,
    fontWeight: "900",
  },

  helper: {
    color: "#8A94A6",
    fontSize: 8,
    lineHeight: 12,
    marginTop: 6,
  },

  // PRESETS
  presetRow: {
    flexDirection: "row",
    gap: 5,
    marginTop: 12,
  },

  preset: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#FFF7F1",
    borderRadius: 9,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE4D1",
  },

  presetActive: {
    backgroundColor: "#FFF0E3",
    borderWidth: 1,
    borderColor: "#FF6A00",
  },

  presetText: {
    color: "#667085",
    fontSize: 8,
    fontWeight: "700",
  },

  presetTextActive: {
    color: "#E85D04",
    fontWeight: "900",
  },

  calculateButton: {
    height: 44,
    borderRadius: 11,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 13,
  },

  calculateText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  // MAIN RESULT
  resultCard: {
    backgroundColor: "#FF6A00",
    borderRadius: 17,
    padding: 17,
    marginBottom: 15,
  },

  resultEyebrow: {
    color: "#FFF0E3",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  resultTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 5,
  },

  resultSubtitle: {
    color: "#FFF3E9",
    fontSize: 9,
    marginTop: 4,
  },

  savingsBox: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 11,
    padding: 11,
    marginTop: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },

  savingsLabel: {
    color: "#FFF0E3",
    fontSize: 7,
    fontWeight: "800",
  },

  savingsAmount: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },

  // BEFORE VS AFTER
  sectionTitle: {
    color: "#1F2937",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
  },

  compareCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFE4D1",
  },

  compareColumn: {
    flex: 1,
    alignItems: "center",
  },

  currentBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },

  currentBadgeText: {
    color: "#667085",
    fontSize: 6,
    fontWeight: "900",
  },

  newBadge: {
    backgroundColor: "#FFF0E3",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },

  newBadgeText: {
    color: "#E85D04",
    fontSize: 6,
    fontWeight: "900",
  },

  compareMonths: {
    color: "#667085",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
  },

  newMonths: {
    color: "#FF6A00",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
  },

  compareLabel: {
    color: "#98A2B3",
    fontSize: 8,
  },

  compareInterest: {
    color: "#475467",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 8,
  },

  // Keep green because this represents actual savings/improvement
  newInterest: {
    color: "#15965D",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 8,
  },

  smallLabel: {
    color: "#98A2B3",
    fontSize: 7,
    marginTop: 2,
  },

  arrowBox: {
    width: 35,
    alignItems: "center",
  },

  arrow: {
    color: "#FF6A00",
    fontSize: 20,
    fontWeight: "900",
  },

  // DEBT-FREE DATE
  dateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFE4D1",
  },

  dateLabel: {
    color: "#667085",
    fontSize: 8,
  },

  dateValue: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 3,
  },

  // Green remains semantic: successful/improved result
  calendarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F8EF",
    alignItems: "center",
    justifyContent: "center",
  },

  calendarText: {
    color: "#15965D",
    fontWeight: "900",
  },

  // MYRNA INSIGHT
  coachCard: {
    backgroundColor: "#FFF0E3",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#FFD8BD",
  },

  coachIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  coachIconText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  coachContent: {
    flex: 1,
  },

  coachTitle: {
    color: "#E85D04",
    fontSize: 11,
    fontWeight: "900",
  },

  coachMessage: {
    color: "#475467",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },
});