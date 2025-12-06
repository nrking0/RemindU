import AddFriendModal from "@/components/AddFriendModal";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useFriendsContext } from "@/contexts/FriendsContext";
import { Contact } from "@/hooks/useContacts";
import React from "react";
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from "react-native";

interface ContactDetailModalProps {
  visible: boolean;
  contact: Contact | null;
  editContact: (newContact: Contact) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function ContactDetailModal({
  visible,
  contact,
  editContact,
  deleteContact,
  onClose
}: ContactDetailModalProps) {
  const { isAddModalVisible, setIsAddModalVisible } = useFriendsContext();
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
          <View style={{ width: 50 }} />
          <Text style={[styles.title, { color: colors.text }]}>
            Contact Info
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: colors.tint }]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.profileSection}>
            {contact.photoUri ? (
              <Image
                source={{ uri: contact.photoUri }}
                style={styles.photoAvatar}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
                <Text style={styles.avatarText}>
                  {contact.firstName[0]}
                  {contact.lastName[0]}
                </Text>
              </View>
            )}
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
                  ? "Birthday is tomorrow!"
                  : `${daysUntilBirthday} days until birthday`}
              </Text>
            </View>

            {contact.holidays && contact.holidays.length > 0 && (
              <View style={styles.infoCard}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Holidays ({contact.holidays.length})
                </Text>
                {contact.holidays.map((holiday, index) => (
                  <View
                    key={index}
                    style={[
                      styles.holidayRow,
                      index === contact.holidays.length - 1 && {
                        borderBottomWidth: 0
                      }
                    ]}
                  >
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
              style={[styles.editButton, { color: colors.tint }]}
              onPress={async () => {
                setIsAddModalVisible(true)
              }}
            >
              Edit Contact
            </Text>
          </TouchableOpacity>
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
      <AddFriendModal
        visible={isAddModalVisible}
        mode={"edit"}
        onClose={() => setIsAddModalVisible(false)}
        contact={contact}
        onSubmit={editContact}
      />
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
  photoAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  editButton: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 15
  },
  deleteButton: {
    color: "red",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 15
  }
});
