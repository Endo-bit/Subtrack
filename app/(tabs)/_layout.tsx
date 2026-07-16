import { Tabs } from 'expo-router';
import { BarChart3, CalendarDays, Home, PlusCircle, Settings } from 'lucide-react-native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { useSubTrack } from '@/context/SubTrackContext';

export default function TabLayout() {
  const { t } = useSubTrack();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#FF5C35',
      tabBarInactiveTintColor: dark ? '#636366' : '#8E8E93',
      tabBarStyle: {
        backgroundColor: dark ? '#1C1C1E' : '#FFFFFF',
        borderTopColor: dark ? '#38383A' : '#E5E5EA',
        borderTopWidth: 0.5,
        height: 82,
        paddingBottom: 28,
        paddingTop: 10,
      },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ title: t.overview, tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="add" options={{ title: t.add, tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} /> }} />
      <Tabs.Screen name="calendar" options={{ title: t.calendar, tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} /> }} />
      <Tabs.Screen name="analysis" options={{ title: t.analysis, tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: t.settings, tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
    </Tabs>
  );
}
