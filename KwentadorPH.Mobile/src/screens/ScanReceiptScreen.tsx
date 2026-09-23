import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import {
  analyzeReceipt,
  analyzeVoiceExpense,
  getFinancialAccounts,
  saveReceiptExpense,
} from "../services/api";

import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from "expo-audio";

import {
  ActivityIndicator,
  // existing imports...
} from "react-native";

export default function ScanReceiptScreen() {
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [scanMode, setScanMode] = useState<"receipt" | "voice">("receipt");
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY
  );

  const [isRecording, setIsRecording] = useState(false);
  const [voiceAudioUri, setVoiceAudioUri] =
    useState<string | null>(null);

  async function takePhoto() {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      alert("Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
      setAnalysis(null);
    }
  }

  async function choosePhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
      setAnalysis(null);
    }
  }

  async function handleAnalyze() {
    if (!receiptImage) return;

    try {
      setIsAnalyzing(true);
      setAnalysis(null);

      const result = await analyzeReceipt(receiptImage);

      setAnalysis(result);
      console.log("AI Receipt Result:", result);
    } catch (error: any) {
      console.log("Receipt Analysis Error:", error);
      alert(error?.message || "Failed to analyze receipt.");
    } finally {
      setIsAnalyzing(false);
    }
  }

useEffect(() => {
  async function loadAccounts() {
    try {
      const data = await getFinancialAccounts();
      setAccounts(data);
    } catch (error) {
      console.log("Account API Error:", error);
    }
  }

  loadAccounts();
}, []);

const handleSaveExpense = async () => {
  if (!analysis || !selectedAccountId) {
    alert("Please select BPI or Maya under Paid Using.");
    return;
  }

  try {
    setIsSaving(true);

    await saveReceiptExpense(
      analysis,
      selectedAccountId
    );

    alert("Expense saved successfully!");

    setAnalysis(null);
    setSelectedAccountId(null);
    setReceiptImage(null);

    // Refresh account balances
    const updatedAccounts =
      await getFinancialAccounts();

    setAccounts(updatedAccounts);
  } catch (error: any) {
    console.log("Save Expense Error:", error);

    alert(
      error?.message ||
      "Failed to save expense."
    );
  } finally {
    setIsSaving(false);
  }
};

const startVoiceRecording = async () => {
  const permission =
    await AudioModule.requestRecordingPermissionsAsync();

  if (!permission.granted) {
    alert("Microphone permission is required.");
    return;
  }

  await setAudioModeAsync({
    allowsRecording: true,
    playsInSilentMode: true,
  });

  await audioRecorder.prepareToRecordAsync();
  audioRecorder.record();

  setVoiceAudioUri(null);
  setIsRecording(true);
};



const stopVoiceRecording = async () => {
  try {
    await audioRecorder.stop();
    setIsRecording(false);

    const audioUri = audioRecorder.uri;
    setVoiceAudioUri(audioUri);

    if (!audioUri) {
      alert("No voice recording found.");
      return;
    }

    // Start spinner
    setIsProcessingVoice(true);

    const result = await analyzeVoiceExpense(audioUri);

    setAnalysis({
      merchantName: "Voice Expense",
      description: result.description,
      amount: result.amount,
      category: result.category,
      transactionDate: result.transactionDate,
      confidence: result.confidence,
    });

    setSelectedAccountId(null);
  } catch (error: any) {
    console.log("Voice Upload Error:", error);

    alert(
      error?.message ||
      "Failed to process voice expense."
    );
  } finally {
    // Always stop spinner
    setIsProcessingVoice(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scan Receipt</Text>

        <View style={styles.modeSelector}>
          <Pressable
            style={[
              styles.modeButton,
              scanMode === "receipt" && styles.modeButtonActive,
            ]}
            onPress={() => setScanMode("receipt")}
          >
            <Text
              style={[
                styles.modeIcon,
                scanMode === "receipt" && styles.modeTextActive,
              ]}
            >
              📷
            </Text>

            <Text
              style={[
                styles.modeText,
                scanMode === "receipt" && styles.modeTextActive,
              ]}
            >
              Scan Receipt
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeButton,
              scanMode === "voice" && styles.modeButtonActive,
            ]}
            onPress={() => setScanMode("voice")}
          >
            <Text
              style={[
                styles.modeIcon,
                scanMode === "voice" && styles.modeTextActive,
              ]}
            >
              🎙️
            </Text>

            <Text
              style={[
                styles.modeText,
                scanMode === "voice" && styles.modeTextActive,
              ]}
            >
              Voice Expense
            </Text>
          </Pressable>
        </View>

        <Text style={styles.subtitle}>
          Let Kwentador AI read and categorize your expense.
        </Text>

        {scanMode === "receipt" && (
         <>
        <View style={styles.preview}>
          {receiptImage ? (
            <Image
              source={{ uri: receiptImage }}
              style={styles.receiptImage}
              resizeMode="contain"
            />
          ) : (
            <>
              <Text style={styles.cameraIcon}>▣</Text>

              <Text style={styles.previewTitle}>
                Scan your receipt
              </Text>

              <Text style={styles.previewText}>
                Make sure the merchant, items and total are visible.
              </Text>
            </>
          )}
        </View>

        <Pressable
          style={styles.cameraButton}
          onPress={takePhoto}
        >
          <Text style={styles.cameraButtonText}>
            📷 Take Photo
          </Text>
        </Pressable>

        <Pressable
          style={styles.galleryButton}
          onPress={choosePhoto}
        >
          <Text style={styles.galleryButtonText}>
            Choose from Gallery
          </Text>
        </Pressable>

      {receiptImage && (
        <Pressable
          style={styles.analyzeButton}
          onPress={handleAnalyze}
          disabled={isAnalyzing}
        >
          <Text style={styles.analyzeText}>
            {isAnalyzing
              ? "Analyzing Receipt..."
              : "✨ Analyze with Kwentador AI"}
          </Text>
        </Pressable>
      )}
    </>
  )}

{scanMode === "voice" && (
  <View style={styles.voiceCard}>
    <View style={styles.micCircle}>
      <Text style={styles.micIcon}>🎙️</Text>
    </View>

    <Text style={styles.voiceTitle}>
      Add Expense by Voice
    </Text>

    <Text style={styles.voiceDescription}>
      Sabihin mo lang ang expense mo.
    </Text>

    <View style={styles.voiceExample}>
      <Text style={styles.voiceExampleText}>
        “pamasahe 500 pesos”
      </Text>
    </View>

    <Pressable
      style={[
        styles.voiceButton,
        isRecording && styles.voiceButtonRecording,
      ]}
      onPress={
        isRecording
          ? stopVoiceRecording
          : startVoiceRecording
      }
    >
      <Text style={styles.voiceButtonText}>
        {isRecording
          ? "⏹ Stop Recording"
          : "🎙️ Tap to Speak"}
      </Text>
    </Pressable>

     {isProcessingVoice && (
          <View style={styles.voiceProcessing}>
          <ActivityIndicator
            size="large"
            color="#FF6A00"
          />

            <Text style={styles.processingTitle}>
              Processing your expense...
            </Text>

            <Text style={styles.processingText}>
              Converting voice and analyzing with AI
            </Text>
          </View>
        )}
  </View>
)}

    <Modal
      visible={analysis !== null}
      transparent
      animationType="fade"
      onRequestClose={() => setAnalysis(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            ✨ AI Receipt Result
          </Text>

          <Text style={styles.modalMerchant}>
            {analysis?.merchantName}
          </Text>

          <Text style={styles.modalAmount}>
            ₱{Number(analysis?.amount || 0).toLocaleString("en-PH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>
              {analysis?.category}
            </Text>

            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>
              {analysis?.transactionDate}
            </Text>

            <Text style={styles.infoLabel}>Description</Text>
            <Text style={styles.infoValue}>
              {analysis?.description}
            </Text>
          </View>

          <Text style={styles.accountLabel}>Paid Using</Text>

          <View style={styles.accountList}>
            {accounts.map((account) => {
              const selected = selectedAccountId === account.id;

              return (
                <Pressable
                  key={account.id}
                  onPress={() => setSelectedAccountId(account.id)}
                  style={[
                    styles.accountOption,
                    selected && styles.accountOptionSelected,
                  ]}
                >
                  <View>
                    <Text style={styles.accountName}>
                      {account.institution.shortName}
                    </Text>

                    <Text style={styles.accountDetails}>
                      {account.accountName} • {account.maskedAccountNumber}
                    </Text>
                  </View>

                  <View style={styles.accountRight}>
                    <Text style={styles.accountBalance}>
                      ₱{Number(account.currentBalance).toLocaleString("en-PH")}
                    </Text>

                    <View
                      style={[
                        styles.radioOuter,
                        selected && styles.radioOuterSelected,
                      ]}
                    >
                      {selected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.confidence}>
            AI Confidence:{" "}
            {Math.round((analysis?.confidence || 0) * 100)}%
          </Text>

          <View style={styles.modalActions}>
            <Pressable
              style={styles.cancelButton}
              onPress={() => setAnalysis(null)}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.confirmButton,
                (!selectedAccountId || isSaving) &&
                  styles.confirmButtonDisabled,
              ]}
              disabled={!selectedAccountId || isSaving}
              onPress={handleSaveExpense}
            >
              <Text style={styles.confirmButtonText}>
                {isSaving
                  ? "Saving..."
                  : "Confirm & Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: "#FFF0E3",
},


  content: {
    flex: 1,
    padding: 16,
  },

title: {
  color: "#1F2937",
  fontSize: 24,
  fontWeight: "900",
},


  subtitle: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 3,
    marginBottom: 20,
  },

preview: {
  height: 350,
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  borderWidth: 2,
  borderStyle: "dashed",
  borderColor: "#FFD8BD",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  overflow: "hidden",
},

  receiptImage: {
    width: "100%",
    height: "100%",
  },

cameraIcon: {
  fontSize: 50,
  color: "#FF6A00",
},


previewTitle: {
  color: "#1F2937",
  fontSize: 16,
  fontWeight: "800",
  marginTop: 10,
},

  previewText: {
    color: "#94A3B8",
    fontSize: 10,
    textAlign: "center",
    marginTop: 5,
  },

cameraButton: {
  backgroundColor: "#FF6A00",
  borderRadius: 14,
  paddingVertical: 14,
  alignItems: "center",
  marginTop: 16,
},


  cameraButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  galleryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
  },

galleryButtonText: {
  color: "#FF6A00",
  fontSize: 12,
  fontWeight: "700",
},

analyzeButton: {
  backgroundColor: "#E85D04",
  borderRadius: 14,
  paddingVertical: 14,
  alignItems: "center",
  marginTop: 8,
},


  analyzeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },

resultCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 16,
  padding: 16,
  marginTop: 12,
  borderWidth: 1,
  borderColor: "#FFD8BD",
},


resultTitle: {
  color: "#FF6A00",
  fontSize: 12,
  fontWeight: "800",
  marginBottom: 10,
},



merchant: {
  color: "#1F2937",
  fontSize: 18,
  fontWeight: "900",
},

amount: {
  color: "#111827",
  fontSize: 24,
  fontWeight: "900",
  marginTop: 4,
},

detail: {
  color: "#64748B",
  fontSize: 11,
  marginTop: 4,
},

confidence: {
  color: "#16A34A",
  fontSize: 10,
  fontWeight: "700",
  marginTop: 8,
},

modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.55)",
  justifyContent: "center",
  padding: 20,
},

modalCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 22,
  padding: 20,
},

modalTitle: {
  color: "#FF6A00",
  fontSize: 13,
  fontWeight: "800",
},

modalMerchant: {
  color: "#1F2937",
  fontSize: 21,
  fontWeight: "900",
  marginTop: 14,
},

modalAmount: {
  color: "#111827",
  fontSize: 30,
  fontWeight: "900",
  marginTop: 3,
},

infoBox: {
  backgroundColor: "#FFF7F1",
  borderRadius: 14,
  padding: 14,
  marginTop: 16,
},


infoLabel: {
  color: "#94A3B8",
  fontSize: 9,
  fontWeight: "700",
  marginTop: 5,
},

infoValue: {
  color: "#334155",
  fontSize: 12,
  fontWeight: "700",
  marginTop: 2,
},

confidence: {
  color: "#16A34A",
  fontSize: 10,
  fontWeight: "800",
  marginTop: 12,
},

modalActions: {
  flexDirection: "row",
  gap: 8,
  marginTop: 18,
},

cancelButton: {
  flex: 1,
  backgroundColor: "#EEF2F7",
  paddingVertical: 13,
  borderRadius: 12,
  alignItems: "center",
},

cancelButtonText: {
  color: "#64748B",
  fontSize: 11,
  fontWeight: "800",
},

confirmButton: {
  flex: 2,
  backgroundColor: "#FF6A00",
  paddingVertical: 13,
  borderRadius: 12,
  alignItems: "center",
},


confirmButtonText: {
  color: "#FFFFFF",
  fontSize: 11,
  fontWeight: "800",
},

accountLabel: {
  color: "#64748B",
  fontSize: 10,
  fontWeight: "800",
  marginTop: 14,
  marginBottom: 6,
},

accountList: {
  gap: 6,
},

accountOption: {
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 12,
  padding: 10,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

accountOptionSelected: {
  borderColor: "#FF6A00",
  backgroundColor: "#FFF1E6",
},

accountName: {
  color: "#1F2937",
  fontSize: 12,
  fontWeight: "900",
},


accountDetails: {
  color: "#94A3B8",
  fontSize: 9,
  marginTop: 2,
},

accountBalance: {
  color: "#334155",
  fontSize: 11,
  fontWeight: "800",
},




accountRight: {
  alignItems: "flex-end",
  gap: 6,
},

accountBalance: {
  color: "#334155",
  fontSize: 11,
  fontWeight: "800",
},

radioOuter: {
  width: 18,
  height: 18,
  borderRadius: 9,
  borderWidth: 2,
  borderColor: "#CBD5E1",
  alignItems: "center",
  justifyContent: "center",
},

radioOuterSelected: {
  borderColor: "#FF6A00",
},


radioInner: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "#075FEA",
},

confirmButtonDisabled: {
  opacity: 0.45,
},

modeSelector: {
  flexDirection: "row",
  backgroundColor: "#FFF1E6",
  borderRadius: 14,
  padding: 4,
  marginBottom: 16,
},

modeButton: {
  flex: 1,
  paddingVertical: 10,
  borderRadius: 11,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  gap: 6,
},

modeButtonActive: {
  backgroundColor: "#FF6A00",
},

modeIcon: {
  fontSize: 14,
},

modeText: {
  color: "#64748B",
  fontSize: 11,
  fontWeight: "800",
},

modeTextActive: {
  color: "#FFFFFF",
},

voiceCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 22,
  padding: 24,
  alignItems: "center",
},

micCircle: {
  width: 76,
  height: 76,
  borderRadius: 38,
  backgroundColor: "#FFF1E6",
  alignItems: "center",
  justifyContent: "center",
},

micIcon: {
  fontSize: 32,
},

voiceTitle: {
  color: "#1F2937",
  fontSize: 18,
  fontWeight: "900",
  marginTop: 14,
},

voiceDescription: {
  color: "#64748B",
  fontSize: 11,
  marginTop: 5,
},

voiceExample: {
  backgroundColor: "#F8FAFC",
  borderRadius: 12,
  padding: 12,
  width: "100%",
  marginTop: 16,
},

voiceExampleText: {
  color: "#64748B",
  fontSize: 11,
  textAlign: "center",
  fontStyle: "italic",
},

voiceButton: {
  backgroundColor: "#FF6A00",
  width: "100%",
  borderRadius: 14,
  paddingVertical: 14,
  alignItems: "center",
  marginTop: 14,
},

voiceButtonText: {
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: "900",
},

voiceButtonRecording: {
  backgroundColor: "#DC2626",
},

processingRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
},

voiceProcessing: {
  marginTop: 20,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 20,
},

processingTitle: {
  marginTop: 12,
  fontSize: 16,
  fontWeight: "700",
  color: "#FF6A00",
},

processingText: {
  marginTop: 5,
  fontSize: 12,
  color: "#64748B",
},

});