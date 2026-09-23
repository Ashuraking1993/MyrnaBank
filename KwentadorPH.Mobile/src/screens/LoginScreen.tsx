import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";


type Props = {
  onLogin: () => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function LoginScreen({ onLogin }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  const [activePage, setActivePage] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const goToLogin = () => {
    scrollRef.current?.scrollTo({
      x: SCREEN_WIDTH,
      animated: true,
    });
  };

  const handleScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const page = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH
    );

    setActivePage(page);
  };

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onMomentumScrollEnd={handleScrollEnd}
      >
        {/* ============================= */}
        {/* PAGE 1 — BANKING WELCOME */}
        {/* ============================= */}

        <View style={styles.page}>
          <ImageBackground
            source={require("../../assets/images/login-background.png")}
            style={styles.welcomeBackground}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                "rgba(255,255,255,0.03)",
                "rgba(0,38,105,0.08)",
                "rgba(0,25,75,0.78)",
              ]}
              style={StyleSheet.absoluteFillObject}
            />

            <SafeAreaView style={styles.welcomeSafe}>
              <View style={styles.welcomeContent}>
                <View style={styles.brandArea}>
                  <Image
                    source={require("../../assets/images/kwentador-logo.png")}
                    style={styles.welcomeLogo}
                    resizeMode="contain"
                  />

                  <Text style={styles.welcomeTagline}>
                    Smarter Banking.
                  </Text>

                  <Text style={styles.welcomeTaglineStrong}>
                    Better Financial Decisions.
                  </Text>

                  <Text style={styles.welcomeDescription}>
                    Banking and AI-powered financial guidance,
                    together in one place.
                  </Text>
                </View>

                <View style={styles.welcomeBottom}>
                  <View style={styles.benefitCard}>
                    <View style={styles.benefitItem}>
                      <Text style={styles.benefitIcon}>🛡</Text>
                      <Text style={styles.benefitTitle}>
                        Secure
                      </Text>
                      <Text style={styles.benefitText}>
                        Banking
                      </Text>
                    </View>

                    <View style={styles.benefitDivider} />

                    <View style={styles.benefitItem}>
                      <Text style={styles.benefitIcon}>⌁</Text>
                      <Text style={styles.benefitTitle}>
                        Smart
                      </Text>
                      <Text style={styles.benefitText}>
                        Insights
                      </Text>
                    </View>

                    <View style={styles.benefitDivider} />

                    <View style={styles.benefitItem}>
                      <Text style={styles.benefitIcon}>✦</Text>
                      <Text style={styles.benefitTitle}>
                        AI
                      </Text>
                      <Text style={styles.benefitText}>
                        Financial Coach
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.swipeText}>
                    Swipe to continue
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </ImageBackground>
        </View>

        {/* ============================= */}
        {/* PAGE 2 — BANK LOGIN */}
        {/* ============================= */}

        <View style={styles.page}>
          <ImageBackground
             source={require("../../assets/images/background2.png")}
             style={styles.loginBackground}
             resizeMode="cover"
           >
             <KeyboardAvoidingView
               style={styles.loginPage}
               behavior={
                 Platform.OS === "ios" ? "padding" : undefined
               }
             >


            {/* WHITE LOGIN PANEL */}

            <View style={styles.loginPanel}>
              <Image
                source={require("../../assets/images/kwentador-logo.png")}
                style={styles.loginLogo}
                resizeMode="contain"
              />

              <Text style={styles.loginTitle}>
                Sign in to your account
              </Text>

              <Text style={styles.loginSubtitle}>
                Secure access to your banking and financial tools.
              </Text>

              <View style={styles.loginInput}>
                <Text style={styles.inputIcon}>♙</Text>

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Username or Email"
                  placeholderTextColor="#8A94A6"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <View style={styles.loginInput}>
                <Text style={styles.inputIcon}>▣</Text>

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#8A94A6"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />

                <Pressable
                  onPress={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  <Text style={styles.eye}>
                    {showPassword ? "◉" : "◎"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.options}>
                <Pressable
                  style={styles.remember}
                  onPress={() =>
                    setRememberMe(!rememberMe)
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe &&
                        styles.checkboxActive,
                    ]}
                  >
                    {rememberMe && (
                      <Text style={styles.check}>✓</Text>
                    )}
                  </View>

                  <Text style={styles.optionText}>
                    Remember me
                  </Text>
                </Pressable>

                <Pressable>
                  <Text style={styles.forgot}>
                    Forgot Password?
                  </Text>
                </Pressable>
              </View>

              {/* KEEP EXISTING LOGIN BEHAVIOR */}

              <Pressable onPress={onLogin}>
                <LinearGradient
                  colors={["#075FEA", "#0646B8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signIn}
                >
                  <Text style={styles.signInText}>
                    Sign In
                  </Text>

                  <Text style={styles.signInArrow}>
                    →
                  </Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.line} />

                <Text style={styles.or}>
                  quick access
                </Text>

                <View style={styles.line} />
              </View>

              {/* BANKING QUICK ACCESS */}

              <View style={styles.quickAccess}>
                <Pressable style={styles.accessButton}>
                  <Text style={styles.accessIcon}>◎</Text>
                  <Text style={styles.accessText}>
                    Biometric
                  </Text>
                </Pressable>

                <Pressable style={styles.accessButton}>
                  <Text style={styles.accessIcon}>▦</Text>
                  <Text style={styles.accessText}>
                   PIN Login
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.accessButton}
                  onPress={onLogin}
                >
                  <Text style={styles.accessIcon}>▣</Text>
                  <Text style={styles.accessText}>
                    Demo Mode
                  </Text>
                </Pressable>
              </View>


            </View>
         </KeyboardAvoidingView>
         </ImageBackground>
         </View>
       </ScrollView>

      {/* PAGE INDICATOR */}

      <View style={styles.pageIndicator}>
        <View
          style={[
            styles.dot,
            activePage === 0 && styles.dotActive,
          ]}
        />

        <View
          style={[
            styles.dot,
            activePage === 1 && styles.dotActive,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4F8FF",
  },

  page: {
    width: SCREEN_WIDTH,
    flex: 1,
  },

  /* WELCOME */

  welcomeBackground: {
    flex: 1,
  },

  welcomeSafe: {
    flex: 1,
  },

  welcomeContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 20,
  },

  brandArea: {
    alignItems: "center",
    marginTop: 35,
  },

  welcomeLogo: {
    width: 260,
    height: 170,
  },

  welcomeTagline: {
    color: "#374151",
    fontSize: 20,
    fontWeight: "500",
    marginTop: 10,
  },

  welcomeTaglineStrong: {
    color: "#374151",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 2,
  },

  welcomeDescription: {
    color: "#374151",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    maxWidth: 290,
    marginTop: 10,
  },

  welcomeBottom: {
    alignItems: "center",
  },

  benefitCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.70)",
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  benefitItem: {
    flex: 1,
    alignItems: "center",
  },

  benefitDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#DCE6F5",
  },

  benefitIcon: {
    color: "#075FEA",
    fontSize: 19,
    fontWeight: "900",
  },

  benefitTitle: {
    color: "#063B8F",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 4,
  },

  benefitText: {
    color: "#64748B",
    fontSize: 8,
    marginTop: 1,
  },

  continueButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  continueText: {
    color: "#0646B8",
    fontSize: 14,
    fontWeight: "900",
  },

  continueArrow: {
    color: "#0646B8",
    fontSize: 20,
    marginLeft: 10,
  },

  swipeText: {
    color: "#D8E8FF",
    fontSize: 8,
    marginTop: 8,
  },

  /* LOGIN */

 loginPage: {
   flex: 1,
   backgroundColor: "transparent",
 },

  loginHero: {
    height: "28%",
    justifyContent: "flex-end",
  },

  heroSafe: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  heroEyebrow: {
    color: "#D8E8FF",
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "500",
    marginTop: 5,
  },

  heroTitleStrong: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
  },

  heroLine: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
  },

loginPanel: {
  flex: 1,
  backgroundColor: "transparent",
  paddingHorizontal: 22,
  paddingTop: 220,
},

  loginLogo: {
    width: 200,
    height: 150,
    alignSelf: "center",
  },

  loginTitle: {
    color: "#111827",
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },

  loginSubtitle: {
    color: "#7C8799",
    fontSize: 9,
    textAlign: "center",
    marginTop: 3,
    marginBottom: 13,
  },

  loginInput: {
    height: 47,
    borderRadius: 10,
    backgroundColor: "#F3F6FA",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 9,
  },

  inputIcon: {
    color: "#334155",
    fontSize: 17,
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: "#111827",
    fontSize: 12,
  },

  eye: {
    color: "#7C8799",
    fontSize: 18,
  },

  options: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },

  remember: {
    flexDirection: "row",
    alignItems: "center",
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  checkboxActive: {
    backgroundColor: "#075FEA",
    borderColor: "#075FEA",
  },

  check: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },

  optionText: {
    color: "#334155",
    fontSize: 10,
  },

  forgot: {
    color: "#075FEA",
    fontSize: 10,
    fontWeight: "700",
  },

  signIn: {
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  signInText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  signInArrow: {
    color: "#FFFFFF",
    fontSize: 19,
    marginLeft: 10,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  or: {
    color: "#94A3B8",
    fontSize: 9,
    marginHorizontal: 10,
  },

  quickAccess: {
    flexDirection: "row",
    gap: 8,
  },

  accessButton: {
    flex: 1,
    height: 67,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  accessIcon: {
    color: "#063B8F",
    fontSize: 20,
    fontWeight: "900",
  },

  accessText: {
    color: "#334155",
    fontSize: 8,
    fontWeight: "700",
    marginTop: 5,
  },


  /* INDICATOR */

  pageIndicator: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    flexDirection: "row",
    gap: 5,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#AAB8CC",
  },

  dotActive: {
    width: 18,
    backgroundColor: "#075FEA",
  },

loginBackground: {
  flex: 1,
  width: "100%",
  height: "100%",
},
});