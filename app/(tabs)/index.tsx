import { icons } from "@/src/constants/icons";
import { images } from "@/src/constants/images";
import { useTranslation } from "react-i18next";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import Home from "@/components/Home";

export default function Index() {
  const { i18n } = useTranslation();
  const nextLang = i18n.language === "bn" ? "en" : "bn";
  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Image source={icons.logo} className="max-w-20 max-h-20 mt-20 mb-5 mx-auto" />
        <Home />
      </ScrollView>
      <Pressable onPress={() => i18n.changeLanguage(nextLang)} className="self-end mr-5 mb-3 px-3 py-1 rounded-full" style={{ backgroundColor: "#0F0D23" }}>
        <Text className="text-white text-sm">{nextLang.toUpperCase()}</Text>
      </Pressable>
    </View>
  );
}
