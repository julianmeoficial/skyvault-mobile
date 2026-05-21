import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/stores/authStore';
import { ThemeProvider, useTheme } from '../src/theme';
import { NotificationProvider } from '../src/features/notifications/context/NotificationProvider';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { scheme, colors } = useTheme();

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bgMain },
          animation: 'ios_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen
          name="manufacturers/index"
          options={{ headerShown: true, title: 'Fabricantes', headerTintColor: colors.primary }}
        />
        <Stack.Screen
          name="families/index"
          options={{ headerShown: true, title: 'Familias', headerTintColor: colors.primary }}
        />
        <Stack.Screen
          name="aircraft/[id]"
          options={{ headerShown: true, title: 'Detalle', headerTintColor: colors.primary }}
        />
        <Stack.Screen
          name="manufacturers/[id]"
          options={{ headerShown: true, title: 'Fabricante', headerTintColor: colors.primary }}
        />
        <Stack.Screen
          name="families/[id]"
          options={{ headerShown: true, title: 'Familia', headerTintColor: colors.primary }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (fontsLoaded && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isHydrated]);

  if (!fontsLoaded || !isHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NotificationProvider>
          <RootNavigator />
        </NotificationProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
