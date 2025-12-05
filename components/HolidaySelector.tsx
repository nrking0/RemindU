import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import holidaysData from "@/constants/holidays.json";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from "react-native";

interface Holiday {
  calendar: string;
  date: string;
  non_fixed: string;
  holiday: string;
  location: string;
  who: string;
  summary: string;
  greeting: string;
}

interface HolidaySelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectHoliday: (holiday: { name: string; date: string }) => void;
  selectedHolidays: { name: string; date: string }[];
}

export default function HolidaySelector({
  visible,
  onClose,
  onSelectHoliday,
  selectedHolidays
}: HolidaySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const holidays: Holiday[] = holidaysData as Holiday[];

  const filteredHolidays = holidays.filter((holiday) =>
    holiday.holiday.toLowerCase().includes(searchQuery.toLowerCase()) ||
    holiday.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    holiday.who.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSelected = (holidayName: string) => {
    return selectedHolidays.some((h) => h.name === holidayName);
  };

  const handleSelectHoliday = (holiday: Holiday) => {
    const currentYear = new Date().getFullYear();
    const [month, day] = holiday.date.split("-");
    const formattedDate = `${month}/${day}/${currentYear}`;

    onSelectHoliday({
      name: holiday.holiday,
      date: formattedDate
    });
  };

  const renderHolidayItem = ({ item }: { item: Holiday }) => {
    const selected = isSelected(item.holiday);

    return (
      <TouchableOpacity
        style={[
          styles.holidayItem,
          {
            backgroundColor: selected
              ? colors.tint + "20"
              : colors.background,
            borderColor: selected ? colors.tint : colors.text + "20"
          }
        ]}
        onPress={() => handleSelectHoliday(item)}
      >
        <View style={styles.holidayContent}>
          <Text
            style={[
              styles.holidayName,
              { color: colors.text, fontWeight: selected ? "600" : "400" }
            ]}
          >
            {item.holiday}
          </Text>
          <Text style={[styles.holidayInfo, { color: colors.text }]}>
            {item.location} • {item.who}
          </Text>
          <Text style={[styles.holidayDate, { color: colors.text }]}>
            {item.date} {item.non_fixed && `(${item.non_fixed})`}
          </Text>
        </View>
        {selected && (
          <Text style={[styles.checkmark, { color: colors.tint }]}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Select Holidays
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.doneButton, { color: colors.tint }]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colorScheme === "dark" ? "#333" : "#f5f5f5",
                color: colors.text,
                borderColor: colors.text + "20"
              }
            ]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search holidays by name, location, or culture..."
            placeholderTextColor={colors.text + "60"}
          />
        </View>

        <FlatList
          data={filteredHolidays}
          renderItem={renderHolidayItem}
          keyExtractor={(item, index) => `${item.holiday}-${index}`}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
  doneButton: {
    fontSize: 16,
    fontWeight: "600"
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16
  },
  listContainer: {
    padding: 20
  },
  holidayItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12
  },
  holidayContent: {
    flex: 1
  },
  holidayName: {
    fontSize: 16,
    marginBottom: 4
  },
  holidayInfo: {
    fontSize: 14,
    marginBottom: 2
  },
  holidayDate: {
    fontSize: 13
  },
  checkmark: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 12
  }
});
