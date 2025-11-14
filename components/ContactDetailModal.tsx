import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Contact } from "@/hooks/useContacts";
import React from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from "react-native";

interface ContactDetailModalProps {
  visible: boolean;
  contact: Contact | null;
  deleteContact: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function ContactDetailModal({
  visible,
  contact,
  deleteContact,
  onClose
}: ContactDetailModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  if (!contact) return null;

  const formatDate = (date: Date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const calculateAge = (birthday: Date) => {
    // Ensure birthday is a Date object
    const birthdayDate =
      birthday instanceof Date ? birthday : new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthdayDate.getFullYear();
    const monthDiff = today.getMonth() - birthdayDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthdayDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getNextBirthday = (birthday: Date) => {
    const birthdayDate =
      birthday instanceof Date ? birthday : new Date(birthday);
    const today = new Date();
    const thisYear = today.getFullYear();
    let nextBirthday = new Date(
      thisYear,
      birthdayDate.getMonth(),
      birthdayDate.getDate()
    );

    if (nextBirthday < today) {
      nextBirthday = new Date(
        thisYear + 1,
        birthdayDate.getMonth(),
        birthdayDate.getDate()
      );
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const daysUntilBirthday = getNextBirthday(contact.birthday);
  const age = calculateAge(contact.birthday);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: colors.tint }]}>
              Done
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Contact Info
          </Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.profileSection}>
            <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
              <Text style={styles.avatarText}>
                {contact.firstName[0]}
                {contact.lastName[0]}
              </Text>
            </View>
            <Text style={[styles.name, { color: colors.text }]}>
              {contact.firstName} {contact.lastName}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Birthday
              </Text>
              <Text style={[styles.birthdayDate, { color: colors.text }]}>
                {formatDate(contact.birthday)}
              </Text>
              <Text style={[styles.ageText, { color: colors.text + "80" }]}>
                Age: {age} years old
              </Text>
              <Text style={[styles.countdownText, { color: colors.tint }]}>
                {daysUntilBirthday === 0
                  ? "🎉 Birthday is today!"
                  : daysUntilBirthday === 1
                  ? "🎂 Birthday is tomorrow!"
                  : `🎈 ${daysUntilBirthday} days until birthday`}
              </Text>
            </View>

            {contact.holidays && contact.holidays.length > 0 && (
              <View style={styles.infoCard}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Custom Holidays ({contact.holidays.length})
                </Text>
                {contact.holidays.map((holiday, index) => (
                  <View key={index} style={styles.holidayRow}>
                    <Text style={[styles.holidayName, { color: colors.text }]}>
                      {holiday.name}
                    </Text>
                    <Text
                      style={[
                        styles.holidayDate,
                        { color: colors.text + "80" }
                      ]}
                    >
                      {holiday.date}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          <TouchableOpacity>
            <Text
              style={[styles.deleteButton]}
              onPress={async () => {
                await deleteContact(contact.id);
                onClose();
              }}
            >
              Delete Contact
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0"
  },
  title: {
    fontSize: 18,
    fontWeight: "bold"
  },
  closeButton: {
    fontSize: 16,
    fontWeight: "600"
  },
  content: {
    flex: 1
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15
  },
  avatarText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold"
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center"
  },
  infoSection: {
    paddingHorizontal: 20
  },
  infoCard: {
    backgroundColor: "transparent",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15
  },
  birthdayDate: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 5
  },
  ageText: {
    fontSize: 16,
    marginBottom: 10
  },
  countdownText: {
    fontSize: 16,
    fontWeight: "500"
  },
  holidayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  holidayName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1
  },
  holidayDate: {
    fontSize: 14
  },
  deleteButton: {
    color: "red",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 15
  }
});
