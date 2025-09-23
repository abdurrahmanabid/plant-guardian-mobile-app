import { icons } from "@/src/constants/icons";
import { images } from "@/src/constants/images";
import { Image, ScrollView, View } from "react-native";

import Home from "@/components/Home";
import HowTo from "@/components/HowTo";

export default function Index() {
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
        <HowTo />
      </ScrollView>
    </View>
  );
}
