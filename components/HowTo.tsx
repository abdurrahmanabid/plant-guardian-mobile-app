import { icons } from "@/src/constants/icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, FlatList, Image, NativeScrollEvent, NativeSyntheticEvent, Pressable, Text, View } from "react-native";

export default function HowTo() {
  const { t } = useTranslation(["howTo"]);
  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = 20 * 2; // px-5 on container (5 * 4 = 20 each side)
  const cardWidth = screenWidth - horizontalPadding;
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => ([
    { title: "mode_1_title", subtitle: "mode_1_subtitle", steps: "mode_1_steps", footer: "mode_1_footer", button: "mode_1_button" ,onPress: () => router.push("/(system)/LeafPredict")},
    { title: "mode_2_title", subtitle: "mode_2_subtitle", steps: "mode_2_steps", footer: "mode_2_footer", button: "mode_2_button" ,onPress: () => router.push("/(system)/SoilPredict")},
    { title: "mode_3_title", subtitle: "mode_3_subtitle", steps: "mode_3_steps", footer: "mode_3_footer", button: "mode_3_button" ,onPress: () => router.push({ pathname: '/(system)/LeafPredict', params: { type: 'all' } })},
  ]), []);

  const renderMode = (
    titleKey: string,
    subtitleKey: string,
    stepsKey: string,
    footerKey: string,
    buttonKey: string,
    leadingIcon?: any,
    onPress?: () => void
  ) => {
    const steps = t(`howTo:${stepsKey}`, { returnObjects: true }) as string[];
    return (
      <View className="bg-[#0F0D23] rounded-2xl p-5 border border-[#0F0D23]" style={{ width: cardWidth }}>
        <View className="flex-row items-center">
          {leadingIcon ? (
            <View className="w-14 h-14 rounded-2xl items-center justify-center mr-3" style={{ backgroundColor: "#1a1930", borderColor: "rgba(168,181,219,0.25)", borderWidth: 1, elevation: 4 }}>
              <Image source={leadingIcon} className="w-7 h-7" style={{ tintColor: "#A8B5DB" }} />
            </View>
          ) : null}
          <Text className="text-white text-xl" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t(`howTo:${titleKey}`)}</Text>
        </View>
        <Text className="text-slate-300 mt-1" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t(`howTo:${subtitleKey}`)}</Text>
        <View className="mt-3">
          {steps.map((s, idx) => (
            <Text key={idx} className="text-slate-300 mt-1" style={{ fontFamily: "HindSiliguri_400Regular" }}>{`• ${s}`}</Text>
          ))}
        </View>
        <Text className="text-slate-400 mt-3" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t(`howTo:${footerKey}`)}</Text>
        <Pressable className="mt-4 px-4 py-3 rounded-xl self-start" style={{ backgroundColor: "#1a1930" }} onPress={onPress}>
          <Text className="text-white" style={{ fontFamily: "HindSiliguri_500Medium" }}>{t(`howTo:${buttonKey}`)}</Text>
        </Pressable>
      </View>
    );
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (cardWidth + 12)); // 12 from separator width (w-3)
    if (index !== activeIndex) setActiveIndex(index);
  };

  return (
    <View className="px-5 mt-8">
      <Text className="text-white text-lg" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t("howTo:how_to_use")}</Text>
      <Text className="text-slate-400 mt-1" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t("howTo:how_to_use_desc")}</Text>

      <View className="mt-4" style={{ position: "relative" }}>
        <FlatList
          data={items}
          keyExtractor={(_, i) => `howto-${i}`}
          horizontal
          pagingEnabled
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="w-3" />}
          renderItem={({ item, index }) => (
            renderMode(
              item.title,
              item.subtitle,
              item.steps,
              item.footer,
              item.button,
              index === 0 ? icons.play : index === 1 ? icons.search : icons.star,
              item.onPress
            )
          )}
        />

        <View className="absolute left-0 top-1/2 -mt-4" pointerEvents="none">
          <Image source={icons.arrow} className="w-6 h-6 opacity-60" style={{ transform: [{ rotate: "180deg" }] }} />
        </View>
        <View className="absolute right-0 top-1/2 -mt-4" pointerEvents="none">
          <Image source={icons.arrow} className="w-6 h-6 opacity-60" />
        </View>
      </View>

      <View className="flex-row justify-center mt-3">
        {items.map((_, i) => (
          <View
            key={`dot-${i}`}
            className="h-1.5 rounded-full mx-1"
            style={{ width: i === activeIndex ? 16 : 6, backgroundColor: i === activeIndex ? "#A8B5DB" : "#3a3953" }}
          />
        ))}
      </View>
    </View>
  );
}


