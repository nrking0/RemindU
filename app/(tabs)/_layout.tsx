import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';

import AddCustomHolidayButton from '@/components/AddCustomHolidayButton';
import AddFriendButton from '@/components/AddFriendButton';
import UpcomingHolidaysButton from '@/components/UpcomingHolidaysButton';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { FriendsProvider, useFriendsContext } from '@/contexts/FriendsContext';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function TabsContent() {
  const colorScheme = useColorScheme();
  const { setIsUpcomingHolidaysModalVisible } = useFriendsContext();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerLeft: () => <UpcomingHolidaysButton onPress={() => setIsUpcomingHolidaysModalVisible(true)} />,
          headerRight: () => <AddCustomHolidayButton />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
          headerRight: () => <AddFriendButton />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <FriendsProvider>
      <TabsContent />
    </FriendsProvider>
  );
}
