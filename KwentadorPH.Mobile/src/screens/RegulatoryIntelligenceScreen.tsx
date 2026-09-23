import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import {
  generateRegulatoryPolicy,
  getRegulatoryUpdates,
  simulateRegulatoryImpact,
} from "../services/api";

export default function RegulatoryIntelligenceScreen() {
  const navigation = useNavigation<any>();

  const [updates, setUpdates] = useState<any[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);
  const [policy, setPolicy] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [generatingPolicy, setGeneratingPolicy] = useState(false);

  useEffect(() => {
    loadUpdates();
  }, []);

  async function loadUpdates() {
    try {
      setLoading(true);

      const data = await getRegulatoryUpdates();
      const list = Array.isArray(data) ? data : [];

      setUpdates(list);

      if (list.length > 0) {
        setSelectedUpdate(list[0]);
      }
    } catch (error) {
      console.log("Regulatory Intelligence Error:", error);

      Alert.alert(
        "Unable to Load",
        "Regulatory updates could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulate() {
    if (!selectedUpdate?.id) return;

    try {
      setSimulating(true);
      setPolicy(null);

      const result = await simulateRegulatoryImpact(
        selectedUpdate.id
      );

      setSimulation(result);
    } catch (error: any) {
      Alert.alert(
        "Simulation Failed",
        error?.message || "Unable to simulate regulatory impact."
      );
    } finally {
      setSimulating(false);
    }
  }

  async function handleGeneratePolicy() {
    if (!selectedUpdate?.id) return;

    try {
      setGeneratingPolicy(true);

      const result = await generateRegulatoryPolicy(
        selectedUpdate.id
      );

      setPolicy(result);
    } catch (error: any) {
      Alert.alert(
        "Policy Generation Failed",
        error?.message || "Unable to generate policy."
      );
    } finally {
      setGeneratingPolicy(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A00" />
        <Text style={styles.loadingText}>
          Myrna is scanning regulatory intelligence...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Regulatory Intelligence
          </Text>

          <Text style={styles.subtitle}>
            MYRNA BANK • AI COMPLIANCE
          </Text>
        </View>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {!selectedUpdate ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              No regulatory updates detected
            </Text>

            <Text style={styles.emptyText}>
              Myrna is continuously monitoring regulatory changes.
            </Text>
          </View>
        ) : (
          <>
            {/* DETECTED ALERT */}
            <View style={styles.alertCard}>
              <View style={styles.alertTop}>
                <View>
                  <Text style={styles.detectedLabel}>
                    NEW REGULATORY UPDATE DETECTED
                  </Text>

                  <Text style={styles.regulator}>
                    {selectedUpdate.regulator}
                  </Text>
                </View>

                <View style={styles.highBadge}>
                  <Text style={styles.highBadgeText}>
                    {selectedUpdate.impactLevel}
                  </Text>
                </View>
              </View>

              <Text style={styles.reference}>
                {selectedUpdate.referenceNumber}
              </Text>

              <Text style={styles.updateTitle}>
                {selectedUpdate.title}
              </Text>

              <Text style={styles.summary}>
                {selectedUpdate.summary}
              </Text>

              <View style={styles.detectedFooter}>
                <Text style={styles.detectedFooterText}>
                  {selectedUpdate.regulatoryImpacts?.length ?? 0} systems affected
                </Text>

                <Text style={styles.detectedFooterText}>
                  Status: {selectedUpdate.status}
                </Text>
              </View>
            </View>

            {/* MYRNA ANALYSIS */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionEyebrow}>
                MYRNA AI ANALYSIS
              </Text>

              <Text style={styles.sectionTitle}>
                Affected Systems
              </Text>

              {selectedUpdate.regulatoryImpacts?.map(
                (impact: any) => (
                  <View
                    key={impact.id}
                    style={styles.impactItem}
                  >
                    <View style={styles.impactHeader}>
                      <Text style={styles.systemName}>
                        {impact.systemName}
                      </Text>

                      <View
                        style={[
                          styles.riskBadge,
                          impact.riskLevel === "High"
                            ? styles.riskHigh
                            : impact.riskLevel === "Medium"
                            ? styles.riskMedium
                            : styles.riskLow,
                        ]}
                      >
                        <Text style={styles.riskText}>
                          {impact.riskLevel}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.impactDescription}>
                      {impact.impactDescription}
                    </Text>

                    <Text style={styles.actionLabel}>
                      REQUIRED ACTION
                    </Text>

                    <Text style={styles.requiredAction}>
                      {impact.requiredAction}
                    </Text>
                  </View>
                )
              )}
            </View>

            {/* SIMULATE */}
            {!simulation && (
              <Pressable
                style={[
                  styles.primaryButton,
                  simulating && styles.disabledButton,
                ]}
                onPress={handleSimulate}
                disabled={simulating}
              >
                {simulating ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Simulate Compliance Impact
                  </Text>
                )}
              </Pressable>
            )}

            {/* SIMULATION RESULT */}
            {simulation && (
              <View style={styles.simulationCard}>
                <View style={styles.simulationHeader}>
                  <View>
                    <Text style={styles.sectionEyebrow}>
                      IMPACT SIMULATION
                    </Text>

                    <Text style={styles.sectionTitle}>
                      Institutional Readiness
                    </Text>
                  </View>

                  <View style={styles.scoreCircle}>
                    <Text style={styles.score}>
                      {simulation.simulation?.readinessScore}
                    </Text>
                    <Text style={styles.scoreMax}>/100</Text>
                  </View>
                </View>

                <View style={styles.statusBanner}>
                  <Text style={styles.statusLabel}>
                    {simulation.simulation?.readinessStatus}
                  </Text>

                  <Text style={styles.statusRisk}>
                    Compliance Risk:{" "}
                    {simulation.simulation?.projectedComplianceRisk}
                  </Text>
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <Text style={styles.metricNumber}>
                      {simulation.simulation?.totalAffectedSystems}
                    </Text>
                    <Text style={styles.metricLabel}>
                      Affected
                    </Text>
                  </View>

                  <View style={styles.metric}>
                    <Text style={styles.metricNumber}>
                      {simulation.simulation?.highRiskSystems}
                    </Text>
                    <Text style={styles.metricLabel}>
                      High Risk
                    </Text>
                  </View>

                  <View style={styles.metric}>
                    <Text style={styles.metricNumber}>
                      {simulation.simulation?.mediumRiskSystems}
                    </Text>
                    <Text style={styles.metricLabel}>
                      Medium
                    </Text>
                  </View>
                </View>

                <Text style={styles.recommendation}>
                  {simulation.recommendation}
                </Text>

                <Text style={styles.actionsTitle}>
                  Critical Actions
                </Text>

                {simulation.criticalActions?.map(
                  (item: any, index: number) => (
                    <View
                      key={`${item.system}-${index}`}
                      style={styles.criticalAction}
                    >
                      <View style={styles.actionNumber}>
                        <Text style={styles.actionNumberText}>
                          {index + 1}
                        </Text>
                      </View>

                      <View style={styles.actionContent}>
                        <Text style={styles.actionSystem}>
                          {item.system}
                        </Text>

                        <Text style={styles.actionText}>
                          {item.action}
                        </Text>
                      </View>
                    </View>
                  )
                )}

                <Pressable
                  style={[
                    styles.primaryButton,
                    styles.policyButton,
                    generatingPolicy && styles.disabledButton,
                  ]}
                  onPress={handleGeneratePolicy}
                  disabled={generatingPolicy}
                >
                  {generatingPolicy ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryButtonText}>
                      Generate Policy Update
                    </Text>
                  )}
                </Pressable>
              </View>
            )}

            {/* POLICY */}
            {policy && (
              <View style={styles.policyCard}>
                <View style={styles.policyHeader}>
                  <View>
                    <Text style={styles.sectionEyebrow}>
                      AI-GENERATED RESPONSE
                    </Text>

                    <Text style={styles.policyTitle}>
                      {policy.policy?.policyTitle}
                    </Text>
                  </View>

                  <View style={styles.draftBadge}>
                    <Text style={styles.draftText}>
                      {policy.policy?.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.humanReview}>
                  <Text style={styles.humanReviewTitle}>
                    Human Approval Required
                  </Text>

                  <Text style={styles.humanReviewText}>
                    Myrna generated this draft from mapped regulatory impacts.
                    Final implementation requires compliance review.
                  </Text>
                </View>

                {policy.policy?.actions?.map(
                  (action: any) => (
                    <View
                      key={`${action.priority}-${action.system}`}
                      style={styles.policyAction}
                    >
                      <Text style={styles.policyPriority}>
                        PRIORITY {action.priority}
                      </Text>

                      <Text style={styles.policySystem}>
                        {action.system}
                      </Text>

                      <Text style={styles.policyRequirement}>
                        {action.policyRequirement}
                      </Text>

                      <Text style={styles.pendingText}>
                        ● {action.implementationStatus}
                      </Text>
                    </View>
                  )
                )}

                <View style={styles.policyDocument}>
                  <Text style={styles.policyDocumentTitle}>
                    Generated Policy Draft
                  </Text>

                  <Text style={styles.policyDocumentText}>
                    {policy.policy?.policyText}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0E3",
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFF0E3",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    color: "#667085",
    fontSize: 13,
    marginTop: 12,
  },

  header: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    color: "#1F2937",
    fontSize: 28,
    lineHeight: 30,
  },

  headerText: {
    flex: 1,
    marginLeft: 10,
  },

  title: {
    color: "#1F2937",
    fontSize: 19,
    fontWeight: "900",
  },

  subtitle: {
    color: "#FF6A00",
    fontSize: 8,
    fontWeight: "800",
    marginTop: 2,
    letterSpacing: 0.8,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16A66A",
    marginRight: 5,
  },

  liveText: {
    color: "#16A66A",
    fontSize: 8,
    fontWeight: "900",
  },

  content: {
    padding: 12,
    paddingBottom: 40,
  },

  alertCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },

  alertTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  detectedLabel: {
    color: "#FDBA74",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.7,
  },

  regulator: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 3,
  },

  highBadge: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },

  highBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },

  reference: {
    color: "#FDBA74",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 12,
  },

  updateTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 5,
    lineHeight: 23,
  },

  summary: {
    color: "#D1D5DB",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  detectedFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#374151",
    marginTop: 14,
    paddingTop: 10,
  },

  detectedFooterText: {
    color: "#D1D5DB",
    fontSize: 9,
    fontWeight: "600",
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  sectionEyebrow: {
    color: "#FF6A00",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  sectionTitle: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 3,
  },

  impactItem: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
    marginTop: 12,
  },

  impactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  systemName: {
    flex: 1,
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "900",
    paddingRight: 8,
  },

  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  riskHigh: {
    backgroundColor: "#FEE2E2",
  },

  riskMedium: {
    backgroundColor: "#FEF3C7",
  },

  riskLow: {
    backgroundColor: "#DCFCE7",
  },

  riskText: {
    color: "#1F2937",
    fontSize: 8,
    fontWeight: "800",
  },

  impactDescription: {
    color: "#667085",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 6,
  },

  actionLabel: {
    color: "#FF6A00",
    fontSize: 7,
    fontWeight: "900",
    marginTop: 8,
  },

  requiredAction: {
    color: "#344054",
    fontSize: 10,
    fontWeight: "700",
    lineHeight: 15,
    marginTop: 2,
  },

  primaryButton: {
    minHeight: 48,
    backgroundColor: "#FF6A00",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  disabledButton: {
    opacity: 0.6,
  },

  simulationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  simulationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  scoreCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 5,
    borderColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },

  score: {
    color: "#1F2937",
    fontSize: 17,
    fontWeight: "900",
  },

  scoreMax: {
    color: "#98A2B3",
    fontSize: 8,
  },

  statusBanner: {
    backgroundColor: "#FFF1E6",
    borderRadius: 12,
    padding: 11,
    marginTop: 12,
  },

  statusLabel: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "900",
  },

  statusRisk: {
    color: "#667085",
    fontSize: 9,
    marginTop: 3,
  },

  metricsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },

  metric: {
    flex: 1,
    backgroundColor: "#FFF7F1",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },

  metricNumber: {
    color: "#1F2937",
    fontSize: 18,
    fontWeight: "900",
  },

  metricLabel: {
    color: "#667085",
    fontSize: 8,
    marginTop: 2,
  },

  recommendation: {
    color: "#344054",
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
  },

  actionsTitle: {
    color: "#1F2937",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 5,
  },

  criticalAction: {
    flexDirection: "row",
    backgroundColor: "#FFF7F1",
    borderRadius: 10,
    padding: 10,
    marginTop: 6,
  },

  actionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  actionNumberText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },

  actionContent: {
    flex: 1,
  },

  actionSystem: {
    color: "#1F2937",
    fontSize: 10,
    fontWeight: "900",
  },

  actionText: {
    color: "#667085",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  policyButton: {
    marginTop: 14,
    marginBottom: 0,
  },

  policyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FFD8BD",
  },

  policyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  policyTitle: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 3,
    maxWidth: 250,
  },

  draftBadge: {
    backgroundColor: "#FFF1E6",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },

  draftText: {
    color: "#FF6A00",
    fontSize: 8,
    fontWeight: "900",
  },

  humanReview: {
    backgroundColor: "#FFF7F1",
    borderRadius: 12,
    padding: 11,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#FF6A00",
  },

  humanReviewTitle: {
    color: "#1F2937",
    fontSize: 10,
    fontWeight: "900",
  },

  humanReviewText: {
    color: "#667085",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  policyAction: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 11,
  },

  policyPriority: {
    color: "#FF6A00",
    fontSize: 7,
    fontWeight: "900",
  },

  policySystem: {
    color: "#1F2937",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 2,
  },

  policyRequirement: {
    color: "#667085",
    fontSize: 9,
    lineHeight: 14,
    marginTop: 3,
  },

  pendingText: {
    color: "#F59E0B",
    fontSize: 8,
    fontWeight: "800",
    marginTop: 5,
  },

  policyDocument: {
    backgroundColor: "#1F2937",
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },

  policyDocumentTitle: {
    color: "#FDBA74",
    fontSize: 10,
    fontWeight: "900",
    marginBottom: 8,
  },

  policyDocumentText: {
    color: "#F3F4F6",
    fontSize: 9,
    lineHeight: 15,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },

  emptyText: {
    color: "#667085",
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
  },
});