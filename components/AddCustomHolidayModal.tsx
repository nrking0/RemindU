import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Contact, useContacts } from "@/hooks/useContacts";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from "react-native";
import ContactSelector from "./ContactSelector";

interface AddCustomHolidayModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddCustomHolidayModal({
  visible,
  onClose
}: AddCustomHolidayModalProps) {
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isContactSelectorVisible, setIsContactSelectorVisible] =
    useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { contacts, addContact } = useContacts();

  const formatDateInput = (text: string) => {
    const numbers = text.replace(/\D/g, "");

    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )}`;
    }
  };

  const handleDateChange = (text: string) => {
    const formatted = formatDateInput(text);
    setHolidayDate(formatted);
  };

  const validateDate = (dateString: string) => {
    if (dateString.length !== 10) return false;

    const [month, day, year] = dateString
      .split("/")
      .map((num) => parseInt(num));

    if (isNaN(month) || isNaN(day) || isNaN(year)) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;

    return true;
  };

  const toggleContactSelection = (contactId: string) => {
    if (selectedContactIds.includes(contactId)) {
      setSelectedContactIds(
        selectedContactIds.filter((id) => id !== contactId)
      );
    } else {
      setSelectedContactIds([...selectedContactIds, contactId]);
    }
  };

  const handleAddHoliday = async () => {
    if (!holidayName.trim()) {
      Alert.alert("Error", "Please enter a holiday name");
      return;
    }

    if (!validateDate(holidayDate)) {
      Alert.alert("Error", "Please enter a valid date (MM/DD/YYYY)");
      return;
    }

    if (selectedContactIds.length === 0) {
      Alert.alert("Error", "Please select at least one contact");
      return;
    }

    for (const contactId of selectedContactIds) {
      const contact = contacts.find((c) => c.id === contactId);
      if (contact) {
        const updatedContact: Contact = {
          ...contact,
          holidays: [
            ...contact.holidays,
            { name: holidayName.trim(), date: holidayDate }
          ]
        };
        await addContact(updatedContact);
      }
    }

    setHolidayName("");
    setHolidayDate("");
    setSelectedContactIds([]);
    onClose();
  };

  const handleClose = () => {
    setHolidayName("");
    setHolidayDate("");
    setSelectedContactIds([]);
    setIsContactSelectorVisible(false);
    onClose();
  };

  const removeContact = (contactId: string) => {
    setSelectedContactIds(selectedContactIds.filter((id) => id !== contactId));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={[styles.cancelButton, { color: colors.tint }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              Add Custom Holiday
            </Text>
            <TouchableOpacity onPress={handleAddHoliday}>
              <Text style={[styles.saveButton, { color: colors.tint }]}>
                Add
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* Holiday Name */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Holiday Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#333" : "#f5f5f5",
                    color: colors.text,
                    borderColor: colors.text + "20"
                  }
                ]}
                placeholder="e.g., Family Reunion"
                placeholderTextColor={colors.text + "60"}
                value={holidayName}
                onChangeText={setHolidayName}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>Date</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#333" : "#f5f5f5",
                    color: colors.text,
                    borderColor: colors.text + "20"
                  }
                ]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={colors.text + "60"}
                value={holidayDate}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Friends ({selectedContactIds.length})
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    { backgroundColor: colors.tint }
                  ]}
                  onPress={() => setIsContactSelectorVisible(true)}
                >
                  <Text style={styles.selectButtonText}>Select from List</Text>
                </TouchableOpacity>
              </View>

              {selectedContactIds.length > 0 && (
                <View style={styles.selectedContactsList}>
                  {selectedContactIds.map((contactId) => {
                    const contact = contacts.find((c) => c.id === contactId);
                    if (!contact) return null;
                    return (
                      <View
                        key={contactId}
                        style={[
                          styles.selectedContactItem,
                          {
                            borderBottomColor: colors.text + "30"
                          }
                        ]}
                      >
                        <View style={styles.selectedContactInfo}>
                          <Text
                            style={[
                              styles.selectedContactName,
                              { color: colors.text }
                            ]}
                          >
                            {contact.firstName} {contact.lastName}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeContact(contactId)}
                        >
                          <Text
                            style={[
                              styles.removeButton,
                              { color: "red" }
                            ]}
                          >
                            Remove
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <ContactSelector
        visible={isContactSelectorVisible}
        contacts={contacts}
        selectedContactIds={selectedContactIds}
        onToggleContact={toggleContactSelection}
        onClose={() => setIsContactSelectorVisible(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)"
  },
  cancelButton: {
    fontSize: 17
  },
  title: {
    fontSize: 18,
    fontWeight: "600"
  },
  saveButton: {
    fontSize: 17,
    fontWeight: "600"
  },
  content: {
    flex: 1,
    paddingHorizontal: 16
  },
  section: {
    marginTop: 24
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  selectButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6
  },
  selectButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600"
  },
  sublabel: {
    fontSize: 14,
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16
  },
  selectedContactsList: {
    marginTop: 8
  },
  selectedContactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0"
  },
  selectedContactInfo: {
    flex: 1
  },
  selectedContactName: {
    fontSize: 16,
    fontWeight: "500"
  },
  removeButton: {
    fontSize: 14,
    fontWeight: "500"
  },
  contactsList: {
    marginTop: 8
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 2
  },
  contactInfo: {
    flex: 1
  },
  contactName: {
    fontSize: 16,
    fontWeight: "500"
  },
  checkmark: {
    fontSize: 20,
    fontWeight: "bold"
  }
});
