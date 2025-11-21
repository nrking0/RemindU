import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export interface EventItem {
  name: string;
  contactName: string;
  type: "Holiday" | "Birthday";
  dateString?: string;
}

interface EventDetailsModalProps {
  visible: boolean;
  event: EventItem | null;
  onClose: () => void;
}

export default function EventDetailsModal({
  visible,
  event,
  onClose,
}: EventDetailsModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [aiSummary, setAiSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  // Prevent fetching twice if the user closes/opens quickly
  const fetchRef = useRef<boolean>(false);

  useEffect(() => {
    if (visible && event) {
      setAiSummary("");
      setError("");
      setLoading(true); // Show loader immediately
      
      // 1. OPTIMIZATION: Wait for the Modal animation to finish before fetching
      const task = InteractionManager.runAfterInteractions(() => {
        fetchGeminiExplanation(event);
      });

      return () => task.cancel();
    }
  }, [visible, event]);

  const fetchGeminiExplanation = async (currentEvent: EventItem) => {
    // (Logic remains the same, but now it runs AFTER the animation)
    const date = currentEvent.dateString || "the specific date";
    const name = currentEvent.name;
    const userQuery = `Summarize the general wikipedia link for the holiday ${name} on the date ${date}. It should have its overview and meaning. And then focus on how locals celebrate it and how people out of the culture can celebrate it`;
    
    const apiKey = "AIzaSyDS43f5vhWtlN6cs6_0aa2VRaVrefTqBLQ"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: userQuery }] }] }),
      });

      if (!res.ok) throw new Error("API Error");

      const result = await res.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setAiSummary(text);
    } catch (e) {
      setError("Failed to load summary.");
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.text + "20",
                  maxHeight: "85%",
                },
              ]}
            >
              <Text style={[styles.title, { color: colors.text }]}>
                {event.name}
              </Text>
              <View style={[styles.separator, { backgroundColor: colors.text + "20" }]} />

              <ScrollView style={{ width: "100%" }}>
                {/* Static details */}
                <View style={styles.contentRow}>
                  <Text style={[styles.label, { color: colors.text + "80" }]}>Contact:</Text>
                  <Text style={[styles.value, { color: colors.tint }]}>{event.contactName}</Text>
                </View>

                {/* AI Section */}
                <Text style={[styles.sectionHeader, { color: colors.text }]}>AI Summary</Text>
                <View style={styles.aiContainer}>
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={colors.tint} />
                      <Text style={[styles.loadingText, { color: colors.text }]}>
                        Consulting Gemini...
                      </Text>
                    </View>
                  ) : error ? (
                    <Text style={{ color: "red" }}>{error}</Text>
                  ) : (
                    <Text style={[styles.aiText, { color: colors.text }]}>{aiSummary}</Text>
                  )}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.tint }]}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // ... (Same styles as before)
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  separator: {
    width: "100%",
    height: 1,
    marginBottom: 15,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    paddingLeft: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 5,
  },
  aiContainer: {
    width: "100%",
    minHeight: 50,
    padding: 10,
    backgroundColor: "rgba(150, 150, 150, 0.1)",
    borderRadius: 8,
  },
  aiText: {
    fontSize: 14,
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});