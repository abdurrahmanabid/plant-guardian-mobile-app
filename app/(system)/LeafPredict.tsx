import * as ImagePicker from "expo-image-picker";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";

import { images } from "@/src/constants/images";

const MAX_MB = 8;
const MAX_BYTES = MAX_MB * 1024 * 1024;

export default function LeafPredict() {
  const { t } = useTranslation(["leafPredict"]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow media access.");
      return false;
    }
    return true;
  }, []);

  const requestCameraPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow camera access.");
      return false;
    }
    return true;
  }, []);

  const handlePick = useCallback(async () => {
    const ok = await requestPermissions();
    if (!ok) return;
    try {
      setIsPicking(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });
      if (!result.canceled) {
        const asset = result.assets?.[0];
        if (asset?.uri) {
          if (asset.fileSize && asset.fileSize > MAX_BYTES) {
            Alert.alert(t("leafPredict:errSize", { mb: MAX_MB }));
            return;
          }
          setImageUri(asset.uri);
        }
      }
    } catch (e) {
      Alert.alert(t("leafPredict:errUnknown"));
    } finally {
      setIsPicking(false);
    }
  }, [requestPermissions, t]);

  const handleCapture = useCallback(async () => {
    const ok = await requestCameraPermissions();
    if (!ok) return;
    try {
      setIsPicking(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });
      if (!result.canceled) {
        const asset = result.assets?.[0];
        if (asset?.uri) {
          if (asset.fileSize && asset.fileSize > MAX_BYTES) {
            Alert.alert(t("leafPredict:errSize", { mb: MAX_MB }));
            return;
          }
          setImageUri(asset.uri);
        }
      }
    } catch (e) {
      Alert.alert(t("leafPredict:errUnknown"));
    } finally {
      setIsPicking(false);
    }
  }, [requestCameraPermissions, t]);

  const header = useMemo(() => (
    <View className="mt-16 mb-6">
      <Text className="text-white text-2xl font-semibold" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t("leafPredict:title")}</Text>
      <Text className="text-slate-300 mt-2" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t("leafPredict:subtitle")}</Text>
    </View>
  ), [t]);

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" resizeMode="cover" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-5">
        {header}

        <View className="bg-[#0F0D23] rounded-2xl p-4 border border-[#0F0D23]">
          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} className="w-full h-72 rounded-xl" resizeMode="cover" />
              <View className="flex-row mt-4 gap-x-3">
                <Pressable disabled={isPicking} onPress={handlePick} className="flex-1 px-4 py-3 rounded-xl" style={{ backgroundColor: "#1a1930" }}>
                  <Text className="text-white text-center" style={{ fontFamily: "HindSiliguri_500Medium" }}>{t("leafPredict:replace")}</Text>
                </Pressable>
                <Pressable disabled={isPicking} onPress={handleCapture} className="px-4 py-3 rounded-xl" style={{ backgroundColor: "#1a1930" }}>
                  <Text className="text-white" style={{ fontFamily: "HindSiliguri_500Medium" }}>📷</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View className="items-center justify-center py-10">
              <Text className="text-slate-200 text-base" style={{ fontFamily: "HindSiliguri_500Medium" }}>{t("leafPredict:dropTitle")}</Text>
              <Text className="text-slate-400 mt-2" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t("leafPredict:dropHelp")}</Text>
              <Pressable disabled={isPicking} onPress={handlePick} className="mt-5 px-4 py-3 rounded-xl" style={{ backgroundColor: "#1a1930" }}>
                <Text className="text-white" style={{ fontFamily: "HindSiliguri_500Medium" }}>{t("leafPredict:browseBtn")}</Text>
              </Pressable>
              <Pressable disabled={isPicking} onPress={handleCapture} className="mt-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "#1a1930" }}>
                <Text className="text-white" style={{ fontFamily: "HindSiliguri_500Medium" }}>📷 {"Camera"}</Text>
              </Pressable>
              <Text className="text-slate-400 mt-3" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t("leafPredict:hint", { mb: MAX_MB })}</Text>
            </View>
          )}
        </View>

        <Pressable disabled={!imageUri} className="mt-6 px-4 py-3 rounded-xl self-stretch items-center" style={{ backgroundColor: imageUri ? "#A8B5DB" : "#3a3953" }}>
          <Text className="text-primary text-base" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t("leafPredict:predictBtn")}</Text>
        </Pressable>

        <View className="mt-8">
          <Text className="text-white text-lg" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t("leafPredict:results")}</Text>
          <Text className="text-slate-400 mt-2" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t("leafPredict:noResult")}</Text>
        </View>
      </ScrollView>
    </View>
  );
}


