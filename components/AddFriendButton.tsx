import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useFriendsContext } from "@/contexts/FriendsContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { Pressable } from "react-native";

export default function AddFriendButton() {
  const { setIsAddModalVisible } = useFriendsContext();
  const colorScheme = useColorScheme();

  return (
    <Pressable onPress={() => setIsAddModalVisible(true)}>
      {({ pressed }) => (
        <FontAwesome
          name="plus"
          size={20}
          color={Colors[colorScheme ?? "light"].text}
          style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
        />
      )}
    </Pressable>
  );
}
