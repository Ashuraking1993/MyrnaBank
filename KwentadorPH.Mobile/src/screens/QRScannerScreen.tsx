import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { useNavigation } from "@react-navigation/native";

export default function QRScannerScreen() {
  const navigation = useNavigation<any>();

  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = ({
    data,
  }: {
    data: string;
  }) => {
    if (scanned) return;

    try {
      const qrData = JSON.parse(data);

      if (qrData.type !== "MYRNA_TRANSFER") {
        Alert.alert(
          "Invalid QR",
          "This QR code is not a Myrna Bank payment QR."
        );
        return;
      }

      setScanned(true);

     navigation.replace("Transfer", {
       qrRecipient: {
         accountId: qrData.accountId,
         accountName: qrData.accountName,
         institution: qrData.institution,
         accountNumber: qrData.accountNumber,
       },
     });
    } catch {
      Alert.alert(
        "Invalid QR",
        "Unable to read this QR code."
      );
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#FF6A00"
        />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>
            Camera Access
          </Text>

          <Text style={styles.permissionText}>
            Myrna Bank needs camera access to scan
            payment QR codes.
          </Text>

          <Pressable
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>
              Allow Camera
            </Text>
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
     <CameraView
       style={{
         position: "absolute",
         top: 0,
         left: 0,
         right: 0,
         bottom: 0,
       }}
       facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanned ? undefined : handleBarcodeScanned
        }
      />

      <SafeAreaView style={styles.overlay}>
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.title}>
              Scan Myrna QR
            </Text>

            <Text style={styles.subtitle}>
              Secure QR Transfer
            </Text>
          </View>
        </View>

        <View style={styles.scannerArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
        </View>

        <View style={styles.bottomCard}>
          <View style={styles.secureBadge}>
            <Text style={styles.secureText}>
              MYRNA SECURE QR
            </Text>
          </View>

          <Text style={styles.instruction}>
            Position the recipient's Myrna QR
            inside the frame.
          </Text>

          <Text style={styles.sentinelText}>
            Transfer will be checked by Myrna Sentinel
            before authorization.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },

  overlay: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 31,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  subtitle: {
    color: "#FFD8BD",
    fontSize: 9,
    marginTop: 2,
  },

  scannerArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  scanFrame: {
    width: 255,
    height: 255,
    position: "relative",
  },

  corner: {
    position: "absolute",
    width: 45,
    height: 45,
    borderColor: "#FF6A00",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderTopLeftRadius: 18,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderTopRightRadius: 18,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderBottomLeftRadius: 18,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderBottomRightRadius: 18,
  },

  bottomCard: {
    margin: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center",
  },

  secureBadge: {
    backgroundColor: "#FFF1E6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  secureText: {
    color: "#FF6A00",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  instruction: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
  },

  sentinelText: {
    color: "#667085",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 13,
    marginTop: 5,
  },

  permissionCard: {
    margin: 20,
    padding: 24,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  permissionTitle: {
    color: "#1F2937",
    fontSize: 20,
    fontWeight: "900",
  },

  permissionText: {
    color: "#667085",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 8,
  },

  permissionButton: {
    width: "100%",
    backgroundColor: "#FF6A00",
    paddingVertical: 13,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 18,
  },

  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  cancelButton: {
    marginTop: 14,
  },

  cancelText: {
    color: "#667085",
    fontSize: 10,
    fontWeight: "700",
  },
});