import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  HindSiliguri_400Regular,
  HindSiliguri_500Medium,
  HindSiliguri_600SemiBold,
  HindSiliguri_700Bold,
} from "@expo-google-fonts/hind-siliguri";
import { ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import {
  Text as RNText,
  TextInput as RNTextInput,
  StatusBar,
  View,
} from "react-native";
import "../src/i18n";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    HindSiliguri_400Regular,
    HindSiliguri_500Medium,
    HindSiliguri_600SemiBold,
    HindSiliguri_700Bold,
  });

  const darkTheme = {
    dark: true,
    colors: {
      primary: "#1E90FF",
      background: "#0A0A1F",
      card: "#0F0D23",
      text: "#FFFFFF",
      border: "#1E90FF",
      notification: "#FF6B6B",
    },
    fonts: {
      regular: {
        fontFamily: "HindSiliguri_400Regular",
        fontWeight: "400" as const,
      },
      medium: {
        fontFamily: "HindSiliguri_500Medium",
        fontWeight: "500" as const,
      },
      bold: {
        fontFamily: "HindSiliguri_700Bold",
        fontWeight: "700" as const,
      },
      heavy: {
        fontFamily: "HindSiliguri_700Bold",
        fontWeight: "800" as const,
      },
    },
  };
  // hiding status bar
  useEffect(() => {
    StatusBar.setHidden(true, "fade");
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;

    // Set default font for Text
    (RNText as any).defaultProps = (RNText as any).defaultProps || {};
    const prevStyle = Array.isArray((RNText as any).defaultProps.style)
      ? (RNText as any).defaultProps.style
      : [(RNText as any).defaultProps.style].filter(Boolean);
    (RNText as any).defaultProps.style = [
      ...prevStyle,
      { fontFamily: "HindSiliguri_400Regular" },
    ];

    // Set default font for TextInput
    (RNTextInput as any).defaultProps = (RNTextInput as any).defaultProps || {};
    const prevInputStyle = Array.isArray(
      (RNTextInput as any).defaultProps.style
    )
      ? (RNTextInput as any).defaultProps.style
      : [(RNTextInput as any).defaultProps.style].filter(Boolean);
    (RNTextInput as any).defaultProps.style = [
      ...prevInputStyle,
      { fontFamily: "HindSiliguri_400Regular" },
    ];

    SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={darkTheme}>
      <StatusBar
        hidden={true}
        backgroundColor="transparent"
        translucent
      />
      <View style={{ flex: 1, backgroundColor: darkTheme.colors.background }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: darkTheme.colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(system)" options={{ headerShown: false }} />
        </Stack>
        <LanguageSwitcher />
      </View>
    </ThemeProvider>
  );
}
