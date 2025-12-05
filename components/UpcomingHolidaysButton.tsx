import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

interface UpcomingHolidaysButtonProps {
  onPress: () => void;
}

export default function UpcomingHolidaysButton({
  onPress
}: UpcomingHolidaysButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      <Ionicons name="list" size={24} color={colors.tint} />
    </TouchableOpacity>
  );
}
