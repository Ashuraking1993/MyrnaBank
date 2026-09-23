import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";

import {
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { useCallback, useState } from "react";

import { getFinancialAccounts } from "../services/api";
import { getInstitutionLogo } from "../utils/institutionLogos";
export default function AccountsScreen() {
  const navigation = useNavigation<any>();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedQrAccount, setSelectedQrAccount] = useState<any>(null);

  const loadAccounts = async () => {
    try {
      setLoading(true);

      const data = await getFinancialAccounts();

      console.log(
        "FINANCIAL ACCOUNTS:",
        JSON.stringify(data, null, 2)
      );

      setAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Accounts Error:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  const totalBalance = accounts.reduce(
    (sum, account) =>
      sum + Number(account.currentBalance || 0),
    0
  );

  const formatMoney = (value: number) =>
    `₱${value.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getAccountName = (account: any) =>
    account.accountName ||
    account.name ||
    account.institution?.shortName ||
    account.institution?.name ||
    "Account";

  const getInstitutionName = (account: any) =>
    account.institution?.shortName ||
    account.institution?.name ||
    "Financial Account";

  const getAccountNumber = (account: any) =>
    account.maskedAccountNumber ||
    (account.accountNumberLast4
      ? `•••• ${account.accountNumberLast4}`
      : null);

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>My Accounts</Text>

          <Text style={styles.subtitle}>
            Manage your money with Myrna Bank
          </Text>
        </View>

        <View style={styles.secureBadge}>
          <View style={styles.secureDot} />

          <Text style={styles.secureText}>
            SECURE
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TOTAL BALANCE */}

        <ImageBackground
          source={require("../../assets/images/debt-strategy-bg.png")}
          style={styles.totalCard}
          imageStyle={styles.totalCardImage}
          resizeMode="cover"
        >
          <View style={styles.totalOverlay} />

          <View style={styles.totalTopRow}>
            <View>
              <Text style={styles.totalLabel}>
                TOTAL BALANCE
              </Text>

              <Text style={styles.totalAmount}>
                {formatMoney(totalBalance)}
              </Text>
            </View>

            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>
                PHP
              </Text>
            </View>
          </View>

          <View style={styles.totalDivider} />

          <View style={styles.totalBottomRow}>
            <View>
              <Text style={styles.totalBottomLabel}>
                ACCOUNTS
              </Text>

              <Text style={styles.totalBottomValue}>
                {accounts.length}
              </Text>
            </View>

            <View style={styles.balanceStatus}>
              <View style={styles.balanceStatusDot} />

              <Text style={styles.balanceStatusText}>
                Updated
              </Text>
            </View>
          </View>
      </ImageBackground>

        {/* MONEY ACTIONS */}
        <Text style={styles.sectionLabel}>
          MONEY ACTIONS
        </Text>

        <View style={styles.actionRow}>
          {/* TRANSFER */}
          <Pressable
            style={styles.primaryAction}
            onPress={() =>
              navigation.navigate("Transfer")
            }
          >
            <View style={styles.actionIconPrimary}>
              <Text style={styles.transferIcon}>
                ⇄
              </Text>
            </View>

            <View style={styles.actionTextContainer}>
              <Text style={styles.primaryActionTitle}>
                Transfer Money
              </Text>

              <Text style={styles.primaryActionSub}>
                Send via InstaPay
              </Text>
            </View>

            <Text style={styles.primaryActionArrow}>
              ›
            </Text>
          </Pressable>

         <Pressable
           style={styles.qrActionCard}
           onPress={() => navigation.navigate("QRScanner")}
         >
           <View style={styles.qrActionIcon}>
             <Text style={styles.qrActionIconText}>▣</Text>
           </View>

           <Text style={styles.qrActionTitle}>
             Scan QR
           </Text>

           <Text style={styles.qrActionSubtitle}>
             Pay instantly
           </Text>
         </Pressable>

          {/* ADD ACCOUNT */}
          <Pressable
            style={styles.secondaryAction}
            onPress={() =>
              navigation.navigate("AddAccount")
            }
          >
            <View style={styles.actionIconSecondary}>
              <Text style={styles.addIcon}>
                +
              </Text>
            </View>

            <Text style={styles.secondaryActionText}>
              Add Account
            </Text>
          </Pressable>
        </View>

        {/* SENTINEL INFO */}
        <View style={styles.sentinelCard}>
          <View style={styles.sentinelIcon}>
            <Image
              source={require("../../assets/images/sentinel.png")}
              style={styles.sentinelIconImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.sentinelContent}>
            <View style={styles.sentinelTitleRow}>
              <Text style={styles.sentinelTitle}>
                Sentinel Protection
              </Text>

              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />

                <Text style={styles.liveText}>
                  ACTIVE
                </Text>
              </View>
            </View>

            <Text style={styles.sentinelDescription}>
              Transfers are analyzed for unusual
              activity before authorization.
            </Text>
          </View>
        </View>

        {/* ACCOUNTS */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Your Accounts
            </Text>

            <Text style={styles.sectionSubtitle}>
              {accounts.length} connected financial{" "}
              {accounts.length === 1
                ? "account"
                : "accounts"}
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="small"
              color="#FF6A00"
            />

            <Text style={styles.loadingText}>
              Loading accounts...
            </Text>
          </View>
        ) : accounts.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>
                ₱
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No accounts yet
            </Text>

            <Text style={styles.emptyText}>
              Add your first financial account to
              start managing your money with Myrna.
            </Text>

            <Pressable
              style={styles.emptyButton}
              onPress={() =>
                navigation.navigate("AddAccount")
              }
            >
              <Text style={styles.emptyButtonText}>
                + Add Account
              </Text>
            </Pressable>
          </View>
        ) : (
          accounts.map((account) => (
            <Pressable
              key={account.id}
              style={({ pressed }) => [
                styles.accountCard,
                pressed && styles.accountCardPressed,
              ]}
            >
             <View style={styles.bankIcon}>
               <Image
                 source={getInstitutionLogo(
                   account.institution?.shortName ||
                   account.institution?.name
                 )}
                 style={styles.bankLogo}
                 resizeMode="contain"
               />
             </View>

              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>
                  {getAccountName(account)}
                </Text>

                <Text style={styles.accountMeta}>
                  {getInstitutionName(account)}
                  {account.accountType
                    ? ` • ${account.accountType}`
                    : ""}
                </Text>

                {getAccountNumber(account) && (
                  <Text style={styles.accountNumber}>
                    {getAccountNumber(account)}
                  </Text>
                )}
              </View>

             <View style={styles.accountRight}>
               <Text style={styles.accountBalance}>
                 {formatMoney(
                   Number(account.currentBalance || 0)
                 )}
               </Text>

               <Text style={styles.accountCurrency}>
                 {account.currency || "PHP"}
               </Text>

               <Pressable
                 style={styles.myQrButton}
                 onPress={() => {
                   setSelectedQrAccount(account);
                   setShowQrModal(true);
                 }}
               >
                 <Text style={styles.myQrButtonText}>
                   My QR
                 </Text>
               </Pressable>
             </View>
            </Pressable>
          ))
        )}

        {/* FOOTER */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            Protected by Myrna Sentinel
          </Text>

          <Text style={styles.footerSub}>
            Real-time transaction risk monitoring
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showQrModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.qrOverlay}>
          <View style={styles.qrCard}>
            <Text style={styles.qrTitle}>MYRNA BANK</Text>
            <Text style={styles.qrSubtitle}>
              Scan to send money
            </Text>

            {selectedQrAccount && (
              <View style={styles.qrBox}>
                <QRCode
                  value={JSON.stringify({
                    type: "MYRNA_TRANSFER",
                    accountId: selectedQrAccount.id,
                    accountName: selectedQrAccount.accountName,
                    institution:
                      selectedQrAccount.institution?.shortName,
                    accountNumber:
                      selectedQrAccount.maskedAccountNumber,
                  })}
                  size={190}
                />
              </View>
            )}

            <Text style={styles.qrAccountName}>
              {selectedQrAccount?.accountName}
            </Text>

            <Text style={styles.qrInstitution}>
              {selectedQrAccount?.institution?.shortName}
            </Text>

            <Pressable
              style={styles.qrDoneButton}
              onPress={() => setShowQrModal(false)}
            >
              <Text style={styles.qrDoneText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF7F1",
  },

  /* HEADER */

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
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

  headerText: {
    flex: 1,
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

  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1E6",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },

  secureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A66A",
    marginRight: 5,
  },

  secureText: {
    color: "#D95800",
    fontSize: 8,
    fontWeight: "900",
  },

  content: {
    padding: 14,
    paddingBottom: 34,
  },

  /* BALANCE */

  totalCard: {
    backgroundColor: "#FF6A00",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    overflow: "hidden",

    shadowColor: "#D95800",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 9,
    elevation: 4,
  },

  totalGlowOne: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.10)",
    right: -45,
    top: -65,
  },

  totalGlowTwo: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.07)",
    right: 55,
    bottom: -65,
  },

  totalTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  totalLabel: {
    color: "#FFE5D2",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  totalAmount: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    marginTop: 5,
  },

  currencyBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  currencyText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },

  totalDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.20)",
    marginVertical: 14,
  },

  totalBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  totalBottomLabel: {
    color: "#FFDCC5",
    fontSize: 8,
    fontWeight: "700",
  },

  totalBottomValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },

  balanceStatus: {
    flexDirection: "row",
    alignItems: "center",
  },

  balanceStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginRight: 5,
  },

  balanceStatusText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },

  /* ACTIONS */

  sectionLabel: {
    color: "#A45A2A",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  primaryAction: {
    flex: 1.7,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 11,
    borderWidth: 1,
    borderColor: "#FFD8BD",
  },

  secondaryAction: {
    flex: 1,
    minHeight: 72,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF1E6",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#FFD8BD",
  },

  actionIconPrimary: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  transferIcon: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  actionTextContainer: {
    flex: 1,
  },

  primaryActionTitle: {
    color: "#2A1A12",
    fontSize: 12,
    fontWeight: "900",
  },

  primaryActionSub: {
    color: "#8B6F61",
    fontSize: 9,
    marginTop: 2,
  },

  primaryActionArrow: {
    color: "#FF6A00",
    fontSize: 24,
    fontWeight: "700",
  },

  actionIconSecondary: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  addIcon: {
    color: "#FF6A00",
    fontSize: 20,
    fontWeight: "700",
  },

  secondaryActionText: {
    color: "#D95800",
    fontSize: 10,
    fontWeight: "800",
  },

  /* SENTINEL */

  sentinelCard: {
    flexDirection: "row",
    backgroundColor: "#2A1A12",
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
    alignItems: "center",
  },

  sentinelIcon: {

    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },

  sentinelIconText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  sentinelContent: {
    flex: 1,
  },

  sentinelTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  sentinelTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    marginRight: 7,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(22,166,106,0.16)",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },

  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#3DDC97",
    marginRight: 4,
  },

  liveText: {
    color: "#3DDC97",
    fontSize: 7,
    fontWeight: "900",
  },

  sentinelDescription: {
    color: "#D7C9C1",
    fontSize: 9,
    lineHeight: 13,
    marginTop: 3,
  },

  /* ACCOUNTS */

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  sectionTitle: {
    color: "#2A1A12",
    fontSize: 15,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: "#8B6F61",
    fontSize: 9,
    marginTop: 2,
  },

  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
  },

  loadingText: {
    color: "#8B6F61",
    fontSize: 10,
    marginTop: 8,
  },

  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 12,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F7E5D8",

    shadowColor: "#7A3E18",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },

  accountCardPressed: {
    opacity: 0.75,
  },

  bankIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#FFF1E6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

bankLogo: {
  width: 34,
  height: 34,
},

bankIconText: {
  color: "#FF6A00",
  fontSize: 16,
  fontWeight: "900",
},


  bankIconText: {
    color: "#FF6A00",
    fontSize: 16,
    fontWeight: "900",
  },

  accountInfo: {
    flex: 1,
  },

  accountName: {
    color: "#2A1A12",
    fontSize: 12,
    fontWeight: "900",
  },

  accountMeta: {
    color: "#8B6F61",
    fontSize: 9,
    marginTop: 2,
  },

  accountNumber: {
    color: "#B39888",
    fontSize: 9,
    marginTop: 2,
  },

  accountRight: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  accountBalance: {
    color: "#2A1A12",
    fontSize: 12,
    fontWeight: "900",
  },

  accountCurrency: {
    color: "#B39888",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 2,
  },

  /* EMPTY */

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F7E5D8",
  },

  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFF1E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  emptyIconText: {
    color: "#FF6A00",
    fontSize: 20,
    fontWeight: "900",
  },

  emptyTitle: {
    color: "#2A1A12",
    fontSize: 13,
    fontWeight: "900",
  },

  emptyText: {
    color: "#8B6F61",
    fontSize: 10,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 5,
    maxWidth: 260,
  },

  emptyButton: {
    backgroundColor: "#FF6A00",
    borderRadius: 11,
    paddingHorizontal: 15,
    paddingVertical: 9,
    marginTop: 12,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  /* FOOTER */

  footerNote: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 8,
  },

  footerText: {
    color: "#A45A2A",
    fontSize: 9,
    fontWeight: "800",
  },

  footerSub: {
    color: "#B39888",
    fontSize: 8,
    marginTop: 2,
  },

myQrButton: {
  marginTop: 7,
  backgroundColor: "#FFF1E6",
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 5,
},

myQrButtonText: {
  color: "#FF6A00",
  fontSize: 8,
  fontWeight: "900",
},

/* QR MODAL */

qrOverlay: {
  flex: 1,
  backgroundColor: "rgba(42, 26, 18, 0.55)",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 24,
},

qrCard: {
  width: "100%",
  maxWidth: 340,
  backgroundColor: "#FFFFFF",
  borderRadius: 24,
  paddingHorizontal: 22,
  paddingVertical: 24,
  alignItems: "center",
},

qrTitle: {
  color: "#FF6A00",
  fontSize: 18,
  fontWeight: "900",
  letterSpacing: 1,
},

qrSubtitle: {
  color: "#8B6F61",
  fontSize: 10,
  marginTop: 4,
  marginBottom: 18,
},

qrBox: {
  backgroundColor: "#FFFFFF",
  padding: 14,
  borderRadius: 16,
  borderWidth: 2,
  borderColor: "#FFE0CA",
  alignItems: "center",
  justifyContent: "center",
},

qrAccountName: {
  color: "#2A1A12",
  fontSize: 15,
  fontWeight: "900",
  marginTop: 16,
},

qrInstitution: {
  color: "#8B6F61",
  fontSize: 10,
  fontWeight: "700",
  marginTop: 3,
},

qrDoneButton: {
  width: "100%",
  height: 45,
  borderRadius: 13,
  backgroundColor: "#FF6A00",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 20,
},

qrDoneText: {
  color: "#FFFFFF",
  fontSize: 11,
  fontWeight: "900",
},

qrActionCard: {
  flex: 1,
  minHeight: 110,
  backgroundColor: "#FFFFFF",
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "#FFD8BD",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 8,
  marginHorizontal: 4,
},

qrActionIcon: {
  width: 48,
  height: 48,
  borderRadius: 14,
  backgroundColor: "#FFF1E6",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 7,
},

qrActionIconText: {
  color: "#FF6A00",
  fontSize: 23,
  fontWeight: "900",
},

qrActionTitle: {
  color: "#2A1A12",
  fontSize: 11,
  fontWeight: "900",
  textAlign: "center",
},

qrActionSubtitle: {
  color: "#8B6F61",
  fontSize: 8,
  marginTop: 2,
  textAlign: "center",
},
sentinelIconImage: {
  width: 50,
  height:60,
},
});