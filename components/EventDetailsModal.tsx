import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import holidaysData from "@/constants/holidays.json";
import { Contact } from "@/hooks/useContacts";
// 1. Import the library
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  InteractionManager,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Markdown from "react-native-markdown-display";

export interface EventItem {
  name: string;
  contactName: string;
  type: "Holiday" | "Birthday";
  dateString?: string;
}

interface EventDetailsModalProps {
  visible: boolean;
  event: EventItem | null;
  contacts: Contact[];
  onClose: () => void;
}

interface HolidayInfo {
  calendar: string;
  date: string;
  non_fixed?: string;
  holiday: string;
  location: string;
  who: string;
  summary: string;
  greeting: string;
}

export default function EventDetailsModal({
  visible,
  event,
  contacts,
  onClose,
}: EventDetailsModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [aiSummary, setAiSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [holidayInfo, setHolidayInfo] = useState<HolidayInfo | null>(null);
  const [celebratingContacts, setCelebratingContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (visible && event) {
      setAiSummary("");
      setError("");
      setHolidayInfo(null);
      setCelebratingContacts([]);

      // Find holiday info from holidays.json
      if (event.type === "Holiday") {
        const foundHoliday = (holidaysData as HolidayInfo[]).find(
          (h) => h.holiday === event.name
        );
        if (foundHoliday) {
          setHolidayInfo(foundHoliday);
        }

        // Find all contacts celebrating this holiday
        if (event.dateString) {
          const [year, month, day] = event.dateString.split("-").map(Number);
          const celebrating = contacts.filter((contact) =>
            contact.holidays.some((h) => {
              const [holidayMonth, holidayDay] = h.date.split("/").map(Number);
              return (
                h.name === event.name &&
                holidayMonth === month &&
                holidayDay === day
              );
            })
          );
          setCelebratingContacts(celebrating);
        }

        // Fetch AI summary
        setLoading(true);
        const task = InteractionManager.runAfterInteractions(() => {
          fetchGeminiExplanation(event);
        });
        return () => task.cancel();
      } else {
        // For birthdays, just show the contact celebrating
        const contact = contacts.find(
          (c) => `${c.firstName} ${c.lastName}` === event.contactName
        );
        if (contact) {
          setCelebratingContacts([contact]);
        }
      }
    }
  }, [visible, event, contacts]);

  const fetchGeminiExplanation = async (currentEvent: EventItem) => {
    const date = currentEvent.dateString || "the specific date";
    const name = currentEvent.name;
    // Updated prompt from second snippet to ensure better formatting
    const userQuery = `Summarize the general wikipedia link for the holiday ${name} on the date ${date}. It should have its overview, meaning, and how locals celebrate it and how people out of the culture can celebrate it. Make sure that each paragraph is no more than 3 sentences.`;

    // NOTE: Ensure this key is valid. In production, protect this key.
    const apiKey = "AIzaSyD1I-A3oAPXw3QucreOZKj5dbcT3diQY_Y";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
        }),
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

  const openMessagingApp = async (greetingText: string) => {
    try {
      const encodedMessage = encodeURIComponent(greetingText);
      const url = `sms:?body=${encodedMessage}`;

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Unable to open messaging app");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open messaging app");
    }
  };

  const generateCustomMessage = () => {
    if (!event || celebratingContacts.length === 0) return "";

    const firstName = celebratingContacts[0].firstName;

    if (event.type === "Birthday") {
      return `Happy Birthday, ${firstName}! 🎉 Wishing you a wonderful day filled with joy, laughter, and all your favorite things. Have an amazing year ahead!`;
    } else {
      return `Happy ${event.name}, ${firstName}! Wishing you a wonderful celebration and all the best on this special day!`;
    }
  };

  if (!event) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background, maxHeight: "80%" },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: colors.tint }]}>
                Done
              </Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {event.name}
            </Text>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Celebrating Contacts */}
            <View style={styles.section}>
              <Text style={[styles.sectionHeader, { color: colors.text }]}>
                {event.type === "Birthday" ? "Birthday" : "Celebrating"}
              </Text>
              {celebratingContacts.map((contact, index) => (
                <View
                  key={index}
                  style={[
                    styles.contactItem,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.text + "20",
                    },
                  ]}
                >
                  {contact.photoUri && (
                    <Image
                      source={{ uri: contact.photoUri }}
                      style={styles.contactPhoto}
                    />
                  )}
                  <Text style={[styles.contactName, { color: colors.tint }]}>
                    {contact.firstName} {contact.lastName}
                  </Text>
                </View>
              ))}
            </View>

            {/* Holiday Info from holidays.json */}
            {holidayInfo && (
              <>
                <View style={styles.section}>
                  <Text style={[styles.sectionHeader, { color: colors.text }]}>
                    Location
                  </Text>
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    {holidayInfo.location}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionHeader, { color: colors.text }]}>
                    Cultural Group
                  </Text>
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    {holidayInfo.who}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionHeader, { color: colors.text }]}>
                    About
                  </Text>
                  <Text style={[styles.infoText, { color: colors.text }]}>
                    {holidayInfo.summary}
                  </Text>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionHeader, { color: colors.text }]}>
                    Greeting
                  </Text>
                  <Text style={[styles.greetingText, { color: colors.text }]}>
                    {holidayInfo.greeting.replace(
                      "[contact name]",
                      celebratingContacts[0]?.firstName || "there"
                    )}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.messageButton,
                      { backgroundColor: colors.tint },
                    ]}
                    onPress={() =>
                      openMessagingApp(
                        holidayInfo.greeting.replace(
                          "[contact name]",
                          celebratingContacts[0]?.firstName || "there"
                        )
                      )
                    }
                  >
                    <Text style={styles.messageButtonText}>
                      Send as Message
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {!holidayInfo && celebratingContacts.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>
                  Send a Message
                </Text>
                <Text style={[styles.greetingText, { color: colors.text }]}>
                  {generateCustomMessage()}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.messageButton,
                    { backgroundColor: colors.tint },
                  ]}
                  onPress={() => openMessagingApp(generateCustomMessage())}
                >
                  <Text style={styles.messageButtonText}>Send as Message</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* AI Summary Section with Markdown */}
            {event.type === "Holiday" && (
              <View style={styles.section}>
                <Text style={[styles.sectionHeader, { color: colors.text }]}>
                  Suggestion from AI
                </Text>
                <View
                  style={[
                    styles.aiContainer,
                    { backgroundColor: colors.text + "10" },
                  ]}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color={colors.tint} />
                      <Text
                        style={[styles.loadingText, { color: colors.text }]}
                      >
                        Consulting Gemini...
                      </Text>
                    </View>
                  ) : error ? (
                    <Text style={{ color: "red" }}>{error}</Text>
                  ) : aiSummary ? (
                    /* 2. Markdown Component Applied Here */
                    <Markdown
                      style={{
                        body: {
                          color: colors.text,
                          fontSize: 14,
                          lineHeight: 22,
                        },
                        link: {
                          color: colors.tint,
                        },
                      }}
                    >
                      {aiSummary}
                    </Markdown>
                  ) : null}
                </View>
              </View>
            )}
            {/* Added padding at bottom to ensure content isn't cut off */}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  closeButton: {
    fontSize: 17,
    fontWeight: "600",
  },
  titleContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  contactPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
  },
  greetingText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
  },
  messageButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  messageButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  aiContainer: {
    width: "100%",
    minHeight: 50,
    padding: 12,
    borderRadius: 8,
  },
  // Kept for reference, but Markdown overrides these via style props
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
});