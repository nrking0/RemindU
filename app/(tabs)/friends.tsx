import AddFriendModal from "@/components/AddFriendModal";
import ContactDetailModal from "@/components/ContactDetailModal";
import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useFriendsContext } from "@/contexts/FriendsContext";
import { Contact, useContacts } from "@/hooks/useContacts";
import React, { useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity
} from "react-native";

export default function TabTwoScreen() {
  const { contacts, addContact, removeContact } = useContacts();
  const { isAddModalVisible, setIsAddModalVisible } = useFriendsContext();
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleContactPress = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailModalVisible(true);
  };

  const handleAddContact = async (newContact: Contact) => {
    await addContact(newContact);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const formatBirthday = (date: Date) => {
    const birthdayDate = date instanceof Date ? date : new Date(date);
    return birthdayDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };

  const getDaysUntilBirthday = (birthday: Date) => {
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

  const renderContactItem = ({ item }: { item: Contact }) => {
    const daysUntil = getDaysUntilBirthday(item.birthday);

    return (
      <TouchableOpacity
        style={[styles.contactItem, { borderBottomColor: colors.text + "20" }]}
        onPress={() => handleContactPress(item)}
      >
        <View style={styles.contactContent}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>
              {item.firstName[0]}
              {item.lastName[0]}
            </Text>
          </View>

          <View style={styles.contactInfo}>
            <Text style={[styles.contactName, { color: colors.text }]}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={[styles.birthdayText, { color: colors.text + "80" }]}>
              Birthday: {formatBirthday(item.birthday)}
              {item.holidays.length > 0 &&
                ` • ${item.holidays.length} holidays`}
            </Text>
          </View>

          <View style={styles.birthdayCountdown}>
            {daysUntil === 0 ? (
              <Text style={[styles.todayBirthday, { color: "pink" }]}>
                🎉 Today!
              </Text>
            ) : daysUntil === 1 ? (
              <Text style={[styles.tomorrowBirthday, { color: "teal" }]}>
                🎂 Tomorrow
              </Text>
            ) : daysUntil <= 7 ? (
              <Text style={[styles.soonBirthday, { color: colors.tint }]}>
                🎈 {daysUntil} days
              </Text>
            ) : (
              <Text
                style={[styles.futureBirthday, { color: colors.text + "60" }]}
              >
                {daysUntil} days
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.text + "60" }]}>
        No friends added yet
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.text + "40" }]}>
        Tap the + button to add your first friend
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={contacts}
        renderItem={renderContactItem}
        keyExtractor={(item, index) =>
          `${item.firstName}-${item.lastName}-${index}`
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
        contentContainerStyle={
          contacts.length === 0 ? styles.emptyList : styles.list
        }
      />

      <AddFriendModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAddContact={handleAddContact}
      />

      <ContactDetailModal
        visible={isDetailModalVisible}
        contact={selectedContact}
        deleteContact={removeContact}
        onClose={() => setIsDetailModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  list: {
    paddingTop: 10
  },
  emptyList: {
    flex: 1,
    justifyContent: "center"
  },
  contactItem: {
    borderBottomWidth: 1
  },
  contactContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },
  contactInfo: {
    flex: 1
  },
  contactName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4
  },
  birthdayText: {
    fontSize: 14
  },
  birthdayCountdown: {
    alignItems: "flex-end"
  },
  todayBirthday: {
    fontSize: 14,
    fontWeight: "bold"
  },
  tomorrowBirthday: {
    fontSize: 14,
    fontWeight: "bold"
  },
  soonBirthday: {
    fontSize: 14,
    fontWeight: "600"
  },
  futureBirthday: {
    fontSize: 12
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 40
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20
  }
});
