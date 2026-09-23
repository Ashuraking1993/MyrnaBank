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
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";

import { createDebtAccount } from "../services/api";

const debtTypes = [
  "Credit Card",
  "Personal Loan",
  "Digital Loan",
  "Auto Loan",
  "Home Loan",
  "Other",
];

export default function AddDebtScreen() {
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [debtType, setDebtType] = useState("Credit Card");
  const [originalBalance, setOriginalBalance] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const original = Number(originalBalance.replace(/,/g, ""));
    const current = Number(currentBalance.replace(/,/g, ""));
    const interest = Number(interestRate);
    const minimum = Number(minimumPayment.replace(/,/g, ""));

    if (
      !name.trim() ||
      !originalBalance ||
      !currentBalance ||
      !interestRate ||
      !minimumPayment
    ) {
      Alert.alert(
        "Missing Information",
        "Please complete all required fields."
      );
      return;
    }

    if (
      original <= 0 ||
      current < 0 ||
      interest < 0 ||
      minimum <= 0
    ) {
      Alert.alert(
        "Invalid Amount",
        "Please enter valid debt values."
      );
      return;
    }

    if (current > original) {
      Alert.alert(
        "Invalid Balance",
        "Current balance cannot exceed original balance."
      );
      return;
    }

    try {
      setSaving(true);

      await createDebtAccount({
        name: name.trim(),
        debtType,
        originalBalance: original,
        currentBalance: current,
        interestRate: interest,
        minimumPayment: minimum,
        dueDate: dueDate
          ? new Date(`${dueDate}T00:00:00`).toISOString()
          : null,
      });

      Alert.alert(
        "Debt Added",
        "Your debt account has been added successfully.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.log("Add Debt Error:", error);

      Alert.alert(
        "Unable to Add Debt",
        error?.message || "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

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

          <View>
            <Text style={styles.title}>Add Debt</Text>
            <Text style={styles.subtitle}>
              Add a debt to your payoff plan
            </Text>
          </View>
        </View>

        {/* BASIC INFO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Debt Information
          </Text>

          <FieldLabel text="DEBT NAME" />

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. BPI Credit Card"
            placeholderTextColor="#A0AEC0"
          />

          <FieldLabel text="DEBT TYPE" />

          <View style={styles.typeContainer}>
            {debtTypes.map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.typeButton,
                  debtType === type && styles.typeButtonActive,
                ]}
                onPress={() => setDebtType(type)}
              >
                <Text
                  style={[
                    styles.typeText,
                    debtType === type && styles.typeTextActive,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* BALANCE */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Balance Details
          </Text>

          <FieldLabel text="ORIGINAL BALANCE" />

          <MoneyInput
            value={originalBalance}
            onChangeText={setOriginalBalance}
            placeholder="50,000"
          />

          <FieldLabel text="CURRENT BALANCE" />

          <MoneyInput
            value={currentBalance}
            onChangeText={setCurrentBalance}
            placeholder="45,000"
          />

          <Text style={styles.helper}>
            Enter the remaining amount you currently owe.
          </Text>
        </View>

        {/* PAYMENT DETAILS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Payment Details
          </Text>

          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <FieldLabel text="INTEREST / APR" />

              <View style={styles.inputWithSuffix}>
                <TextInput
                  style={styles.flexInput}
                  value={interestRate}
                  onChangeText={setInterestRate}
                  keyboardType="decimal-pad"
                  placeholder="24"
                  placeholderTextColor="#A0AEC0"
                />

                <Text style={styles.suffix}>%</Text>
              </View>
            </View>

            <View style={styles.column}>
              <FieldLabel text="MIN. PAYMENT" />

              <View style={styles.inputWithPrefix}>
                <Text style={styles.prefix}>₱</Text>

                <TextInput
                  style={styles.flexInput}
                  value={minimumPayment}
                  onChangeText={setMinimumPayment}
                  keyboardType="numeric"
                  placeholder="2,500"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
            </View>
          </View>

          <FieldLabel text="NEXT DUE DATE (OPTIONAL)" />

          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#A0AEC0"
          />

          <Text style={styles.helper}>
            Example: 2026-10-15
          </Text>
        </View>

        {/* INFO */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Text style={styles.infoIconText}>✦</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Kwentador Tip
            </Text>

            <Text style={styles.infoText}>
              Accurate balances, interest rates and minimum
              payments help Kwentador compare your payoff
              strategies more accurately.
            </Text>
          </View>
        </View>

        {/* SAVE */}
        <Pressable
          style={[
            styles.saveButton,
            saving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Adding Debt..." : "Add to Debt Plan"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldLabel({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function MoneyInput({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.inputWithPrefix}>
      <Text style={styles.prefix}>₱</Text>

      <TextInput
        style={styles.flexInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
      />
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
    marginBottom: 7,
  },

  label: {
    color: "#64748B",
    fontSize: 8,
    fontWeight: "800",
    marginBottom: 4,
    marginTop: 7,
  },

  input: {
    height: 40,
    backgroundColor: "#F7FAFE",
    borderWidth: 1,
    borderColor: "#DCE7F6",
    borderRadius: 10,
    paddingHorizontal: 10,
    color: "#163B76",
    fontSize: 10,
    fontWeight: "700",
  },

  inputWithPrefix: {
    height: 40,
    backgroundColor: "#F7FAFE",
    borderWidth: 1,
    borderColor: "#DCE7F6",
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  inputWithSuffix: {
    height: 40,
    backgroundColor: "#F7FAFE",
    borderWidth: 1,
    borderColor: "#DCE7F6",
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  prefix: {
    color: "#063B8F",
    fontSize: 12,
    fontWeight: "900",
    marginRight: 4,
  },

  suffix: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "800",
  },

  flexInput: {
    flex: 1,
    height: "100%",
    color: "#163B76",
    fontSize: 10,
    fontWeight: "700",
  },

  helper: {
    color: "#94A3B8",
    fontSize: 7,
    lineHeight: 10,
    marginTop: 4,
  },

  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },

  typeButton: {
    backgroundColor: "#F2F6FC",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },

  typeButtonActive: {
    backgroundColor: "#E7F0FF",
    borderColor: "#075FEA",
  },

  typeText: {
    color: "#64748B",
    fontSize: 8,
    fontWeight: "700",
  },

  typeTextActive: {
    color: "#075FEA",
  },

  twoColumns: {
    flexDirection: "row",
    gap: 7,
  },

  column: {
    flex: 1,
  },

  infoCard: {
    backgroundColor: "#EAF3FF",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },

  infoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#075FEA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  infoIconText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    color: "#0646B8",
    fontSize: 10,
    fontWeight: "900",
  },

  infoText: {
    color: "#475569",
    fontSize: 8,
    lineHeight: 11,
    marginTop: 2,
  },

  saveButton: {
    height: 42,
    backgroundColor: "#075FEA",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
});