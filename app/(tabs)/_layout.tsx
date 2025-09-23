import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Image, ImageBackground, Text, View } from "react-native";

import { icons } from "@/src/constants/icons";
import { images } from "@/src/constants/images";

function TabIcon({ focused, icon, title }: any) {
  if (focused) {
    return (
      <ImageBackground
        source={images.highlight}
        className="flex flex-row w-full flex-1 min-w-[112px] min-h-14 mt-4 justify-center items-center rounded-full overflow-hidden"
      >
        <Image source={icon} tintColor="#151312" className="size-5" />
        <Text className="text-secondary text-base font-semibold ml-2" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>
          {title}
        </Text>
      </ImageBackground>
    );
  }

  return (
    <View className="size-full justify-center items-center mt-4 rounded-full">
      <Image source={icon} tintColor="#A8B5DB" className="size-5" />
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerTitleStyle: { fontFamily: "HindSiliguri_600SemiBold" },
        tabBarLabelStyle: { fontFamily: "HindSiliguri_500Medium" },
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#0F0D23",
          borderRadius: 50,
          marginHorizontal: 20,
          marginBottom: 36,
          height: 52,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#0F0D23",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title={t("home")} />
          ),
        }}
      />

      <Tabs.Screen
        name="Search"
        options={{
          title: t("search"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title={t("search")} />
          ),
        }}
      />

      <Tabs.Screen
        name="Saved"
        options={{
          title: t("saved"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.save} title={t("saved")} />
          ),
        }}
      />

      <Tabs.Screen
        name="Profile"
        options={{
          title: t("profile"),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title={t("profile")} />
          ),
        }}
      />
    </Tabs>
  );
}
