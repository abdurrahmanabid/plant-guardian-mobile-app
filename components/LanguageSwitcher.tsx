import i18n from "@/src/i18n";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    const onChange = (l: string) => setLang(l);
    i18n.on("languageChanged", onChange);
    return () => {
      i18n.off("languageChanged", onChange);
    };
  }, []);

  const baseLang = (lang || "").split("-")[0];
  const isEn = baseLang === "en";
  const isBn = baseLang === "bn";
  return (
    <View
      style={{ position: "absolute", right: 12, top: 12, zIndex: 50 }}
      pointerEvents="box-none"
    >
      <View
        className="flex-row items-center rounded-full"
        style={{
          backgroundColor: "rgba(15,13,35,0.88)",
          borderColor: "rgba(168,181,219,0.25)",
          borderWidth: 1,
          paddingHorizontal: 6,
          paddingVertical: 4,
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 8,
        }}
      >
        <View style={{ position: "relative", alignItems: "center" }}>
          {isEn ? (
            <View style={{ position: "absolute", top: -4, width: 12, height: 3, borderRadius: 2, backgroundColor: "#1E90FF" }} />
          ) : null}
          <Pressable
            onPress={() => i18n.changeLanguage("en")}
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: isEn ? "#1E90FF" : "transparent",
              borderWidth: isEn ? 1 : 0,
              borderColor: isEn ? "#1E90FF" : "transparent",
            }}
          >
            <Text style={{ color: isEn ? "#0F0D23" : "#A8B5DB", fontSize: 11, fontWeight: "700" }}>EN</Text>
          </Pressable>
        </View>
        <View style={{ width: 1, height: 14, backgroundColor: "rgba(168,181,219,0.25)", marginHorizontal: 4 }} />
        <View style={{ position: "relative", alignItems: "center" }}>
          {isBn ? (
            <View style={{ position: "absolute", top: -4, width: 12, height: 3, borderRadius: 2, backgroundColor: "#1E90FF" }} />
          ) : null}
          <Pressable
            onPress={() => i18n.changeLanguage("bn")}
            className="px-3 py-1 rounded-full"
            style={{
              backgroundColor: isBn ? "#1E90FF" : "transparent",
              borderWidth: isBn ? 1 : 0,
              borderColor: isBn ? "#1E90FF" : "transparent",
            }}
          >
            <Text style={{ color: isBn ? "#0F0D23" : "#A8B5DB", fontSize: 11, fontWeight: "700" }}>BN</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}


