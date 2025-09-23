import {
  HindSiliguri_400Regular,
  HindSiliguri_500Medium,
  HindSiliguri_600SemiBold,
  HindSiliguri_700Bold,
} from "@expo-google-fonts/hind-siliguri";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Text as RNText, TextInput as RNTextInput, StatusBar } from "react-native";
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

  useEffect(() => {
    if (!fontsLoaded) return;
    (RNText as any).defaultProps = (RNText as any).defaultProps || {};
    const prevStyle = Array.isArray((RNText as any).defaultProps.style)
      ? (RNText as any).defaultProps.style
      : [(RNText as any).defaultProps.style].filter(Boolean);
    (RNText as any).defaultProps.style = [
      ...prevStyle,
      { fontFamily: "HindSiliguri_400Regular" },
    ];

    (RNTextInput as any).defaultProps = (RNTextInput as any).defaultProps || {};
    const prevInputStyle = Array.isArray((RNTextInput as any).defaultProps.style)
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
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(system)" options={{ headerShown: false }} />
      </Stack></>
  );
}
