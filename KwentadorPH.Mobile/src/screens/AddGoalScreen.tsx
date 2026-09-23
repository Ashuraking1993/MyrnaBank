import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createFinancialGoal } from "../services/api";

export default function AddGoalScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Savings");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);

  const categories = [
    "Savings",
    "Travel",
    "Emergency",
    "Education",
    "Home",
    "Other",
  ];

  const handleCreateGoal = async () => {
    if (!name.trim()) {
      Alert.alert("Missing information", "Please enter a goal name.");
      return;
    }

    const target = Number(targetAmount.replace(/,/g, ""));
    const current = Number(currentAmount.replace(/,/g, "") || 0);

    if (!target || target <= 0) {
      Alert.alert(
        "Invalid amount",
        "Target amount must be greater than zero."
      );
      return;
    }

    if (current < 0 || current > target) {
      Alert.alert(
        "Invalid savings",
        "Current savings must be between zero and the target amount."
      );
      return;
    }

    // Expected format: YYYY-MM-DD
    const parsedDate = new Date(`${targetDate}T00:00:00`);

    if (
      !targetDate ||
      Number.isNaN(parsedDate.getTime())
    ) {
      Alert.alert(
        "Invalid date",
        "Enter the target date as YYYY-MM-DD."
      );
      return;
    }

    try {
      setSaving(true);

      await createFinancialGoal({
        name: name.trim(),
        category,
        targetAmount: target,
        currentAmount: current,
        targetDate: parsedDate.toISOString(),
      });

      Alert.alert(
        "Goal Created",
        "Your new financial goal has been created.",
        [
          {
            text: "Done",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.log("Create Goal Error:", error);

      Alert.alert(
        "Unable to create goal",
        error?.message || "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.back}>‹</Text>
            </Pressable>

            <View>
              <Text style={styles.title}>Add Goal</Text>
              <Text style={styles.subtitle}>
                Turn your plans into progress
              </Text>
            </View>
          </View>

          {/* GOAL NAME */}
          <Text style={styles.label}>Goal Name</Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Japan Travel Fund"
            placeholderTextColor="#A0A8B5"
          />

          {/* CATEGORY */}
          <Text style={styles.label}>Category</Text>

          <View style={styles.categories}>
            {categories.map((item) => {
              const selected = category === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.category,
                    selected && styles.categorySelected,
                  ]}
                  onPress={() => setCategory(item)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selected && styles.categoryTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* TARGET */}
          <Text style={styles.label}>Target Amount</Text>

          <View style={styles.moneyInput}>
            <Text style={styles.peso}>₱</Text>

            <TextInput
              style={styles.moneyTextInput}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="150,000"
              placeholderTextColor="#A0A8B5"
              keyboardType="numeric"
            />
          </View>

          {/* CURRENT */}
          <Text style={styles.label}>Current Savings</Text>

          <View style={styles.moneyInput}>
            <Text style={styles.peso}>₱</Text>

            <TextInput
              style={styles.moneyTextInput}
              value={currentAmount}
              onChangeText={setCurrentAmount}
              placeholder="0"
              placeholderTextColor="#A0A8B5"
              keyboardType="numeric"
            />
          </View>

          <Text style={styles.helper}>
            Enter the amount you have already saved for this goal.
          </Text>

          {/* TARGET DATE */}
          <Text style={styles.label}>Target Date</Text>

          <TextInput
            style={styles.input}
            value={targetDate}
            onChangeText={setTargetDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#A0A8B5"
          />

          {/* MYRNA INFO */}
          <View style={styles.myrnaCard}>
            <Text style={styles.myrnaTitle}>
              ✦ Myrna Goal Planner
            </Text>

            <Text style={styles.myrnaText}>
              Once your goal is created, Myrna will calculate
              your required monthly savings and check whether
              your goal fits your current cash flow.
            </Text>
          </View>

          {/* CREATE */}
          <Pressable
            style={[
              styles.createButton,
              saving && styles.disabledButton,
            ]}
            disabled={saving}
            onPress={handleCreateGoal}
          >
            <Text style={styles.createButtonText}>
              {saving ? "Creating Goal..." : "Create Goal"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

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
    marginBottom: 25,
  },

  back: {
    fontSize: 36,
    color: "#FF6A00",
    marginRight: 14,
  },

  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1F2937",
  },

  subtitle: {
    fontSize: 11,
    color: "#78859A",
    marginTop: 2,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 7,
    marginTop: 14,
  },

  input: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFD8BD",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1F2937",
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  category: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFD8BD",
    borderRadius: 20,
  },

  categorySelected: {
    backgroundColor: "#FF6A00",
    borderColor: "#FF6A00",
  },

  categoryText: {
    color: "#667085",
    fontSize: 11,
    fontWeight: "700",
  },

  categoryTextSelected: {
    color: "#FFFFFF",
  },

  moneyInput: {
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FFD8BD",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },

  peso: {
    color: "#FF6A00",
    fontSize: 18,
    fontWeight: "900",
    marginRight: 7,
  },

  moneyTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },

  helper: {
    color: "#8A94A6",
    fontSize: 10,
    marginTop: 5,
  },

  myrnaCard: {
    backgroundColor: "#FFF1E6",
    borderWidth: 1,
    borderColor: "#FFD8BD",
    borderRadius: 14,
    padding: 14,
    marginTop: 22,
  },

  myrnaTitle: {
    color: "#E85D04",
    fontSize: 13,
    fontWeight: "900",
  },

  myrnaText: {
    color: "#667085",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },

  createButton: {
    height: 52,
    backgroundColor: "#FF6A00",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  disabledButton: {
    opacity: 0.6,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
});