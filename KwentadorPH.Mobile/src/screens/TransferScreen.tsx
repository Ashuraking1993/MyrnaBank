import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  createTransfer,
  getFinancialAccounts,
  previewTransfer,
} from "../services/api";

export default function TransferScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const qrRecipient = route.params?.qrRecipient;

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] =
    useState(true);

  const [selectedAccountId, setSelectedAccountId] =
    useState("");

  const [recipientName, setRecipientName] =
    useState("");

  const [
    recipientInstitution,
    setRecipientInstitution,
  ] = useState("");

  const [
    recipientAccountNumber,
    setRecipientAccountNumber,
  ] = useState("");

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [previewing, setPreviewing] =
    useState(false);

  const [confirming, setConfirming] =
    useState(false);

  const [previewResult, setPreviewResult] =
    useState<any>(null);

  const [successResult, setSuccessResult] =
    useState<any>(null);

  const [showReview, setShowReview] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);

      const data = await getFinancialAccounts();

      const list = Array.isArray(data)
        ? data
        : [];

      setAccounts(list);

      if (list.length > 0) {
        setSelectedAccountId((current) =>
          current || list[0].id
        );
      }
    } catch (error) {
      console.log(
        "Transfer Accounts Error:",
        error
      );
    } finally {
      setLoadingAccounts(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

useEffect(() => {
  if (!qrRecipient) return;

  if (qrRecipient.accountName) {
    setRecipientName(qrRecipient.accountName);
  }

  if (qrRecipient.institution) {
    setRecipientInstitution(
      qrRecipient.institution
    );
  }

  if (qrRecipient.accountNumber) {
    setRecipientAccountNumber(
      qrRecipient.accountNumber
    );
  }
}, [qrRecipient]);

  const selectedAccount = useMemo(
    () =>
      accounts.find(
        (account) =>
          account.id === selectedAccountId
      ),
    [accounts, selectedAccountId]
  );

  const numericAmount =
    Number(amount.replace(/,/g, "")) || 0;

  const formatMoney = (value: number) =>
    `₱${Number(value || 0).toLocaleString(
      "en-PH",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

  const maskedRecipientAccount = () => {
    const clean =
      recipientAccountNumber.replace(
        /\s/g,
        ""
      );

    if (clean.length <= 4) {
      return clean;
    }

    return `••••${clean.slice(-4)}`;
  };

  const validateTransfer = () => {
    if (!selectedAccountId) {
      Alert.alert(
        "Select Account",
        "Please select a source account."
      );

      return false;
    }

    if (!recipientName.trim()) {
      Alert.alert(
        "Recipient Required",
        "Please enter the recipient name."
      );

      return false;
    }

    if (!recipientInstitution.trim()) {
      Alert.alert(
        "Institution Required",
        "Please enter the recipient bank or e-wallet."
      );

      return false;
    }

    if (!recipientAccountNumber.trim()) {
      Alert.alert(
        "Account Required",
        "Please enter the recipient account number."
      );

      return false;
    }

    if (numericAmount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid transfer amount."
      );

      return false;
    }

    if (
      selectedAccount &&
      numericAmount >
        Number(
          selectedAccount.currentBalance || 0
        )
    ) {
      Alert.alert(
        "Insufficient Balance",
        "Your selected account does not have enough balance."
      );

      return false;
    }

    return true;
  };

const buildPayload = () => ({
  fromFinancialAccountId:
    selectedAccountId,

  toFinancialAccountId:
    qrRecipient?.accountId || undefined,

  recipientName:
    recipientName.trim(),

  recipientInstitution:
    recipientInstitution.trim(),

  recipientAccountNumber:
    recipientAccountNumber.trim(),

  amount: numericAmount,

  channel: "InstaPay",

  note: note.trim() || undefined,
});

  const handleContinue = async () => {
    if (!validateTransfer()) {
      return;
    }

    try {
      setPreviewing(true);

      /*
       * Normal customer flow.
       *
       * Device / identity signals are FALSE here.
       * Later we can connect real device/security
       * infrastructure or a controlled hackathon
       * demo scenario.
       */
      const result =
        await previewTransfer({
          ...buildPayload(),
          isNewDevice: false,
          hasIdentityMismatch: false,
        });

    console.log(
      "SENTINEL PREVIEW:",
      JSON.stringify(result, null, 2)
    );

      setPreviewResult(result);
      setShowReview(true);
    } catch (error: any) {
      console.log(
        "Transfer Preview Error:",
        error
      );

      Alert.alert(
        "Unable to Review Transfer",
        error?.message ||
          "Please try again."
      );
    } finally {
      setPreviewing(false);
    }
  };

  const handleConfirm = async () => {
    if (!previewResult) {
      return;
    }

    const decision =
      previewResult?.sentinel?.decision;

    if (decision === "Hold") {
      Alert.alert(
        "Transfer Held",
        "Sentinel has held this transfer for additional security review."
      );

      return;
    }

    if (decision === "Verify") {
      Alert.alert(
        "Verification Required",
        "Additional identity verification is required before this transfer can continue."
      );

      return;
    }

    try {
      setConfirming(true);

      const result =
        await createTransfer(
          buildPayload()
        );

      setSuccessResult(result);
      setShowReview(false);
      setShowSuccess(true);
    } catch (error: any) {
      console.log(
        "Transfer Confirm Error:",
        error
      );

      Alert.alert(
        "Transfer Failed",
        error?.message ||
          "The transfer could not be completed."
      );
    } finally {
      setConfirming(false);
    }
  };

  const handleDone = () => {
    setShowSuccess(false);

    navigation.goBack();
  };

  const getRiskColor = (
    riskLevel?: string
  ) => {
    switch (
      riskLevel?.toLowerCase()
    ) {
      case "critical":
        return "#D92D20";

      case "high":
        return "#E5484D";

      case "medium":
        return "#F59E0B";

      default:
        return "#16A66A";
    }
  };

  const riskColor =
    getRiskColor(
      previewResult?.sentinel?.riskLevel
    );

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </Pressable>

        <View>
          <Text style={styles.title}>
            Transfer Money
          </Text>

          <Text style={styles.subtitle}>
            Send securely with Myrna
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* FROM ACCOUNT */}

        <Text style={styles.sectionLabel}>
          FROM ACCOUNT
        </Text>

        {loadingAccounts ? (
          <View
            style={
              styles.loadingAccounts
            }
          >
            <ActivityIndicator
              size="small"
              color="#FF6A00"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              Loading accounts...
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.accountSelector
            }
          >
            {accounts.map(
              (account) => {
                const selected =
                  account.id ===
                  selectedAccountId;

                return (
                  <Pressable
                    key={account.id}
                    style={[
                      styles.accountOption,
                      selected &&
                        styles.accountOptionSelected,
                    ]}
                    onPress={() =>
                      setSelectedAccountId(
                        account.id
                      )
                    }
                  >
                    <View
                      style={[
                        styles.accountIcon,
                        selected &&
                          styles.accountIconSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.accountIconText,
                          selected &&
                            styles.accountIconTextSelected,
                        ]}
                      >
                        {(
                          account.institution
                            ?.shortName ||
                          account.institution
                            ?.name ||
                          "M"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.accountOptionName,
                        selected &&
                          styles.accountOptionNameSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {account.accountName ||
                        "Account"}
                    </Text>

                    <Text
                      style={[
                        styles.accountOptionBalance,
                        selected &&
                          styles.accountOptionBalanceSelected,
                      ]}
                    >
                      {formatMoney(
                        Number(
                          account.currentBalance ||
                            0
                        )
                      )}
                    </Text>

                    {selected && (
                      <View
                        style={
                          styles.selectedBadge
                        }
                      >
                        <Text
                          style={
                            styles.selectedBadgeText
                          }
                        >
                          SELECTED
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              }
            )}
          </ScrollView>
        )}

        {/* RECIPIENT */}

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            Recipient Details
          </Text>

          <Text style={styles.inputLabel}>
            Recipient Name
          </Text>

          <TextInput
            style={styles.input}
            value={recipientName}
            onChangeText={
              setRecipientName
            }
            placeholder="e.g. Juan Dela Cruz"
            placeholderTextColor="#B39888"
          />

          <Text style={styles.inputLabel}>
            Bank / E-Wallet
          </Text>

          <TextInput
            style={styles.input}
            value={
              recipientInstitution
            }
            onChangeText={
              setRecipientInstitution
            }
            placeholder="e.g. GCash, Maya, BDO"
            placeholderTextColor="#B39888"
          />

          <Text style={styles.inputLabel}>
            Account Number
          </Text>

          <TextInput
            style={styles.input}
            value={
              recipientAccountNumber
            }
            onChangeText={
              setRecipientAccountNumber
            }
            placeholder="Enter account number"
            placeholderTextColor="#B39888"
            keyboardType="number-pad"
          />
        </View>

        {/* AMOUNT */}

        <View style={styles.formCard}>
          <View
            style={
              styles.formTitleRow
            }
          >
            <Text
              style={styles.formTitle}
            >
              Transfer Amount
            </Text>

            <View
              style={
                styles.instaPayBadge
              }
            >
              <Text
                style={
                  styles.instaPayText
                }
              >
                InstaPay
              </Text>
            </View>
          </View>

          <View
            style={
              styles.amountContainer
            }
          >
            <Text
              style={styles.pesoSign}
            >
              ₱
            </Text>

            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#D3B9A9"
              keyboardType="decimal-pad"
            />
          </View>

          {selectedAccount && (
            <Text
              style={
                styles.availableBalance
              }
            >
              Available balance:{" "}
              {formatMoney(
                Number(
                  selectedAccount.currentBalance ||
                    0
                )
              )}
            </Text>
          )}

          <Text style={styles.inputLabel}>
            Note{" "}
            <Text
              style={styles.optionalText}
            >
              (optional)
            </Text>
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.noteInput,
            ]}
            value={note}
            onChangeText={setNote}
            placeholder="What's this transfer for?"
            placeholderTextColor="#B39888"
            multiline
          />
        </View>

        {/* SENTINEL */}

        <View
          style={styles.sentinelInfo}
        >
          <View
            style={styles.sentinelIcon}
          >
            <Text
              style={
                styles.sentinelIconText
              }
            >
              S
            </Text>
          </View>

          <View
            style={
              styles.sentinelInfoText
            }
          >
            <Text
              style={
                styles.sentinelInfoTitle
              }
            >
              Protected by Sentinel
            </Text>

            <Text
              style={
                styles.sentinelInfoSub
              }
            >
              Your transfer will be
              analyzed for unusual
              activity before
              authorization.
            </Text>
          </View>

          <View
            style={
              styles.activeBadge
            }
          >
            <Text
              style={
                styles.activeText
              }
            >
              ACTIVE
            </Text>
          </View>
        </View>

        {/* CONTINUE */}

        <Pressable
          style={[
            styles.continueButton,
            previewing &&
              styles.buttonDisabled,
          ]}
          disabled={previewing}
          onPress={handleContinue}
        >
          {previewing ? (
            <ActivityIndicator
              color="#FFFFFF"
              size="small"
            />
          ) : (
            <>
              <Text
                style={
                  styles.continueButtonText
                }
              >
                Review Transfer
              </Text>

              <Text
                style={
                  styles.continueArrow
                }
              >
                →
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* REVIEW MODAL */}

      <Modal


        visible={showReview}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowReview(false)
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.reviewModal}
          >
            <View
              style={
                styles.modalHandle
              }
            />

            <View
              style={
                styles.reviewHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.reviewTitle
                  }
                >
                  Review Transfer
                </Text>

                <Text
                  style={
                    styles.reviewSubtitle
                  }
                >
                  Check the details before
                  confirming
                </Text>
              </View>

              <Pressable
                style={
                  styles.closeButton
                }
                onPress={() =>
                  setShowReview(false)
                }
              >
                <Text
                  style={
                    styles.closeText
                  }
                >
                  ×
                </Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              {/* TRANSFER SUMMARY */}

              <View
                style={
                  styles.transferSummary
                }
              >
                <Text
                  style={
                    styles.summaryAmountLabel
                  }
                >
                  YOU'RE SENDING
                </Text>

                <Text
                  style={
                    styles.summaryAmount
                  }
                >
                  {formatMoney(
                    numericAmount
                  )}
                </Text>

                <View
                  style={
                    styles.summaryDivider
                  }
                />

                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    From
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    {selectedAccount
                      ?.accountName ||
                      "Account"}
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Recipient
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    {recipientName}
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Institution
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    {recipientInstitution}
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Account
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    {maskedRecipientAccount()}
                  </Text>
                </View>

                <View
                  style={
                    styles.summaryRow
                  }
                >
                  <Text
                    style={
                      styles.summaryLabel
                    }
                  >
                    Channel
                  </Text>

                  <Text
                    style={
                      styles.summaryValue
                    }
                  >
                    InstaPay
                  </Text>
                </View>
              </View>

              {/* SENTINEL RESULT */}

              <View
                style={
                  styles.riskCard
                }
              >
                <View
                  style={
                    styles.riskHeader
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.riskEyebrow
                      }
                    >
                      MYRNA SENTINEL
                    </Text>

                    <Text
                      style={
                        styles.riskTitle
                      }
                    >
                      Security Check
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.riskScoreCircle,
                      {
                        borderColor:
                          riskColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.riskScore,
                        {
                          color:
                            riskColor,
                        },
                      ]}
                    >
                      {previewResult
                        ?.sentinel
                        ?.overallRiskScore ??
                        0}
                    </Text>

                    <Text
                      style={
                        styles.riskScoreMax
                      }
                    >
                      /100
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.riskStatusRow
                  }
                >
                  <View
                    style={[
                      styles.riskPill,
                      {
                        backgroundColor:
                          `${riskColor}15`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.riskPillText,
                        {
                          color:
                            riskColor,
                        },
                      ]}
                    >
                      {previewResult
                        ?.sentinel
                        ?.riskLevel ||
                        "Low"}{" "}
                      RISK
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.decisionText,
                      {
                        color:
                          riskColor,
                      },
                    ]}
                  >
                    {previewResult
                      ?.sentinel
                      ?.decision ||
                      "Allow"}
                  </Text>
                </View>

                {previewResult?.sentinel
                  ?.signals?.length >
                  0 && (
                  <View
                    style={
                      styles.signalList
                    }
                  >
                    {previewResult.sentinel.signals.map(
                      (
                        signal: any,
                        index: number
                      ) => (
                        <View
                          key={index}
                          style={
                            styles.signalRow
                          }
                        >
                          <View
                            style={[
                              styles.signalDot,
                              {
                                backgroundColor:
                                  getRiskColor(
                                    signal.severity
                                  ),
                              },
                            ]}
                          />

                          <View
                            style={
                              styles.signalContent
                            }
                          >
                            <Text
                              style={
                                styles.signalCategory
                              }
                            >
                              {
                                signal.category
                              }
                            </Text>

                            <Text
                              style={
                                styles.signalText
                              }
                            >
                              {
                                signal.signal
                              }
                            </Text>
                          </View>

                          <Text
                            style={
                              styles.signalScore
                            }
                          >
                            +{signal.score}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                )}

                {previewResult
                  ?.sentinel
                  ?.decision ===
                  "Allow" && (
                  <View
                    style={
                      styles.clearMessage
                    }
                  >
                    <Text
                      style={
                        styles.clearMessageText
                      }
                    >
                      ✓ Sentinel cleared
                      this transfer.
                    </Text>
                  </View>
                )}

                {previewResult
                  ?.sentinel
                  ?.decision ===
                  "Monitor" && (
                  <View
                    style={
                      styles.monitorMessage
                    }
                  >
                    <Text
                      style={
                        styles.monitorMessageText
                      }
                    >
                      Sentinel will monitor
                      this transaction.
                    </Text>
                  </View>
                )}

                {previewResult
                  ?.sentinel
                  ?.decision ===
                  "Verify" && (
                  <View
                    style={
                      styles.verifyMessage
                    }
                  >
                    <Text
                      style={
                        styles.verifyMessageTitle
                      }
                    >
                      Additional verification
                      required
                    </Text>

                    <Text
                      style={
                        styles.verifyMessageText
                      }
                    >
                      Security signals require
                      identity verification
                      before this transfer can
                      continue.
                    </Text>
                  </View>
                )}

                {previewResult
                  ?.sentinel
                  ?.decision ===
                  "Hold" && (
                  <View
                    style={
                      styles.holdMessage
                    }
                  >
                    <Text
                      style={
                        styles.holdMessageTitle
                      }
                    >
                      Transfer temporarily
                      held
                    </Text>

                    <Text
                      style={
                        styles.holdMessageText
                      }
                    >
                      Sentinel detected
                      high-risk activity. No
                      funds have been moved.
                    </Text>
                  </View>
                )}
              </View>

              {/* ACTIONS */}

              {(previewResult?.sentinel
                ?.decision === "Allow" ||
                previewResult?.sentinel
                  ?.decision ===
                  "Monitor") && (
                <Pressable
                  style={[
                    styles.confirmButton,
                    confirming &&
                      styles.buttonDisabled,
                  ]}
                  disabled={confirming}
                  onPress={
                    handleConfirm
                  }
                >
                  {confirming ? (
                    <ActivityIndicator
                      color="#FFFFFF"
                      size="small"
                    />
                  ) : (
                    <Text
                      style={
                        styles.confirmButtonText
                      }
                    >
                      Confirm Transfer
                    </Text>
                  )}
                </Pressable>
              )}

              {previewResult?.sentinel
                ?.decision ===
                "Verify" && (
                <Pressable
                  style={
                    styles.verifyButton
                  }
                  onPress={() =>
                    Alert.alert(
                      "Verification",
                      "Identity verification will be connected in the next step."
                    )
                  }
                >
                  <Text
                    style={
                      styles.verifyButtonText
                    }
                  >
                    Verify Identity
                  </Text>
                </Pressable>
              )}

              <Pressable
                style={
                  styles.cancelButton
                }
                onPress={() =>
                  setShowReview(false)
                }
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  Cancel
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* SUCCESS MODAL */}

      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View
          style={
            styles.successOverlay
          }
        >
          <View
            style={styles.successCard}
          >
            <View
              style={
                styles.successIcon
              }
            >
              <Text
                style={
                  styles.successIconText
                }
              >
                ✓
              </Text>
            </View>

            <Text
              style={
                styles.successTitle
              }
            >
              Transfer Successful
            </Text>

            <Text
              style={
                styles.successAmount
              }
            >
              {formatMoney(
                Number(
                  successResult?.transfer
                    ?.amount || 0
                )
              )}
            </Text>

            <Text
              style={
                styles.successRecipient
              }
            >
              sent to{" "}
              {successResult?.transfer
                ?.recipientName ||
                recipientName}
            </Text>

            <View
              style={
                styles.successDetails
              }
            >
              <View
                style={
                  styles.successRow
                }
              >
                <Text
                  style={
                    styles.successLabel
                  }
                >
                  Reference
                </Text>

                <Text
                  style={
                    styles.successValue
                  }
                >
                  {successResult?.transfer
                    ?.referenceNumber ||
                    "-"}
                </Text>
              </View>

              <View
                style={
                  styles.successRow
                }
              >
                <Text
                  style={
                    styles.successLabel
                  }
                >
                  Status
                </Text>

                <Text
                  style={
                    styles.successStatus
                  }
                >
                  {successResult?.transfer
                    ?.status ||
                    "Completed"}
                </Text>
              </View>

              <View
                style={
                  styles.successRow
                }
              >
                <Text
                  style={
                    styles.successLabel
                  }
                >
                  Sentinel
                </Text>

                <Text
                  style={
                    styles.successSentinel
                  }
                >
                  {
                    successResult?.sentinel
                      ?.decision
                  }
                </Text>
              </View>

              {successResult?.remainingBalance !==
                null &&
                successResult?.remainingBalance !==
                  undefined && (
                  <View
                    style={
                      styles.successRow
                    }
                  >
                    <Text
                      style={
                        styles.successLabel
                      }
                    >
                      Balance
                    </Text>

                    <Text
                      style={
                        styles.successValue
                      }
                    >
                      {formatMoney(
                        Number(
                          successResult.remainingBalance
                        )
                      )}
                    </Text>
                  </View>
                )}
            </View>

            <View
              style={
                styles.successSentinelNote
              }
            >
              <Text
                style={
                  styles.successSentinelNoteText
                }
              >
                Protected by Myrna Sentinel
              </Text>
            </View>

            <Pressable
              style={styles.doneButton}
              onPress={handleDone}
            >
              <Text
                style={
                  styles.doneButtonText
                }
              >
                Done
              </Text>
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
    marginBottom: 8,
  },

  loadingAccounts: {
    minHeight: 95,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  loadingText: {
    color: "#8B6F61",
    fontSize: 9,
    marginTop: 6,
  },

  accountSelector: {
    gap: 8,
    paddingBottom: 15,
  },

  accountOption: {
    width: 155,
    minHeight: 105,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F1DED0",
    padding: 11,
  },

  accountOptionSelected: {
    backgroundColor: "#FF6A00",
    borderColor: "#FF6A00",
  },

  accountIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: "#FFF1E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  accountIconSelected: {
    backgroundColor:
      "rgba(255,255,255,0.20)",
  },

  accountIconText: {
    color: "#FF6A00",
    fontSize: 12,
    fontWeight: "900",
  },

  accountIconTextSelected: {
    color: "#FFFFFF",
  },

  accountOptionName: {
    color: "#2A1A12",
    fontSize: 11,
    fontWeight: "800",
  },

  accountOptionNameSelected: {
    color: "#FFFFFF",
  },

  accountOptionBalance: {
    color: "#8B6F61",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3,
  },

  accountOptionBalanceSelected: {
    color: "#FFFFFF",
  },

  selectedBadge: {
    alignSelf: "flex-start",
    backgroundColor:
      "rgba(255,255,255,0.20)",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },

  selectedBadgeText: {
    color: "#FFFFFF",
    fontSize: 6,
    fontWeight: "900",
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F7E5D8",
    marginBottom: 11,
  },

  formTitle: {
    color: "#2A1A12",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 12,
  },

  formTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  inputLabel: {
    color: "#725548",
    fontSize: 9,
    fontWeight: "800",
    marginBottom: 5,
  },

  optionalText: {
    color: "#B39888",
    fontWeight: "500",
  },

  input: {
    height: 43,
    borderRadius: 11,
    backgroundColor: "#FFF9F5",
    borderWidth: 1,
    borderColor: "#F2DED0",
    paddingHorizontal: 11,
    color: "#2A1A12",
    fontSize: 11,
    marginBottom: 11,
  },

  noteInput: {
    minHeight: 60,
    height: 60,
    paddingTop: 10,
    textAlignVertical: "top",
    marginBottom: 0,
  },

  instaPayBadge: {
    backgroundColor: "#FFF1E6",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  instaPayText: {
    color: "#D95800",
    fontSize: 8,
    fontWeight: "900",
  },

  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9F5",
    borderWidth: 1,
    borderColor: "#FFD8BD",
    borderRadius: 13,
    paddingHorizontal: 13,
    height: 62,
  },

  pesoSign: {
    color: "#FF6A00",
    fontSize: 25,
    fontWeight: "900",
    marginRight: 6,
  },

  amountInput: {
    flex: 1,
    color: "#2A1A12",
    fontSize: 25,
    fontWeight: "900",
  },

  availableBalance: {
    color: "#8B6F61",
    fontSize: 9,
    marginTop: 6,
    marginBottom: 13,
  },

  sentinelInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2A1A12",
    borderRadius: 15,
    padding: 12,
    marginTop: 2,
    marginBottom: 13,
  },

  sentinelIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  sentinelIconText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  sentinelInfoText: {
    flex: 1,
  },

  sentinelInfoTitle: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  sentinelInfoSub: {
    color: "#D7C9C1",
    fontSize: 8,
    lineHeight: 12,
    marginTop: 2,
  },

  activeBadge: {
    backgroundColor:
      "rgba(61,220,151,0.13)",
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  activeText: {
    color: "#3DDC97",
    fontSize: 7,
    fontWeight: "900",
  },

  continueButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FF6A00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  continueArrow: {
    color: "#FFFFFF",
    fontSize: 18,
    marginLeft: 8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(35,20,12,0.45)",
    justifyContent: "flex-end",
  },

  reviewModal: {
    maxHeight: "91%",
    backgroundColor: "#FFF7F1",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 15,
    paddingBottom: 25,
  },

  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#DCC5B7",
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 12,
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  reviewTitle: {
    color: "#2A1A12",
    fontSize: 18,
    fontWeight: "900",
  },

  reviewSubtitle: {
    color: "#8B6F61",
    fontSize: 9,
    marginTop: 2,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFF1E6",
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: "#A45A2A",
    fontSize: 21,
  },

  transferSummary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: "#F7E5D8",
    marginBottom: 10,
  },

  summaryAmountLabel: {
    color: "#A45A2A",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    textAlign: "center",
  },

  summaryAmount: {
    color: "#FF6A00",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 4,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#F4E3D7",
    marginVertical: 13,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  summaryLabel: {
    color: "#8B6F61",
    fontSize: 9,
  },

  summaryValue: {
    color: "#2A1A12",
    fontSize: 9,
    fontWeight: "800",
    maxWidth: "60%",
    textAlign: "right",
  },

  riskCard: {
    backgroundColor: "#2A1A12",
    borderRadius: 17,
    padding: 14,
    marginBottom: 11,
  },

  riskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  riskEyebrow: {
    color: "#FF9B55",
    fontSize: 7,
    fontWeight: "900",
    letterSpacing: 1,
  },

  riskTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },

  riskScoreCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  riskScore: {
    fontSize: 16,
    fontWeight: "900",
  },

  riskScoreMax: {
    color: "#AFA19A",
    fontSize: 6,
  },

  riskStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 11,
  },

  riskPill: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  riskPillText: {
    fontSize: 7,
    fontWeight: "900",
  },

  decisionText: {
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  signalList: {
    borderTopWidth: 1,
    borderTopColor:
      "rgba(255,255,255,0.10)",
    marginTop: 11,
    paddingTop: 7,
  },

  signalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },

  signalDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },

  signalContent: {
    flex: 1,
  },

  signalCategory: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
  },

  signalText: {
    color: "#C9BBB3",
    fontSize: 7,
    lineHeight: 10,
    marginTop: 1,
  },

  signalScore: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
    marginLeft: 6,
  },

  clearMessage: {
    backgroundColor:
      "rgba(22,166,106,0.14)",
    borderRadius: 10,
    padding: 9,
    marginTop: 8,
  },

  clearMessageText: {
    color: "#3DDC97",
    fontSize: 9,
    fontWeight: "800",
  },

  monitorMessage: {
    backgroundColor:
      "rgba(245,158,11,0.13)",
    borderRadius: 10,
    padding: 9,
    marginTop: 8,
  },

  monitorMessageText: {
    color: "#FBBF24",
    fontSize: 9,
    fontWeight: "800",
  },

  verifyMessage: {
    backgroundColor:
      "rgba(229,72,77,0.13)",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },

  verifyMessageTitle: {
    color: "#FF777B",
    fontSize: 9,
    fontWeight: "900",
  },

  verifyMessageText: {
    color: "#D8C9C1",
    fontSize: 8,
    lineHeight: 12,
    marginTop: 3,
  },

  holdMessage: {
    backgroundColor:
      "rgba(217,45,32,0.14)",
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },

  holdMessageTitle: {
    color: "#FF6B61",
    fontSize: 9,
    fontWeight: "900",
  },

  holdMessageText: {
    color: "#D8C9C1",
    fontSize: 8,
    lineHeight: 12,
    marginTop: 3,
  },

  confirmButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  verifyButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: "#E5484D",
    alignItems: "center",
    justifyContent: "center",
  },

  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },

  cancelButton: {
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  cancelButtonText: {
    color: "#8B6F61",
    fontSize: 10,
    fontWeight: "700",
  },

  successOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(35,20,12,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },

  successCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
  },

  successIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#E9F9F1",
    alignItems: "center",
    justifyContent: "center",
  },

  successIconText: {
    color: "#16A66A",
    fontSize: 28,
    fontWeight: "900",
  },

  successTitle: {
    color: "#2A1A12",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
  },

  successAmount: {
    color: "#FF6A00",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 8,
  },

  successRecipient: {
    color: "#8B6F61",
    fontSize: 10,
    marginTop: 2,
  },

  successDetails: {
    width: "100%",
    backgroundColor: "#FFF9F5",
    borderRadius: 13,
    padding: 12,
    marginTop: 16,
  },

  successRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  successLabel: {
    color: "#8B6F61",
    fontSize: 9,
  },

  successValue: {
    color: "#2A1A12",
    fontSize: 9,
    fontWeight: "800",
    maxWidth: "65%",
  },

  successStatus: {
    color: "#16A66A",
    fontSize: 9,
    fontWeight: "900",
  },

  successSentinel: {
    color: "#FF6A00",
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  successSentinelNote: {
    backgroundColor: "#FFF1E6",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginTop: 12,
  },

  successSentinelNoteText: {
    color: "#D95800",
    fontSize: 8,
    fontWeight: "800",
  },

  doneButton: {
    width: "100%",
    height: 47,
    borderRadius: 13,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },

  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
});