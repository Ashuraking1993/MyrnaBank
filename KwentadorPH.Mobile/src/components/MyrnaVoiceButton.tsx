import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";

type Props = {
  navigation: any;
};

export default function MyrnaVoiceButton({ navigation }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const pulse = useRef(new Animated.Value(1)).current;
  const position = useRef(new Animated.ValueXY()).current;
  const idleOpacity = useRef(new Animated.Value(1)).current;
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = () => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
    }

    Animated.timing(idleOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();

    idleTimer.current = setTimeout(() => {
      Animated.timing(idleOpacity, {
        toValue: 0.35,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 3000);
  };

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [pulse]);

useEffect(() => {
  resetIdleTimer();

  return () => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
    }
  };
}, []);

  const speak = (message: string) => {
    Speech.stop();

    Speech.speak(message, {
      language: "en-US",
      rate: 0.95,
      pitch: 1,
    });
  };

  const handlePress = () => {
    if (!isOpen) {
      speak("Hi, I'm Myrna. How may I help you?");
    }

    setIsOpen((prev) => !prev);
  };

  const openScreen = (
    screen: string,
    message: string
  ) => {
    setIsOpen(false);
    speak(message);
    navigation.navigate(screen);
  };

const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > 4 ||
      Math.abs(gestureState.dy) > 4,

    onPanResponderGrant: () => {
      resetIdleTimer();

      position.setOffset({
        x: (position.x as any)._value,
        y: (position.y as any)._value,
      });

      position.setValue({
        x: 0,
        y: 0,
      });
    },

    onPanResponderMove: Animated.event(
      [
        null,
        {
          dx: position.x,
          dy: position.y,
        },
      ],
      {
        useNativeDriver: false,
      }
    ),

    onPanResponderRelease: (_, gestureState) => {
      position.flattenOffset();
      resetIdleTimer();

      // Normal tap, not drag
      if (
        Math.abs(gestureState.dx) < 5 &&
        Math.abs(gestureState.dy) < 5
      ) {
        handlePress();
      }
    },

    onPanResponderTerminate: () => {
      position.flattenOffset();
      resetIdleTimer();
    },
  })
).current;

  return (
   <Animated.View
     {...panResponder.panHandlers}
     style={[
       styles.wrapper,
       {
         opacity: idleOpacity,
         transform: [
           { translateX: position.x },
           { translateY: position.y },
         ],
       },
     ]}
   >
      {isOpen && (
        <View style={styles.commandCard}>
          <View style={styles.commandHeader}>
            <View style={styles.statusDot} />

            <View style={styles.headerText}>
              <Text style={styles.commandTitle}>
                Myrna Assistant
              </Text>

              <Text style={styles.commandSubtitle}>
                What would you like to do?
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.commandItem}
            onPress={() =>
              openScreen(
                "DebtPlanner",
                "Opening your Smart Debt Planner."
              )
            }
          >
            <View style={styles.commandIcon}>
              <Ionicons
                name="analytics-outline"
                size={18}
                color="#FF6A00"
              />
            </View>

            <Text style={styles.commandText}>
              Smart Debt Planner
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#98A2B3"
            />
          </Pressable>

          <Pressable
            style={styles.commandItem}
            onPress={() =>
              openScreen(
                "Accounts",
                "Opening your accounts."
              )
            }
          >
            <View style={styles.commandIcon}>
              <Ionicons
                name="wallet-outline"
                size={18}
                color="#FF6A00"
              />
            </View>

            <Text style={styles.commandText}>
              My Accounts
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#98A2B3"
            />
          </Pressable>

          <Pressable
            style={styles.commandItem}
            onPress={() =>
              openScreen(
                "Transfer",
                "Opening money transfer."
              )
            }
          >
            <View style={styles.commandIcon}>
              <Ionicons
                name="swap-horizontal-outline"
                size={18}
                color="#FF6A00"
              />
            </View>

            <Text style={styles.commandText}>
              Transfer Money
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#98A2B3"
            />
          </Pressable>

          <Pressable
            style={styles.commandItem}
            onPress={() =>
              openScreen(
                "FinancialCheckup",
                "Opening your financial checkup."
              )
            }
          >
            <View style={styles.commandIcon}>
              <Ionicons
                name="pulse-outline"
                size={18}
                color="#FF6A00"
              />
            </View>

            <Text style={styles.commandText}>
              Financial Checkup
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#98A2B3"
            />
          </Pressable>

          <Pressable
            style={[
              styles.commandItem,
              styles.lastCommandItem,
            ]}
            onPress={() =>
              openScreen(
                "AIChat",
                "Opening Myrna AI."
              )
            }
          >
            <View style={styles.commandIcon}>
              <Ionicons
                name="sparkles-outline"
                size={18}
                color="#FF6A00"
              />
            </View>

            <Text style={styles.commandText}>
              Ask Myrna AI
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#98A2B3"
            />
          </Pressable>

          <View style={styles.voiceNotice}>
            <Ionicons
              name="mic-outline"
              size={13}
              color="#FF6A00"
            />


          </View>
        </View>
      )}

      {!isOpen && (
        <View style={styles.myrnaLabel}>
          <View>
            <Text style={styles.labelTitle}>
              MYRNA
            </Text>

            <Text style={styles.labelSubtitle}>
              AI ACCESS
            </Text>
          </View>
        </View>
      )}

      <Animated.View
        style={{
          transform: [{ scale: pulse }],
        }}
      >
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.voiceButton,
            isOpen && styles.voiceButtonOpen,
            pressed && {
              transform: [{ scale: 0.94 }],
            },
          ]}
        >
          <View style={styles.innerCircle}>
            <Ionicons
              name={isOpen ? "close" : "mic"}
              size={27}
              color="#FFFFFF"
            />
          </View>
        </Pressable>
      </Animated.View>
   </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    right: 16,
    bottom: 78,
    alignItems: "flex-end",
    zIndex: 9999,
    elevation: 30,
  },

  voiceButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",

    borderWidth: 2,
    borderColor: "#FFE1CC",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.22,
    shadowRadius: 9,

    elevation: 12,
  },

  voiceButtonOpen: {
    borderColor: "#FFB47A",
  },

  innerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FF6A00",
    alignItems: "center",
    justifyContent: "center",
  },

  myrnaLabel: {
    position: "absolute",
    right: 48,
    bottom: 11,

    minWidth: 104,
    height: 44,

    backgroundColor: "#FFFFFF",

    paddingLeft: 12,
    paddingRight: 25,

    borderRadius: 15,

    justifyContent: "center",

    borderWidth: 1,
    borderColor: "#FFE1CC",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,

    elevation: 5,
  },

  labelTitle: {
    color: "#E85D04",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  labelSubtitle: {
    color: "#98A2B3",
    fontSize: 7,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginTop: 1,
  },

  commandCard: {
    width: 270,
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    paddingHorizontal: 14,
    paddingTop: 15,
    paddingBottom: 10,

    marginBottom: 12,

    borderWidth: 1,
    borderColor: "#FFE1CC",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 12,

    elevation: 14,
  },

  commandHeader: {
    flexDirection: "row",
    alignItems: "center",

    paddingBottom: 11,

    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#22C55E",
    marginRight: 9,
  },

  headerText: {
    flex: 1,
  },

  commandTitle: {
    color: "#1F2937",
    fontSize: 14,
    fontWeight: "900",
  },

  commandSubtitle: {
    color: "#98A2B3",
    fontSize: 10,
    marginTop: 1,
  },

  commandItem: {
    minHeight: 45,

    flexDirection: "row",
    alignItems: "center",

    borderBottomWidth: 1,
    borderBottomColor: "#F2F4F7",
  },

  lastCommandItem: {
    borderBottomWidth: 0,
  },

  commandIcon: {
    width: 31,
    height: 31,

    borderRadius: 10,

    backgroundColor: "#FFF1E6",

    alignItems: "center",
    justifyContent: "center",

    marginRight: 9,
  },

  commandText: {
    flex: 1,

    color: "#344054",

    fontSize: 11,
    fontWeight: "700",
  },

  voiceNotice: {
    flexDirection: "row",
    alignItems: "center",

    alignSelf: "center",

    backgroundColor: "#FFF7F1",

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 12,

    marginTop: 6,
  },

  voiceNoticeText: {
    color: "#E85D04",
    fontSize: 8,
    fontWeight: "700",
    marginLeft: 4,
  },
});