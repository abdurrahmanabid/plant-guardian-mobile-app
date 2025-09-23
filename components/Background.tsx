import { images } from "@/src/constants/images";
import React from "react";
import { Image, View } from "react-native";
interface BackgroundProps {
  children: React.ReactNode;
}
const Background = ({ children }: BackgroundProps) => {
  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />
      <View className="p-4">{children}</View>
    </View>
  );
};

export default Background;
