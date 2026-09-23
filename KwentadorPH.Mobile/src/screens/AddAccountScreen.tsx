import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { createFinancialAccount } from "../services/api";
import { getInstitutionLogo } from "../utils/institutionLogos";

const institutions = [
  {
    id: "77777777-7777-7777-7777-777777777777",
    name: "BDO",
    type: "Bank",
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    name: "BPI",
    type: "Bank",
  },
  {
    id: "88888888-8888-8888-8888-888888888888",
    name: "Metrobank",
    type: "Bank",
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "CIMB",
    type: "DigitalBank",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "GoTyme",
    type: "DigitalBank",
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "MariBank",
    type: "DigitalBank",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Maya",
    type: "DigitalBank",
  },
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "GCash",
    type: "EWallet",
  },
];

const accountTypes = [
  "Savings",
  "Checking",
  "DigitalBank",
  "EWallet",
];

export default function AddAccountScreen() {
  const navigation = useNavigation<any>();

  const [institution, setInstitution] = useState<{
    id: string;
    name: string;
    type: string;
  } | null>(null);
  const [accountName, setAccountName] = useState("");
  const [accountType, setAccountType] = useState("Savings");
  const [last4, setLast4] = useState("");
  const [balance, setBalance] = useState("");
  const [saving, setSaving] = useState(false);

 const selectInstitution = (
   item: {
     id: string;
     name: string;
     type: string;
   }
 ) => {
   setInstitution(item);

   if (!accountName.trim()) {
     setAccountName(`${item.name} Savings`);
   }

   if (item.type === "EWallet") {
     setAccountType("EWallet");
     setAccountName(`${item.name} Wallet`);
   } else if (item.type === "DigitalBank") {
     setAccountType("DigitalBank");
   } else {
     setAccountType("Savings");
   }
 };

  const handleSave = async () => {
    if (!institution) {
      Alert.alert(
        "Select Institution",
        "Please select a bank or wallet."
      );
      return;
    }

    if (!accountName.trim()) {
      Alert.alert(
        "Account Name",
        "Please enter an account name."
      );
      return;
    }

    if (last4.length !== 4) {
      Alert.alert(
        "Account Number",
        "Enter the last 4 digits of the account."
      );
      return;
    }

    const numericBalance = Number(balance);

    if (
      !Number.isFinite(numericBalance) ||
      numericBalance < 0
    ) {
      Alert.alert(
        "Invalid Balance",
        "Please enter a valid starting balance."
      );
      return;
    }

    try {
      setSaving(true);

     await createFinancialAccount({
       financialInstitutionId: institution!.id,
       accountName: accountName.trim(),
       maskedAccountNumber: `•••• ${last4}`,
       accountType,
       currentBalance: numericBalance,
       connectionType: "Manual",
     });

      Alert.alert(
        "Account Added",
        `${accountName} was connected successfully.`,
        [
          {
            text: "Done",
            onPress: () => navigation.goBack(),
          },
        ]
      );
   } catch (error: any) {
     console.log("ADD ACCOUNT ERROR:", error);

     Alert.alert(
       "Unable to Add Account",
       error?.message || JSON.stringify(error)
     );
   } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View>
          <Text style={styles.title}>Add Account</Text>
          <Text style={styles.subtitle}>
            Connect a bank or digital wallet
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>
          SELECT INSTITUTION
        </Text>

        <View style={styles.bankGrid}>
          {institutions.map((item) => {
            const selected = institution?.id === item.id;

            return (
              <Pressable
                key={item.id}
                style={[
                  styles.bankCard,
                  selected && styles.bankCardSelected,
                ]}
                onPress={() => selectInstitution(item)}
              >
                <View style={styles.logoBox}>
                  <Image
                    source={getInstitutionLogo(item.name)}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>

                <Text
                  numberOfLines={1}
                  style={[
                    styles.bankName,
                    selected && styles.bankNameSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>
            ACCOUNT NAME
          </Text>

          <TextInput
            style={styles.input}
            value={accountName}
            onChangeText={setAccountName}
            placeholder="e.g. BDO Savings"
            placeholderTextColor="#B39888"
          />

          <Text style={styles.fieldLabel}>
            ACCOUNT TYPE
          </Text>

          <View style={styles.typeRow}>
            {accountTypes.map((type) => (
              <Pressable
                key={type}
                style={[
                  styles.typeChip,
                  accountType === type &&
                    styles.typeChipSelected,
                ]}
                onPress={() => setAccountType(type)}
              >
                <Text
                  style={[
                    styles.typeText,
                    accountType === type &&
                      styles.typeTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>
            LAST 4 DIGITS
          </Text>

          <TextInput
            style={styles.input}
            value={last4}
            onChangeText={(text) =>
              setLast4(
                text.replace(/[^0-9]/g, "").slice(0, 4)
              )
            }
            keyboardType="number-pad"
            maxLength={4}
            placeholder="0000"
            placeholderTextColor="#B39888"
          />

          <Text style={styles.fieldLabel}>
            STARTING BALANCE
          </Text>

          <View style={styles.balanceInput}>
            <Text style={styles.peso}>₱</Text>

            <TextInput
              style={styles.balanceField}
              value={balance}
              onChangeText={setBalance}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#B39888"
            />
          </View>
        </View>

        <Pressable
          style={[
            styles.saveButton,
            saving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>
              Add Account
            </Text>
          )}
        </Pressable>

        <Text style={styles.secureText}>
          Protected by Myrna Sentinel
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF7F1",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#FFE4D1",
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#FFF1E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  backText: {
    color: "#FF6A00",
    fontSize: 28,
    lineHeight: 29,
    fontWeight: "600",
  },

  title: {
    color: "#2A1A12",
    fontSize: 19,
    fontWeight: "900",
  },

  subtitle: {
    color: "#8B6F61",
    fontSize: 10,
    marginTop: 1,
  },

  content: {
    padding: 14,
    paddingBottom: 35,
  },

  sectionLabel: {
    color: "#A45A2A",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 9,
  },

  bankGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },

  bankCard: {
    width: "23%",
    minHeight: 78,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F2DFD1",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },

  bankCardSelected: {
    borderColor: "#FF6A00",
    borderWidth: 2,
    backgroundColor: "#FFF5ED",
  },

  logoBox: {
    width: 42,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 38,
    height: 30,
  },

  bankName: {
    color: "#6F5548",
    fontSize: 8,
    fontWeight: "800",
    marginTop: 5,
    textAlign: "center",
  },

  bankNameSelected: {
    color: "#E85D04",
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F4E1D4",
    padding: 14,
  },

  fieldLabel: {
    color: "#A45A2A",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginBottom: 6,
    marginTop: 9,
  },

  input: {
    height: 44,
    backgroundColor: "#FFF9F5",
    borderWidth: 1,
    borderColor: "#F0DED2",
    borderRadius: 12,
    paddingHorizontal: 12,
    color: "#2A1A12",
    fontSize: 12,
  },

  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFF1E6",
    borderWidth: 1,
    borderColor: "#FFD8BD",
  },

  typeChipSelected: {
    backgroundColor: "#FF6A00",
    borderColor: "#FF6A00",
  },

  typeText: {
    color: "#D95800",
    fontSize: 8,
    fontWeight: "800",
  },

  typeTextSelected: {
    color: "#FFFFFF",
  },

  balanceInput: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9F5",
    borderWidth: 1,
    borderColor: "#F0DED2",
    borderRadius: 12,
    paddingHorizontal: 12,
  },

  peso: {
    color: "#FF6A00",
    fontSize: 17,
    fontWeight: "900",
    marginRight: 6,
  },

  balanceField: {
    flex: 1,
    color: "#2A1A12",
    fontSize: 15,
    fontWeight: "800",
  },

  saveButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  secureText: {
    color: "#A45A2A",
    fontSize: 8,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 12,
  },
});