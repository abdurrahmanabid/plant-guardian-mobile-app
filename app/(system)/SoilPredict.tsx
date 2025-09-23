import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import ThemedAlert from "@/components/ThemedAlert";
import { images } from "@/src/constants/images";

type SoilColorKey = "Black" | "Red" | "Dark Brown" | "Reddish Brown";
type CropKey = "Apple" | "Corn" | "Grape" | "Mango" | "Orange" | "Pepper" | "Potato" | "Rice" | "Tomato";

export default function SoilPrediction() {
  const { t } = useTranslation(["soilInput"]);

  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [ph, setPh] = useState("");
  const [temperature, setTemperature] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [soilColor, setSoilColor] = useState<SoilColorKey | "">("");
  const [crop, setCrop] = useState<CropKey | "">("");
  const [disease, setDisease] = useState<string | "">("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const soilColorOptions = useMemo(
    () => (["Black", "Red", "Dark Brown", "Reddish Brown"]) as SoilColorKey[],
    []
  );
  const cropOptions = useMemo(
    () => (["Apple", "Corn", "Grape", "Mango", "Orange", "Pepper", "Potato", "Rice", "Tomato"]) as CropKey[],
    []
  );

  const diseaseOptions = useMemo(() => {
    if (!crop) return [] as string[];
    const dict = t(`soilInput:diseases.${crop}`, { returnObjects: true }) as Record<string, string>;
    return Object.keys(dict || {});
  }, [crop, t]);

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" resizeMode="cover" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-5">
        <View className="mt-16 mb-6">
          <Text className="text-white text-2xl font-semibold" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t("soilInput:title")}</Text>
          <Text className="text-slate-300 mt-2" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t("soilInput:subtitle")}</Text>
        </View>

        <View className="bg-[#0F0D23] rounded-2xl p-4 border border-[#0F0D23]">
          <FieldLabelWithInfo
            title={t("soilInput:nitrogen")!}
            desc={t("soilInput:nitrogenDesc")!}
            onInfo={() => showAlert(t("soilInput:whyImportant")!, t("soilInput:nitrogenImportance")!)}
          />
          <TextInput
            value={nitrogen}
            onChangeText={setNitrogen}
            keyboardType="numeric"
            className="mt-2 bg-[#1a1930] text-white px-4 py-3 rounded-xl"
            placeholderTextColor="#9aa4bf"
          />

          <View className="h-4" />
          <FieldLabelWithInfo
            title={t("soilInput:phosphorus")!}
            desc={t("soilInput:phosphorusDesc")!}
            onInfo={() => showAlert(t("soilInput:whyImportant")!, t("soilInput:phosphorusImportance")!)}
          />
          <TextInput
            value={phosphorus}
            onChangeText={setPhosphorus}
            keyboardType="numeric"
            className="mt-2 bg-[#1a1930] text-white px-4 py-3 rounded-xl"
            placeholderTextColor="#9aa4bf"
          />

          <View className="h-4" />
          <FieldLabelWithInfo
            title={t("soilInput:potassium")!}
            desc={t("soilInput:potassiumDesc")!}
            onInfo={() => showAlert(t("soilInput:whyImportant")!, t("soilInput:potassiumImportance")!)}
          />
          <TextInput
            value={potassium}
            onChangeText={setPotassium}
            keyboardType="numeric"
            className="mt-2 bg-[#1a1930] text-white px-4 py-3 rounded-xl"
            placeholderTextColor="#9aa4bf"
          />

          <View className="h-4" />
          <FieldLabelWithInfo
            title={t("soilInput:ph")!}
            desc={t("soilInput:phDesc")!}
            onInfo={() => showAlert(t("soilInput:whyImportant")!, t("soilInput:soilColorImportance")!)}
          />
          <TextInput
            value={ph}
            onChangeText={setPh}
            keyboardType="numeric"
            className="mt-2 bg-[#1a1930] text-white px-4 py-3 rounded-xl"
            placeholderTextColor="#9aa4bf"
          />

          <View className="h-4" />
          <FieldLabelWithInfo
            title={t("soilInput:temperature")!}
            desc={t("soilInput:temperatureDesc")!}
            onInfo={() => showAlert(t("soilInput:whyImportant")!, t("soilInput:temperatureImportance")!)}
          />
          <TextInput
            value={temperature}
            onChangeText={setTemperature}
            placeholder={t("soilInput:temperaturePlaceholder")!}
            keyboardType="numeric"
            className="mt-2 bg-[#1a1930] text-white px-4 py-3 rounded-xl"
            placeholderTextColor="#9aa4bf"
          />

          <View className="h-4" />
          <FieldLabelWithInfo
            title={t("soilInput:rainfall")!}
            desc={t("soilInput:rainfallDesc")!}
            onInfo={() => showAlert(t("soilInput:whyImportant")!, t("soilInput:rainfallImportance")!)}
          />
          <TextInput
            value={rainfall}
            onChangeText={setRainfall}
            placeholder={t("soilInput:rainfallPlaceholder")!}
            keyboardType="numeric"
            className="mt-2 bg-[#1a1930] text-white px-4 py-3 rounded-xl"
            placeholderTextColor="#9aa4bf"
          />

          <View className="h-4" />
          <FieldLabelWithInfo
            title={t("soilInput:soilColor")!}
            desc={t("soilInput:soilColorDesc")!}
            onInfo={() => showAlert(t("soilInput:whyImportant")!, t("soilInput:soilColorImportance")!)}
          />
          <PickerRow
            options={soilColorOptions}
            value={soilColor}
            onChange={setSoilColor as any}
            renderLabel={(key) => t(`soilInput:soilColors.${key}`)}
          />

          <View className="h-4" />
          <FieldLabelWithInfo
            title={t("soilInput:crop")!}
            desc={t("soilInput:cropDesc")!}
            onInfo={() => showAlert(t("soilInput:whyImportant")!, t("soilInput:cropImportance")!)}
          />
          <PickerRow
            options={cropOptions}
            value={crop}
            onChange={setCrop as any}
            renderLabel={(key) => t(`soilInput:crops.${key}`)}
          />

          <View className="h-4" />
          <FieldLabelWithInfo
            title={t("soilInput:disease")!}
            desc={t("soilInput:diseaseDesc")!}
            onInfo={() => showAlert(t("soilInput:whyImportant")!, t("soilInput:diseaseImportance")!)}
          />
          <PickerRow
            options={diseaseOptions}
            value={disease}
            onChange={setDisease}
            renderLabel={(key) => t(`soilInput:diseases.${crop}.${key}`)}
            disabled={!crop}
          />

          <Pressable className="mt-6 px-4 py-3 rounded-xl self-stretch items-center" style={{ backgroundColor: "#A8B5DB" }}>
            <Text className="text-primary text-base" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t("soilInput:submitForm")}</Text>
          </Pressable>
        </View>

        <View className="mt-8">
          <Text className="text-white text-lg" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t("soilInput:fieldPreview")}</Text>
          <Text className="text-slate-400 mt-2" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t("soilInput:selectFieldDesc")}</Text>
        </View>
      </ScrollView>
      <ThemedAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}


function FieldLabelWithInfo({ title, desc, onInfo }: { title: string; desc: string; onInfo: () => void }) {
  return (
    <View>
      <View className="flex-row items-center">
        <Text className="text-white text-base" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{title}</Text>
        <Pressable onPress={onInfo} className="ml-2 px-2 rounded-full">
          <Image source={images.info} className="w-3 h-3"/>
        </Pressable>
      </View>
      <Text className="text-slate-400 mt-1" style={{ fontFamily: "HindSiliguri_400Regular" }}>{desc}</Text>
    </View>
  );
}

function PickerRow<T extends string>({ options, value, onChange, renderLabel, disabled }: {
  options: readonly T[] | T[];
  value: T | "";
  onChange: (val: T) => void;
  renderLabel: (key: T) => string;
  disabled?: boolean;
}) {
  return (
    <View className="flex-row flex-wrap gap-2 mt-2">
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <Pressable
            key={opt as string}
            disabled={disabled}
            onPress={() => onChange(opt as T)}
            className="px-3 py-2 rounded-xl"
            style={{ backgroundColor: selected ? "#A8B5DB" : "#1a1930", opacity: disabled ? 0.5 : 1 }}
          >
            <Text className={selected ? "text-primary" : "text-white"} style={{ fontFamily: "HindSiliguri_500Medium" }}>
              {renderLabel(opt as T)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}


