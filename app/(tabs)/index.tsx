import { icons } from "@/src/constants/icons";
import { images } from "@/src/constants/images";
import { Image, View } from "react-native";
 
export default function Index() {
  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />
      <Image source={icons.logo} className="w-20 h-20 mt-20 mb-5 mx-auto" />
    </View>
  );
}
