import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Contact } from "@/hooks/useContacts";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from "react-native";

interface ContactSelectorProps {
  visible: boolean;
  contacts: Contact[];
  selectedContactIds: string[];
  onToggleContact: (contactId: string) => void;
  onClose: () => void;
}

export default function ContactSelector({
  visible,
  contacts,
  selectedContactIds,
  onToggleContact,
  onClose
}: ContactSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const isSelected = (contactId: string) => {
    return selectedContactIds.includes(contactId);
  };

  const renderContactItem = ({ item }: { item: Contact }) => {
    const selected = isSelected(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.contactItem,
          {
            backgroundColor: selected
              ? colors.tint + "20"
              : colors.background,
            borderColor: selected ? colors.tint : colors.text
          }
        ]}
        onPress={() => onToggleContact(item.id)}
      >
        <View style={styles.contactContent}>
          <Text
            style={[
              styles.contactName,
              { color: colors.text, fontWeight: selected ? "600" : "400",
                backgroundColor: selected ? colors.tint + "20" : "transparent"
               }
            ]}
          >
            {item.firstName} {item.lastName}
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
            Select Friends
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
            placeholder="Search friends..."
            placeholderTextColor={colors.text + "60"}
          />
        </View>

        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.2)"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold"
  },
  doneButton: {
    fontSize: 17,
    fontWeight: "600"
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1
  },
  listContainer: {
    padding: 16
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2
  },
  contactContent: {
    flex: 1
  },
  contactName: {
    fontSize: 16
  },
  checkmark: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12
  }
});
