import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Contact } from "@/hooks/useContacts";
import React from "react";
import {
    FlatList,
    Modal,
    StyleSheet,
    TouchableOpacity
} from "react-native";

interface UpcomingEvent {
  name: string;
  dateString: string;
  date: Date;
  type: "Holiday" | "Birthday";
  contactName: string;
  daysUntil: number;
}

interface UpcomingHolidaysModalProps {
  visible: boolean;
  contacts: Contact[];
  onClose: () => void;
  onSelectEvent: (event: { name: string; contactName: string; type: "Holiday" | "Birthday"; dateString?: string }) => void;
}

export default function UpcomingHolidaysModal({
  visible,
  contacts,
  onClose,
  onSelectEvent
}: UpcomingHolidaysModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getUpcomingEvents = (): UpcomingEvent[] => {
    const events: UpcomingEvent[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    contacts.forEach((contact) => {
      // Add birthday
      const birthday = contact.birthday instanceof Date ? contact.birthday : new Date(contact.birthday);
      const thisYear = today.getFullYear();
      let nextBirthday = new Date(thisYear, birthday.getMonth(), birthday.getDate());
      
      if (nextBirthday < today) {
        nextBirthday = new Date(thisYear + 1, birthday.getMonth(), birthday.getDate());
      }

      const birthdayDiff = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      events.push({
        name: `${contact.firstName} ${contact.lastName}'s Birthday`,
        dateString: nextBirthday.toISOString().split("T")[0],
        date: nextBirthday,
        type: "Birthday",
        contactName: `${contact.firstName} ${contact.lastName}`,
        daysUntil: birthdayDiff
      });

      // Add holidays
      contact.holidays?.forEach((holiday) => {
        const [month, day, year] = holiday.date.split("/");
        const holidayYear = parseInt(year);
        let holidayDate = new Date(holidayYear, parseInt(month) - 1, parseInt(day));

        // If the holiday is in the past, use next year
        if (holidayDate < today) {
          holidayDate = new Date(today.getFullYear() + 1, parseInt(month) - 1, parseInt(day));
        }

        const holidayDiff = Math.ceil((holidayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        events.push({
          name: holiday.name,
          dateString: holidayDate.toISOString().split("T")[0],
          date: holidayDate,
          type: "Holiday",
          contactName: `${contact.firstName} ${contact.lastName}`,
          daysUntil: holidayDiff
        });
      });
    });

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return events;
  };

  const groupEventsByDate = (events: UpcomingEvent[]) => {
    const grouped: { [key: string]: UpcomingEvent[] } = {};
    
    events.forEach((event) => {
      const key = `${event.name}-${event.dateString}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(event);
    });

    return Object.entries(grouped).map(([key, events]) => ({
      name: events[0].name,
      dateString: events[0].dateString,
      date: events[0].date,
      type: events[0].type,
      daysUntil: events[0].daysUntil,
      contacts: events.map(e => e.contactName)
    }));
  };

  const upcomingEvents = getUpcomingEvents();
  const groupedEvents = groupEventsByDate(upcomingEvents);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const renderEventItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={[
          styles.eventItem,
          {
            backgroundColor: colors.background,
            borderColor: colors.text
          }
        ]}
        onPress={() => {
          onSelectEvent({
            name: item.name,
            contactName: item.contacts.join(", "),
            type: item.type,
            dateString: item.dateString
          });
        }}
      >
        <View style={styles.eventContent}>
          <Text style={[styles.eventName, { color: colors.text }]}>
            {item.name}
          </Text>
          <Text style={[styles.eventDate, { color: colors.text}]}>
            {formatDate(item.date)}
          </Text>
          <Text style={[styles.contactCount, { color: colors.text }]}>
            {item.contacts.length} {item.contacts.length === 1 ? "person" : "people"}
          </Text>
        </View>
        
        <View style={styles.daysUntilBadge}>
          {item.daysUntil === 0 ? (
            <Text style={[styles.todayText, { color: "pink" }]}>Today!</Text>
          ) : item.daysUntil === 1 ? (
            <Text style={[styles.tomorrowText, { color: "teal" }]}>Tomorrow</Text>
          ) : item.daysUntil <= 7 ? (
            <Text style={[styles.soonText, { color: colors.tint }]}>
              {item.daysUntil}d
            </Text>
          ) : (
            <Text style={[styles.futureText, { color: colors.text }]}>
              {item.daysUntil}d
            </Text>
          )}
        </View>
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
          <View style={{ width: 60 }} />
          <Text style={[styles.title, { color: colors.text }]}>
            Upcoming Events
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.doneButton, { color: colors.tint }]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={groupedEvents}
          renderItem={renderEventItem}
          keyExtractor={(item, index) => `${item.name}-${item.dateString}-${index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text + "60" }]}>
                No upcoming events
              </Text>
            </View>
          }
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
  listContainer: {
    padding: 16
  },
  eventItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1
  },
  eventContent: {
    flex: 1
  },
  eventName: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4
  },
  eventDate: {
    fontSize: 14,
    marginBottom: 2
  },
  contactCount: {
    fontSize: 13
  },
  daysUntilBadge: {
    marginLeft: 12,
    minWidth: 60,
    alignItems: "flex-end"
  },
  todayText: {
    fontSize: 15,
    fontWeight: "bold"
  },
  tomorrowText: {
    fontSize: 15,
    fontWeight: "bold"
  },
  soonText: {
    fontSize: 16,
    fontWeight: "600"
  },
  futureText: {
    fontSize: 14
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center"
  },
  emptyText: {
    fontSize: 16
  }
});
