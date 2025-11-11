import EditScreenInfo from "@/components/EditScreenInfo";
import { View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Calendar } from "react-native-calendars";

export default function TabOneScreen() {
    const [selected, setSelected] = useState("");
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const calendarTheme = {
        backgroundColor: colors.background,
        calendarBackground: colors.background,
        textSectionTitleColor: colorScheme === 'dark' ? '#888' : '#b6c1cd',
        selectedDayBackgroundColor: colors.tint,
        selectedDayTextColor: colorScheme === 'dark' ? '#000' : '#ffffff',
        todayTextColor: colors.tint,
        dayTextColor: colors.text,
        textDisabledColor: colorScheme === 'dark' ? '#666' : '#d9e1e8',
        monthTextColor: colors.text,
        indicatorColor: colors.tint,
        textDayFontWeight: '400' as const,
        textMonthFontWeight: 'bold' as const,
        textDayHeaderFontWeight: '300' as const,
        arrowColor: colors.tint,
    };

    return (
        <View style={styles.container}>
            <View style={{ width: "100%", top: 0 }}>
                <Calendar
                    current={Date()}
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
                            disableTouchEvent: true,
                            selectedColor: "orange",
                        },
                    }}
                    enableSwipeMonths={true}
                />
            </View>
            <View
                style={styles.separator}
                lightColor="#eee"
                darkColor="rgba(255,255,255,0.1)"
            />
            <EditScreenInfo path="app/(tabs)/index.tsx" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        height: "100%",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: "80%",
    },
});
