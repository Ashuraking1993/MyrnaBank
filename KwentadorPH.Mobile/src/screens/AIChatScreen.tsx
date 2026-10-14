import { useState } from "react";
import { sendAIChat } from "../services/api";
import {
  ActivityIndicator,
  Image,
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
import * as Speech from "expo-speech";

export default function AIChatScreen() {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  type ChatMessage = {
    id: string;
    role: "user" | "ai";
    text: string;
    goal?: any;
  };



 const [messages, setMessages] = useState<ChatMessage[]>([]);

const handleSend = async () => {
  if (!message.trim() || isSending) return;

  const currentMessage = message.trim();

  const userMessage: ChatMessage = {
    id: `${Date.now()}-user`,
    role: "user",
    text: currentMessage,
  };

  // Show user's message immediately
  setMessages((prev) => [...prev, userMessage]);

  // Clear textbox immediately
  setMessage("");
  setIsSending(true);

  try {
    const result = await sendAIChat(currentMessage);

    const aiMessage: ChatMessage = {
      id: `${Date.now()}-ai`,
      role: "ai",
      text: result.aiResponse,
      goal:
        result.goals?.length > 0
          ? result.goals[0]
          : undefined,
    };

   setMessages((prev) => [...prev, aiMessage]);

   // 🔊 Myrna reads her AI response
   await Speech.stop();

   Speech.speak(aiMessage.text, {
     language: "en-US",
     rate: 0.95,
     pitch: 1.05,
   });

  } catch (error) {
    console.error("AI Chat Error:", error);

    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-error`,
        role: "ai",
        text: "Sorry, I couldn't reach Myrna Ai right now.",
      },
    ]);
  } finally {
    setIsSending(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
        <View style={styles.header}>
         <View style={styles.avatar}>
           <Image
             source={require("../../assets/images/kwentador-mascot.png")}
             style={styles.mascotImage}
             resizeMode="contain"
           />
         </View>

          <View>
            <Text style={styles.title}>Myrna</Text>
            <Text style={styles.status}>● Ready to help</Text>
          </View>
        </View>

       <ScrollView
         style={styles.chat}
         contentContainerStyle={styles.chatContent}
         keyboardShouldPersistTaps="handled"
         keyboardDismissMode="on-drag"
       >
          <View style={styles.aiBubble}>
            <Text style={styles.aiLabel}>Myrna</Text>

            <Text style={styles.aiText}>
              Hi! Ask me about your savings, expenses,
              financial goals, or how to reach a goal.
            </Text>
          </View>

          <View style={styles.suggestions}>
            <Text style={styles.suggestionTitle}>
              Try asking
            </Text>

            <Pressable
              style={styles.suggestion}
              onPress={() =>
                setMessage(
                  "Can I achieve my Japan Travel Fund goal?"
                )
              }
            >
              <Text style={styles.suggestionText}>
                ✈️ Can I achieve my Japan travel goal?
              </Text>
            </Pressable>

            <Pressable
              style={styles.suggestion}
              onPress={() =>
                setMessage(
                  "How much should I save every month?"
                )
              }
            >
              <Text style={styles.suggestionText}>
                💰 How much should I save monthly?
              </Text>
            </Pressable>

            <Pressable
              style={styles.suggestion}
              onPress={() =>
                setMessage(
                  "Where should I keep my savings?"
                )
              }
            >
              <Text style={styles.suggestionText}>
                🏦 Where should I keep my savings?
              </Text>
            </Pressable>
         </View>

                 {/* USER + AI RESPONSE */}
                {messages.map((item) =>
                  item.role === "user" ? (
                    <View key={item.id} style={styles.userBubble}>
                      <Text style={styles.userText}>
                        {item.text}
                      </Text>
                    </View>
                  ) : (
                    <View
                      key={item.id}
                      style={[styles.aiBubble, styles.responseBubble]}
                    >
                      <Text style={styles.aiLabel}>
                        MYRNA
                      </Text>

                      <Text style={styles.aiText}>
                        {item.text}
                      </Text>
                    </View>
                  )
                )}

                {isSending && (
                  <View style={[styles.aiBubble, styles.responseBubble]}>
                    <Text style={styles.aiLabel}>
                      MYRNA
                    </Text>

                    <View style={styles.thinkingRow}>
                      <ActivityIndicator
                        size="small"
                        color="#1746A2"
                      />

                      <Text style={styles.thinkingText}>
                        Analyzing your finances...
                      </Text>
                    </View>
                  </View>
                )}

               </ScrollView>

        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Ask Myrna..."
            placeholderTextColor="#8A94A6"
            value={message}
            onChangeText={setMessage}
            multiline
          />

         <Pressable
           style={[
             styles.sendButton,
             (!message.trim() || isSending) &&
               styles.sendDisabled,
           ]}
           disabled={!message.trim() || isSending}
           onPress={handleSend}
         >
           {isSending ? (
             <ActivityIndicator color="#FFFFFF" />
           ) : (
             <Text style={styles.sendText}>➤</Text>
           )}
         </Pressable>

        </View>
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
    backgroundColor: "#F5F8FF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E6EBF3",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1746A2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  title: {
    fontSize: 17,
    fontWeight: "800",
    color: "#102A56",
  },

  status: {
    marginTop: 2,
    fontSize: 11,
    color: "#159447",
    fontWeight: "600",
  },

  chat: {
    flex: 1,
  },

  chatContent: {
    padding: 18,
    paddingBottom: 30,
  },

  aiBubble: {
    alignSelf: "flex-start",
    maxWidth: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderTopLeftRadius: 5,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E3E9F3",
  },

  aiLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1746A2",
    marginBottom: 6,
  },

  aiText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#34435E",
  },

  suggestions: {
    marginTop: 24,
  },

  suggestionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#78859A",
    marginBottom: 10,
  },

  suggestion: {
    backgroundColor: "#EDF3FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  suggestionText: {
    fontSize: 13,
    color: "#1746A2",
    fontWeight: "600",
  },

 inputArea: {
   flexDirection: "row",
   alignItems: "flex-end",
   paddingHorizontal: 14,
   paddingTop: 10,
   paddingBottom: Platform.OS === "android" ? 12 : 10,
   backgroundColor: "#FFFFFF",
   borderTopWidth: 1,
   borderTopColor: "#E3E9F3",
 },

  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 100,
    backgroundColor: "#F3F6FA",
    borderRadius: 23,
    paddingHorizontal: 17,
    paddingVertical: 12,
    fontSize: 14,
    color: "#17233C",
  },

  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#1746A2",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  sendDisabled: {
    opacity: 0.45,
  },

  sendText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
userBubble: {
  alignSelf: "flex-end",
  maxWidth: "85%",
  backgroundColor: "#1746A2",
  borderRadius: 18,
  borderTopRightRadius: 5,
  padding: 14,
  marginTop: 20,
},

userText: {
  color: "#FFFFFF",
  fontSize: 14,
  lineHeight: 20,
},

responseBubble: {
  marginTop: 10,
  marginBottom: 6,
},

thinkingRow: {
  flexDirection: "row",
  alignItems: "center",
},

thinkingText: {
  marginLeft: 8,
  fontSize: 13,
  color: "#78859A",
},

mascotImage: {
  width: 50,
  height: 50,
},

});