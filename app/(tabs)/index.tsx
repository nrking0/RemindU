import { Text, View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useContacts } from "@/hooks/useContacts";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";

export default function TabOneScreen() {
  const now = new Date();
  const d =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");
  const [selected, setSelected] = useState(d);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { contacts, refreshContacts } = useContacts();

  useFocusEffect(
    useCallback(() => {
      refreshContacts();
    }, [refreshContacts])
  );

  const calendarTheme = {
    backgroundColor: colors.background,
    calendarBackground: colors.background,
    textSectionTitleColor: colorScheme === "dark" ? "#888" : "#b6c1cd",
    selectedDayBackgroundColor: colors.tint,
    selectedDayTextColor: colorScheme === "dark" ? "#000" : "#ffffff",
    todayTextColor: colors.tint,
    dayTextColor: colors.text,
    textDisabledColor: colorScheme === "dark" ? "#666" : "#d9e1e8",
    monthTextColor: colors.text,
    indicatorColor: colors.tint,
    textDayFontWeight: "400" as const,
    textMonthFontWeight: "bold" as const,
    textDayHeaderFontWeight: "300" as const,
    arrowColor: colors.tint
  };

  const getMarkedDates = (selectedDate: string) => {
    const [selectedYear, selectedMonth, selectedDay] = selectedDate
      .split("-")
      .map((num) => parseInt(num));

    const holidaysOnDate = contacts.flatMap((contact) =>
      contact.holidays
        .filter((holiday) => {
          const [holidayMonth, holidayDay, holidayYear] = holiday.date
            .split("/")
            .map((num) => parseInt(num));
          return holidayMonth === selectedMonth && holidayDay === selectedDay;
        })
        .map((holiday) => ({
          name: holiday.name,
          contactName: `${contact.firstName} ${contact.lastName}`
        }))
    );

    const birthdaysOnDate = contacts
      .filter((contact) => {
        const birthdayDate = new Date(contact.birthday);
        return (
          birthdayDate.getMonth() + 1 === selectedMonth &&
          birthdayDate.getDate() === selectedDay
        );
      })
      .map((contact) => ({
        name: "Birthday",
        contactName: `${contact.firstName} ${contact.lastName}`
      }));

    return [...holidaysOnDate, ...birthdaysOnDate];
  };

  //   const [datesToMark, setDatesToMark] = useState<{ [key: string]: { marked: boolean; dotColor?: string, selected?: boolean } }>({});

  //   useEffect(() => {

  const getDatesToMark = (selected: string) => {
    const datesToMark: {
      [key: string]: { marked: boolean; dotColor?: string; selected?: boolean };
    } = {};
    const [selectedYear, selectedMonth, selectedDay] = selected
      .split("-")
      .map((num) => parseInt(num));

    contacts.forEach((contact) => {
      const [bdayYear, bdayMonth, bdayDay] = contact.birthday
        .toISOString()
        .split("T")[0]
        .split("-")
        .map((num) => parseInt(num));

      const birthdayDate = new Date(bdayYear, bdayMonth - 1, bdayDay);
      const birthdayKey = `${selectedYear}-${String(
        birthdayDate.getMonth() + 1
      ).padStart(2, "0")}-${String(birthdayDate.getDate()).padStart(2, "0")}`;
      if (
        selectedMonth === birthdayDate.getMonth() + 1 &&
        selectedDay === birthdayDate.getDate()
      ) {
        datesToMark[birthdayKey] = {
          marked: true,
          dotColor: "salmon",
          selected: true
        };
      } else {
        datesToMark[birthdayKey] = { marked: true, dotColor: "salmon" };
      }
    });

    contacts.forEach((contact) => {
      contact.holidays.forEach((holiday) => {
        const holidayMonth = holiday.date
          .split("/")
          .map((num) => parseInt(num))[0];
        const holidayDay = holiday.date
          .split("/")
          .map((num) => parseInt(num))[1];
        const holidayKey = `${selectedYear}-${String(holidayMonth).padStart(
          2,
          "0"
        )}-${String(holidayDay).padStart(2, "0")}`;
        if (selectedMonth === holidayMonth && selectedDay === holidayDay) {
          datesToMark[holidayKey] = {
            marked: true,
            dotColor: colors.text,
            selected: true
          };
        } else {
          datesToMark[holidayKey] = { marked: true, dotColor: colors.tint };
        }
      });
    });
    // console.log("Dates to mark:", datesToMark);
    return datesToMark;
  };

  //         setDatesToMark(getDatesToMark(selected));

  //   }, [contacts, selected]);

  return (
    <View style={styles.container}>
      <View style={{ width: "100%", top: 0 }}>
        <Calendar
          current={selected}
          theme={calendarTheme}
          hideExtraDays={true}
          firstDay={1}
          hideDayNames={false}
          onMonthChange={(month) => {
            console.log("month changed", month);
          }}
          onDayPress={(day) => {
            setSelected(day.dateString);
          }}
          markedDates={{
            [selected]: {
              selected: true,
              disableTouchEvent: true
            },

            ...getDatesToMark(selected)
            //  ...datesToMark
          }}
          enableSwipeMonths={true}
        />
      </View>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <View style={styles.eventsContainer}>
        <Text style={[styles.eventsTitle, { color: colors.text }]}>
          {selected
            ? `Events for ${new Date(
                selected.split("-").map(Number)[0],
                selected.split("-").map(Number)[1] - 1,
                selected.split("-").map(Number)[2]
              ).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric"
              })}`
            : "Events"}
        </Text>
        {getMarkedDates(selected).length === 0 ? (
          <View style={styles.noEventsContainer}>
            <Text style={[styles.noEventsText, { color: colors.text + "80" }]}>
              No events for this date
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.eventsList}
            showsVerticalScrollIndicator={false}
          >
            {getMarkedDates(selected).map((event, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.eventItem,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.text + "20"
                  }
                ]}
                onPress={() => {
                  console.log("Event tapped:", event);
                }}
              >
                <View style={styles.eventContent}>
                  <Text style={[styles.eventTitle, { color: colors.text }]}>
                    {event.name}
                  </Text>
                  <Text
                    style={[
                      styles.eventSubtitle,
                      { color: colors.text + "70" }
                    ]}
                  >
                    {event.contactName}
                  </Text>
                </View>
                <View
                  style={[
                    styles.eventIndicator,
                    {
                      backgroundColor:
                        event.name === "Birthday" ? "salmon" : colors.tint
                    }
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    height: "100%"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold"
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%"
  },
  eventsContainer: {
    flex: 1,
    paddingVertical: 12,
    width: "100%"
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    paddingHorizontal: 16
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40
  },
  noEventsText: {
    fontSize: 16,
    fontStyle: "italic"
  },
  eventsList: {
    flex: 1
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12
  },
  eventContent: {
    flex: 1
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2
  },
  eventSubtitle: {
    fontSize: 14
  },
  eventIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
    marginLeft: 12
  },
  holidayBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 6,
    width: "100%",
    elevation: 3
  }
});
