import { icons } from "@/src/constants/icons";
import { images } from "@/src/constants/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image, ScrollView, View } from "react-native";

import Home from "@/components/Home";
import HowTo from "@/components/HowTo";
import { api } from "@/hooks";
import { useEffect, useState } from "react";

export default function Index() {
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
      <ScrollView contentContainerStyle={{ paddingBottom: 0 }}>
        <Image source={icons.logo} className="max-w-20 max-h-20 mt-20 mb-5 mx-auto" />
        <Home />
        <HowTo />
      </ScrollView>
    </View>
  );
}
