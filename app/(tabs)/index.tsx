import { icons } from "@/src/constants/icons";
import { images } from "@/src/constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

import Home from "@/components/Home";
import HowTo from "@/components/HowTo";
import { api } from "@/hooks";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Index() {
  const { t } = useTranslation(["home", "saved", "search"]);
  const router = useRouter();
  const [imagePath, setImagePath] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      const path = await AsyncStorage.getItem('imagePath');
      console.log('path', path);
      setImagePath(path);
    })();
  }, []);
  if (imagePath) {
    api.delete('/predict/delete-image', {
      data: {
        imageUrl: imagePath,
      },
    }).then(async (res) => {
      await AsyncStorage.removeItem('imagePath');
      console.log('res', res.status);
    }).finally(() => {
      setImagePath(null);
    }).catch((err) => {
      console.log('err', err);
    });
  }
  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 0 }} overScrollMode="never" bounces={false}>
        <Image source={icons.logo} className="max-w-20 max-h-20 mt-20 mb-5 mx-auto" />
        <Home />
        <HowTo />

        {/* Ads cards (after HowTo) */}
        <View className="px-5 mt-6">
          <View className="rounded-2xl p-4 mb-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
            <Text className="text-white text-lg" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('home:ads.saved.title')}</Text>
            <Text className="text-white/70 mt-1" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('home:ads.saved.subtitle')}</Text>
            <Pressable onPress={() => router.push('/(tabs)/Saved')} className="mt-3 px-4 py-3 rounded-xl items-center" style={{ backgroundColor: '#93C5FD' }}>
              <Text className="text-primary" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('home:ads.saved.cta')}</Text>
            </Pressable>
          </View>

          <View className="rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
            <Text className="text-white text-lg" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('home:ads.search.title')}</Text>
            <Text className="text-white/70 mt-1" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('home:ads.search.subtitle')}</Text>
            <Pressable onPress={() => router.push('/(tabs)/Search')} className="mt-3 px-4 py-3 rounded-xl items-center" style={{ backgroundColor: '#A8B5DB' }}>
              <Text className="text-primary" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('home:ads.search.cta')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
