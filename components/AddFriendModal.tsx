import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Contact } from "@/hooks/useContacts";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity
} from "react-native";
import HolidaySelector from "./HolidaySelector";

interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
  onAddContact: (contact: Contact) => void;
}

export default function AddFriendModal({
  visible,
  onClose,
  onAddContact
}: AddFriendModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [birthdayDate, setBirthdayDate] = useState<Date>(new Date());
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [holidays, setHolidays] = useState<{ name: string; date: string }[]>(
    []
  );
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [isHolidaySelectorVisible, setIsHolidaySelectorVisible] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const addHoliday = () => {
    if (newHolidayName.trim() && newHolidayDate.trim()) {
      setHolidays([
        ...holidays,
        { name: newHolidayName.trim(), date: newHolidayDate.trim() }
      ]);
      setNewHolidayName("");
      setNewHolidayDate("");
    }
  };

  const addPredefinedHoliday = (holiday: { name: string; date: string }) => {
    const alreadyExists = holidays.some((h) => h.name === holiday.name);
    
    if (alreadyExists) {
      setHolidays(holidays.filter((h) => h.name !== holiday.name));
    } else {
      setHolidays([...holidays, holiday]);
    }
  };

  const removeHoliday = (index: number) => {
    setHolidays(holidays.filter((_, i) => i !== index));
  };

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

  const handleBirthdayChange = (text: string) => {
    const formatted = formatDateInput(text);
    setBirthday(formatted);
  };

  const handleHolidayDateChange = (text: string) => {
    const formatted = formatDateInput(text);
    setNewHolidayDate(formatted);
  };

  const validateDate = (dateString: string) => {
    if (dateString.length !== 10) return false;

    const [month, day, year] = dateString
      .split("/")
      .map((num) => parseInt(num));

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2100) return false;

    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "Please enter both first and last name");
      return;
    }

    let finalBirthdayDate: Date;

    if (birthday.trim()) {
      if (birthday.length !== 10) {
        Alert.alert("Error", "Please enter a complete birthday (MM/DD/YYYY)");
        return;
      }

      if (!validateDate(birthday)) {
        Alert.alert("Error", "Please enter a valid birthday date");
        return;
      }

      const [month, day, year] = birthday.split("/");
      finalBirthdayDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day)
      );
    } else {
      finalBirthdayDate = birthdayDate;
    }

    for (const holiday of holidays) {
      if (!validateDate(holiday.date)) {
        Alert.alert("Error", `Please enter a valid date for "${holiday.name}"`);
        return;
      }
    }

    const newContact: Contact = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthday: finalBirthdayDate,
      holidays: holidays,
      id: Math.random().toString(36),
      photoUri: photoUri || undefined
    };

    onAddContact(newContact);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setBirthday("");
    setBirthdayDate(new Date());
    setPhotoUri(null);
    setHolidays([]);
    setNewHolidayName("");
    setNewHolidayDate("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colorScheme === "dark" ? "#333" : "#f5f5f5",
      color: colors.text,
      borderColor: colors.text + "20"
    }
  ];

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
              Add Friend
            </Text>
            <TouchableOpacity onPress={handleSubmit}>
              <Text style={[styles.saveButton, { color: colors.tint }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View style={styles.photoSection}>
              <TouchableOpacity 
                style={[
                  styles.photoContainer, 
                  { 
                    backgroundColor: "transparent" 
                  }
                ]}
                onPress={pickImage}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={[styles.photoText, { color: colors.tint }]}>
                      Add Photo
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                First Name
              </Text>
              <TextInput
                style={inputStyle}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor={colors.text + "60"}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Last Name
              </Text>
              <TextInput
                style={inputStyle}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor={colors.text + "60"}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.text }]}>
                Birthday
              </Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[inputStyle, styles.dateInput]}
                  value={birthday}
                  onChangeText={handleBirthdayChange}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={colors.text + "60"}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Holidays
                </Text>
                <TouchableOpacity
                  style={[styles.selectButton, { backgroundColor: colors.tint }]}
                  onPress={() => setIsHolidaySelectorVisible(true)}
                >
                  <Text style={styles.selectButtonText}>
                    Select from List
                  </Text>
                </TouchableOpacity>
              </View>

              {holidays.map((holiday, index) => (
                <View 
                  key={index} 
                  style={[
                  styles.holidayItem,
                  index === holidays.length - 1 && { borderBottomWidth: 0 }
                  ]}
                >
                  <View style={styles.holidayInfo}>
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
                  <TouchableOpacity onPress={() => removeHoliday(index)}>
                  <Text style={[styles.removeButton, { color: "red" }]}>
                    Remove
                  </Text>
                  </TouchableOpacity>
                </View>
              ))}

              <View style={[styles.divider, { borderBottomColor: colors.text + "20" }]} />


              <View style={styles.addHolidaySection}>
                <Text style={[styles.sectionSubtitle, { color: colors.text + "80" }]}>
                  Or add a custom holiday:
                </Text>
                <TextInput
                  style={[inputStyle, styles.holidayInput]}
                  value={newHolidayName}
                  onChangeText={setNewHolidayName}
                  placeholder="Holiday name"
                  placeholderTextColor={colors.text + "60"}
                />
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={[inputStyle, styles.dateInput]}
                    value={newHolidayDate}
                    onChangeText={handleHolidayDateChange}
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor={colors.text + "60"}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.tint }]}
                  onPress={addHoliday}
                >
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <HolidaySelector
        visible={isHolidaySelectorVisible}
        onClose={() => setIsHolidaySelectorVisible(false)}
        onSelectHoliday={addPredefinedHoliday}
        selectedHolidays={holidays}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1"
  },
  title: {
    fontSize: 18,
    fontWeight: "bold"
  },
  cancelButton: {
    fontSize: 16
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600"
  },
  content: {
    flex: 1,
    padding: 20
  },
  photoSection: {
    alignItems: "center",
    marginBottom: 24
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center"
  },
  photo: {
    width: "100%",
    height: "100%"
  },
  photoPlaceholder: {
    justifyContent: "center",
    alignItems: "center"
  },
  photoText: {
    fontSize: 14,
    fontWeight: "500"
  },
  section: {
    marginBottom: 20
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  label: {
    fontSize: 16,
    fontWeight: "600"
  },
  selectButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  selectButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600"
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16
  },
  holidayItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0"
  },
  holidayInfo: {
    flex: 1
  },
  holidayName: {
    fontSize: 16,
    fontWeight: "500"
  },
  holidayDate: {
    fontSize: 14,
    marginTop: 2
  },
  removeButton: {
    fontSize: 14,
    fontWeight: "500"
  },
  addHolidaySection: {
    marginTop: 15
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 10,
    fontStyle: "italic"
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: 15
  },
  holidayInput: {
    marginBottom: 10
  },
  addButton: {
    paddingVertical: 10,
    marginTop: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center"
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  },
  dateInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  dateInput: {
    flex: 1
  }
});
