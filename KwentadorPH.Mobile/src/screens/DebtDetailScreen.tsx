import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  addDebtPayment,
  getDebtAccountById,
  getDebtRecommendation,
} from "../services/api";

export default function DebtDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { debtId } = route.params;

  const [debt, setDebt] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentImpact, setPaymentImpact] = useState<any>(null);

  const formatMoney = (value: number) =>
    `₱${Number(value || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const loadDebt = async () => {
    try {
      setLoading(true);

      const data = await getDebtAccountById(debtId);

      setDebt(data);
    } catch (error) {
      console.log("Debt Detail Error:", error);

      Alert.alert(
        "Unable to Load",
        "Debt information could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDebt();
    }, [debtId])
  );

const handlePayment = async () => {

    if (!debt) {
      Alert.alert(
        "Unable to Record Payment",
        "Debt information is not available."
      );
      return;
    }

    const debtName = debt.name ?? "Debt";

  const amount = Number(paymentAmount.replace(/,/g, ""));

  if (!amount || amount <= 0) {
    Alert.alert(
      "Invalid Payment",
      "Enter a valid payment amount."
    );
    return;
  }

  if (amount > Number(debt?.currentBalance || 0)) {
    Alert.alert(
      "Invalid Payment",
      "Payment cannot exceed the remaining balance."
    );
    return;
  }

  try {
    setSaving(true);

    // Snapshot before payment
    const previousBalance = Number(
      debt.currentBalance || 0
    );

    let beforePlan: any = null;

    try {
      beforePlan = await getDebtRecommendation(3000);
    } catch (error) {
      console.log(
        "Unable to get before-payment strategy:",
        error
      );
    }

    // Record actual payment
    await addDebtPayment(debtId, {
      amount,
      notes: notes.trim() || undefined,
    });

// Reload updated debt
const updatedDebt =
  await getDebtAccountById(debtId);

const newBalance = Number(
  updatedDebt.currentBalance || 0
);

// IMPORTANT:
// Show payment impact immediately after
// successful payment.
setPaymentImpact({
  amount,
  debtName,
  previousBalance,
  newBalance,

  beforeMonths: undefined,
  afterMonths: undefined,

  beforeInterest: undefined,
  afterInterest: undefined,

  monthsImproved: 0,
  interestImproved: 0,

  estimatedDebtFreeDate: undefined,
  strategy: undefined,
});

// Update debt details + payment history
setDebt(updatedDebt);

// Recalculate strategy separately
try {
  const afterPlan =
    await getDebtRecommendation(3000);

  if (beforePlan && afterPlan) {
    const monthsImproved =
      Number(beforePlan.monthsToDebtFree || 0) -
      Number(afterPlan.monthsToDebtFree || 0);

    const interestImproved =
      Number(beforePlan.totalInterestPaid || 0) -
      Number(afterPlan.totalInterestPaid || 0);

    // Upgrade the already-visible impact card
    // with strategy calculations.
    setPaymentImpact({
      amount,
      debtName,
      previousBalance,
      newBalance,

      beforeMonths:
        beforePlan.monthsToDebtFree,

      afterMonths:
        afterPlan.monthsToDebtFree,

      beforeInterest:
        beforePlan.totalInterestPaid,

      afterInterest:
        afterPlan.totalInterestPaid,

      monthsImproved:
        Math.max(0, monthsImproved),

      interestImproved:
        Math.max(0, interestImproved),

      estimatedDebtFreeDate:
        afterPlan.estimatedDebtFreeDate,

      strategy:
        afterPlan.recommendedStrategy,
    });
  }
} catch (error) {
  console.log(
    "Unable to calculate payment impact:",
    error
  );
}

setPaymentAmount("");
setNotes("");

    setPaymentAmount("");
    setNotes("");
  } catch (error: any) {
    console.log("Record Payment Error:", error);

    Alert.alert(
      "Unable to Record Payment",
      error?.message || "Please try again."
    );
  } finally {
    setSaving(false);
  }

};

if (loading && !debt) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading debt...
        </Text>
      </View>
    </SafeAreaView>
  );
}

if (!debt) {
  return null;
}

const originalBalance = Number(
  debt.originalBalance || 0
);

const currentBalance = Number(
  debt.currentBalance || 0
);

const totalPaid = Math.max(
  0,
  originalBalance - currentBalance
);

const progress =
  originalBalance > 0
    ? (totalPaid / originalBalance) * 100
    : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
              {debt.name}
            </Text>

            <Text style={styles.subtitle}>
              {debt.debtType}
            </Text>
          </View>
        </View>

        {/* BALANCE */}

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>
            REMAINING BALANCE
          </Text>

          <Text style={styles.balanceAmount}>
            {formatMoney(currentBalance)}
          </Text>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    100,
                    Math.max(0, progress)
                  )}%`,
                },
              ]}
            />
          </View>

          <View style={styles.progressRow}>
            <Text style={styles.progressText}>
              {progress.toFixed(0)}% paid
            </Text>

            <Text style={styles.progressText}>
              {formatMoney(totalPaid)} paid
            </Text>
          </View>
        </View>

        {/* DETAILS */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Debt Details
          </Text>

          <View style={styles.statsRow}>
            <Stat
              label="ORIGINAL"
              value={formatMoney(originalBalance)}
            />

            <Stat
              label="APR"
              value={`${Number(debt.interestRate).toFixed(2)}%`}
            />

            <Stat
              label="MIN. PAYMENT"
              value={formatMoney(debt.minimumPayment)}
            />
          </View>

          {debt.dueDate && (
            <View style={styles.dueRow}>
              <Text style={styles.dueLabel}>
                Next Due Date
              </Text>

              <Text style={styles.dueValue}>
                {new Date(debt.dueDate).toLocaleDateString(
                  "en-PH",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </Text>
            </View>
          )}
        </View>

        {/* RECORD PAYMENT */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Record Payment
          </Text>

          <Text style={styles.label}>
            PAYMENT AMOUNT
          </Text>

          <View style={styles.moneyInput}>
            <Text style={styles.peso}>₱</Text>

            <TextInput
              style={styles.flexInput}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={styles.label}>
            NOTES
          </Text>

          <TextInput
            style={styles.input}
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional note"
            placeholderTextColor="#94A3B8"
          />

          <Pressable
            style={[
              styles.paymentButton,
              saving && styles.disabledButton,
            ]}
            disabled={saving}
            onPress={handlePayment}
          >
            <Text style={styles.paymentButtonText}>
              {saving
                ? "Recording..."
                : "Record Payment"}
            </Text>
          </Pressable>
        </View>

{/* PAYMENT IMPACT */}

{paymentImpact && (
  <View style={styles.impactCard}>
    <View style={styles.impactHeader}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✓</Text>
      </View>

      <View style={styles.impactHeaderText}>
        <Text style={styles.impactTitle}>
          Payment Recorded
        </Text>

        <Text style={styles.impactSubtitle}>
          {formatMoney(paymentImpact.amount)} paid to{" "}
          {paymentImpact.debtName}
        </Text>
      </View>
    </View>

    <View style={styles.impactBalance}>
      <View>
        <Text style={styles.impactLabel}>
          PREVIOUS BALANCE
        </Text>

        <Text style={styles.oldBalance}>
          {formatMoney(
            paymentImpact.previousBalance
          )}
        </Text>
      </View>

      <Text style={styles.impactArrow}>→</Text>

      <View style={styles.impactRight}>
        <Text style={styles.impactLabel}>
          NEW BALANCE
        </Text>

        <Text style={styles.newBalance}>
          {formatMoney(
            paymentImpact.newBalance
          )}
        </Text>
      </View>
    </View>

    {paymentImpact.beforeMonths !== undefined && (
      <>
        <Text style={styles.impactSectionTitle}>
          UPDATED DEBT PLAN
        </Text>

        <View style={styles.impactRow}>
          <Text style={styles.impactRowLabel}>
            Debt-Free
          </Text>

          <Text style={styles.impactRowValue}>
            {paymentImpact.beforeMonths} →{" "}
            {paymentImpact.afterMonths} months
          </Text>
        </View>

        <View style={styles.impactRow}>
          <Text style={styles.impactRowLabel}>
            Projected Interest
          </Text>

          <Text style={styles.impactRowValue}>
            {formatMoney(
              paymentImpact.beforeInterest
            )}{" "}
            →{" "}
            {formatMoney(
              paymentImpact.afterInterest
            )}
          </Text>
        </View>

        <View style={styles.impactSavingBox}>
          <Text style={styles.impactSavingLabel}>
            Additional projected interest saved
          </Text>

          <Text style={styles.impactSavingValue}>
            +{formatMoney(
              paymentImpact.interestImproved
            )}
          </Text>
        </View>

        <Text style={styles.impactMessage}>
          Your {paymentImpact.strategy} plan has been
          recalculated using your updated balance.
        </Text>
      </>
    )}

    <Pressable
      style={styles.dismissImpact}
      onPress={() => setPaymentImpact(null)}
    >
      <Text style={styles.dismissImpactText}>
        Got it
      </Text>
    </Pressable>
  </View>
)}


        {/* PAYMENT HISTORY */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Payment History
          </Text>

          {!debt.payments ||
          debt.payments.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>
                No payments yet
              </Text>

              <Text style={styles.emptyText}>
                Your recorded payments will appear here.
              </Text>
            </View>
          ) : (
            [...debt.payments]
              .sort(
                (a: any, b: any) =>
                  new Date(b.paymentDate).getTime() -
                  new Date(a.paymentDate).getTime()
              )
              .map((payment: any) => (
                <View
                  style={styles.paymentItem}
                  key={payment.id}
                >
                  <View style={styles.paymentIcon}>
                    <Text style={styles.paymentIconText}>
                      ↓
                    </Text>
                  </View>

                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>
                      Debt Payment
                    </Text>

                    <Text style={styles.paymentDate}>
                      {new Date(
                        payment.paymentDate
                      ).toLocaleDateString("en-PH")}
                    </Text>

                    {payment.notes ? (
                      <Text style={styles.paymentNotes}>
                        {payment.notes}
                      </Text>
                    ) : null}
                  </View>

                  <Text style={styles.paymentAmount}>
                    -{formatMoney(payment.amount)}
                  </Text>
                </View>
              ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F8FF",
  },

  content: {
    padding: 10,
    paddingBottom: 20,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#64748B",
    fontSize: 11,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  backText: {
    color: "#0646B8",
    fontSize: 25,
    lineHeight: 27,
    fontWeight: "700",
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#063B8F",
    fontSize: 17,
    fontWeight: "900",
  },

  subtitle: {
    color: "#64748B",
    fontSize: 9,
    marginTop: 2,
  },

  balanceCard: {
    backgroundColor: "#075FEA",
    borderRadius: 10,
    padding: 15,
    marginBottom: 8,
  },

  balanceLabel: {
    color: "#CFE1FF",
    fontSize: 8,
    fontWeight: "800",
  },

  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 3,
  },

  progressBackground: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.20)",
    borderRadius: 10,
    marginTop: 12,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  progressText: {
    color: "#D9E7FF",
    fontSize: 8,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },

  sectionTitle: {
    color: "#063B8F",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
  },

  statsRow: {
    flexDirection: "row",
    gap: 5,
  },

  stat: {
    flex: 1,
    backgroundColor: "#F7FAFE",
    borderRadius: 10,
    padding: 10,
  },

  statLabel: {
    color: "#94A3B8",
    fontSize: 7,
    fontWeight: "800",
  },

  statValue: {
    color: "#163B76",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
  },

  dueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEF2F7",
    marginTop: 10,
    paddingTop: 10,
  },

  dueLabel: {
    color: "#64748B",
    fontSize: 9,
  },

  dueValue: {
    color: "#163B76",
    fontSize: 9,
    fontWeight: "800",
  },

  label: {
    color: "#64748B",
    fontSize: 8,
    fontWeight: "800",
    marginBottom: 4,
    marginTop: 6,
  },

  moneyInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "#DCE7F6",
    backgroundColor: "#F7FAFE",
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  peso: {
    color: "#063B8F",
    fontSize: 12,
    fontWeight: "900",
    marginRight: 4,
  },

  flexInput: {
    flex: 1,
    height: "100%",
    color: "#163B76",
    fontSize: 11,
    fontWeight: "800",
  },

  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#DCE7F6",
    backgroundColor: "#F7FAFE",
    borderRadius: 10,
    paddingHorizontal: 10,
    color: "#163B76",
    fontSize: 10,
  },

  paymentButton: {
    height: 40,
    backgroundColor: "#075FEA",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  paymentButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  emptyBox: {
    backgroundColor: "#F7FAFE",
    borderRadius: 10,
    padding: 10,
  },

  emptyTitle: {
    color: "#475569",
    fontSize: 9,
    fontWeight: "800",
  },

  emptyText: {
    color: "#94A3B8",
    fontSize: 8,
    marginTop: 2,
  },

  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },

  paymentIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#E7F7EF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  paymentIconText: {
    color: "#15965D",
    fontSize: 14,
    fontWeight: "900",
  },

  paymentInfo: {
    flex: 1,
  },

  paymentName: {
    color: "#163B76",
    fontSize: 9,
    fontWeight: "800",
  },

  paymentDate: {
    color: "#94A3B8",
    fontSize: 7,
    marginTop: 2,
  },

  paymentNotes: {
    color: "#64748B",
    fontSize: 7,
    marginTop: 2,
  },

  paymentAmount: {
    color: "#15965D",
    fontSize: 10,
    fontWeight: "900",
  },

impactCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 10,
  padding: 12,
  marginBottom: 8,
  borderWidth: 1,
  borderColor: "#CFEBDD",
},

impactHeader: {
  flexDirection: "row",
  alignItems: "center",
},

successIcon: {
  width: 34,
  height: 34,
  borderRadius: 10,
  backgroundColor: "#E7F7EF",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 9,
},

successIconText: {
  color: "#15965D",
  fontSize: 16,
  fontWeight: "900",
},

impactHeaderText: {
  flex: 1,
},

impactTitle: {
  color: "#126A45",
  fontSize: 12,
  fontWeight: "900",
},

impactSubtitle: {
  color: "#64748B",
  fontSize: 8,
  marginTop: 2,
},

impactBalance: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#F7FAFE",
  borderRadius: 10,
  padding: 10,
  marginTop: 10,
},

impactLabel: {
  color: "#94A3B8",
  fontSize: 7,
  fontWeight: "800",
},

oldBalance: {
  color: "#64748B",
  fontSize: 11,
  fontWeight: "800",
  marginTop: 3,
  textDecorationLine: "line-through",
},

newBalance: {
  color: "#15965D",
  fontSize: 12,
  fontWeight: "900",
  marginTop: 3,
},

impactArrow: {
  color: "#075FEA",
  fontSize: 16,
  fontWeight: "900",
},

impactRight: {
  alignItems: "flex-end",
},

impactSectionTitle: {
  color: "#063B8F",
  fontSize: 8,
  fontWeight: "900",
  marginTop: 12,
  marginBottom: 4,
},

impactRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: 6,
  borderBottomWidth: 1,
  borderBottomColor: "#EEF2F7",
},

impactRowLabel: {
  color: "#64748B",
  fontSize: 8,
},

impactRowValue: {
  color: "#163B76",
  fontSize: 9,
  fontWeight: "900",
},

impactSavingBox: {
  backgroundColor: "#F0FAF6",
  borderRadius: 10,
  padding: 10,
  marginTop: 8,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

impactSavingLabel: {
  color: "#64748B",
  fontSize: 8,
},

impactSavingValue: {
  color: "#15965D",
  fontSize: 11,
  fontWeight: "900",
},

impactMessage: {
  color: "#64748B",
  fontSize: 8,
  lineHeight: 12,
  marginTop: 8,
},

dismissImpact: {
  height: 34,
  borderRadius: 10,
  backgroundColor: "#075FEA",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 10,
},

dismissImpactText: {
  color: "#FFFFFF",
  fontSize: 9,
  fontWeight: "900",
},
});
