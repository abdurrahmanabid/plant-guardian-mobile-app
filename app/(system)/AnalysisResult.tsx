import ThemedAlert from "@/components/ThemedAlert";
import api from "@/hooks/api";
import { images } from "@/src/constants/images";
import i18n from "@/src/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, BackHandler, Image, Pressable, ScrollView, Text, View } from "react-native";

export default function AnalysisResult() {
  const { t } = useTranslation(["soilInput", "leafPredict", "soil-result"]);
  const router = useRouter();
  const params = useLocalSearchParams<{
    disease?: string; confidence?: string; image?: string;
    care?: string; medicine?: string; fertilizer?: string;
    form?: string; error?: string;
  }>();
  const endpoits = ['/soil-model/save', '/soil-and-image-model/save']
  const disease = params.disease || '';
  const confidence = params.confidence ? Number(params.confidence) : undefined;
  const image = params.image || '';
  const care = params.care || '';
  const medicine = params.medicine || '';
  const fertilizer = params.fertilizer || '';
  const error = params.error || '';
  const formData = useMemo(() => {
    try { return params.form ? JSON.parse(params.form as string) : null; } catch { return null; }
  }, [params.form]);
  console.log('formData in AnalysisResult', params);
  const data = formData ? {
    ...formData,
    crop: formData.crop ? t(`soilInput:crops.${formData.crop}`) : formData.crop,
    soilColor: formData.soilColor ? t(`soilInput:soilColors.${formData.soilColor}`) : formData.soilColor
  } : null;
  const diseaseLabel = disease && formData?.crop ? t(`soilInput:diseases.${formData.crop}.${disease}`) : disease;
  const [isLoading, setIsLoading] = useState(false);
  const [gptText, setGptText] = useState<string>("");
  const [gptErr, setGptErr] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [saved, setSaved] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const prettyLabel = (label?: string) => {
    if (!label) return '-';
    return label.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  };

  const onExplain = async () => {
    setIsLoading(true);
    setGptErr("");
    try {
      const isBengali = i18n.language === 'bn';
      const req = {
        content: `Analyze soil and leaf result. Disease: ${diseaseLabel || disease}. Confidence: ${confidence ?? 'N/A'}. Fertilizer: ${fertilizer || 'N/A'}. Treatment: ${care} | ${medicine}. Soil Form: ${JSON.stringify(data || {})}`,
        systemMessage: `You're an agriculture expert. Explain simply for farmers. in json {whyFertilizer, benefit, tips, ${care || medicine ? 'whyTreatment' : ''}} provide in ${isBengali ? 'bangla' : 'english'}`,
      };
      const res = await api.post('gpt/gpt-explain', req);
      const parsed = JSON.parse(res?.data?.response || '{}');
      const { whyFertilizer, benefit, tips, whyTreatment } = parsed || {};
      const out = `${whyFertilizer ? `${t('soil-result:results.explainedFields.whyFertilizer')}:\n${whyFertilizer}\n\n` : ''}${whyTreatment ? `${t('soil-result:results.explainedFields.whyTreatment')}:\n${whyTreatment}\n\n` : ''}${benefit ? `${t('soil-result:results.explainedFields.benefit')}:\n${benefit}\n\n` : ''}${tips ? `${t('soil-result:results.explainedFields.tips')}:\n${tips}` : ''}`.trim();
      setGptText(out || '');
    } catch (e) {
      setGptErr(t('soil-result:gptError.failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const onSave = async () => {
    setSaveMsg("");
    setSaveErr("");
    setSaving(true);
    try {
      // common validation
      if (!formData) {
        const msg = t('soil-result:save.missingSoilForm');
        setSaveErr(msg);
        setAlertTitle(t('common:error'));
        setAlertMessage(msg);
        setAlertVisible(true);
        return;
      }

      // choose endpoint by image presence
      const hasImage = !!image && String(image).trim().length > 0;
      if (hasImage) {
        // POST /api/soil-and-image-model/save
        const payload = {
          temperature: formData.temperature,
          phLevel: formData.ph,
          soilColor: formData.soilColor,
          rainfall: formData.rainfall,
          nitrogen: formData.nitrogen,
          phosphorous: formData.phosphorus,
          confidence: params.confidence,
          potassium: formData.potassium,
          cropType: formData.crop,
          diseaseDetected: disease,
          imageUrl: image,
          recommendedFertilizer: fertilizer,
          treatmentSuggestion: [care, medicine].filter(Boolean).join(' | ') || undefined,
        };
        const res = await api.post(endpoits[1], payload, { withCredentials: true });
        await AsyncStorage.removeItem('imagePath');
        if (res?.data?.success) {
          const msg = t('soil-result:save.savedSoilImage');
          setSaveMsg(msg);
          setSaved(true);
          setAlertTitle(t('common:success'));
          setAlertMessage(msg);
          setAlertVisible(true);
        } else {
          const msg = t('soil-result:save.failed');
          setSaveErr(msg);
          setAlertTitle(t('common:error'));
          setAlertMessage(msg);
          setAlertVisible(true);
        }
      } else {
        // POST /api/soil-model/save
        const payload = {
          temperature: formData.temperature,
          phLevel: formData.ph,
          soilColor: formData.soilColor,
          rainfall: formData.rainfall,
          nitrogen: formData.nitrogen,
          phosphorous: formData.phosphorus,
          potassium: formData.potassium,
          cropType: formData.crop,
          predictedFertilizer: fertilizer,
          predictedTreatment: [care, medicine].filter(Boolean).join(' | ') || undefined,
          confidence: typeof confidence === 'number' ? confidence : undefined,
        };
        const res = await api.post(endpoits[0], payload, { withCredentials: true });
        await AsyncStorage.removeItem('imagePath');
        if (res?.data?.success) {
          const msg = t('soil-result:save.savedSoilOnly');
          setSaveMsg(msg);
          setSaved(true);
          setAlertTitle(t('common:success'));
          setAlertMessage(msg);
          setAlertVisible(true);
        } else {
          const msg = t('soil-result:save.failed');
          setSaveErr(msg);
          setAlertTitle(t('common:error'));
          setAlertMessage(msg);
          setAlertVisible(true);
        }
      }
    } catch (e) {
      const msg = (e instanceof Error && e.message) || t('soil-result:save.failed');
      setSaveErr(msg);
      setAlertTitle(t('common:error'));
      setAlertMessage(msg);
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  };

  // Android hardware back should take user directly to /(tabs)
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      router.replace('/(tabs)');
      return true;
    });
    return () => sub.remove();
  }, [router]);

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" resizeMode="cover" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-5">
        <View className="mt-16 mb-6">
          <Text className="text-white text-2xl font-semibold" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t('soil-result:title')}</Text>
          <Text className="text-slate-300 mt-2" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t('soil-result:subtitle')}</Text>
        </View>

        <View className="grid gap-4">
          {error ? (
            <View className="rounded-2xl p-4 border border-red-400/20" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
              <Text className="text-red-300 text-lg">{error}</Text>
            </View>
          ) : (
            <>
              {disease && (
                <View className="rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
                  <Text className="text-white/70 text-xs">{t('soil-result:results.disease')}</Text>
                  <Text className="text-white text-xl mt-1">{prettyLabel(diseaseLabel || disease)}</Text>
                  {typeof confidence === 'number' && (
                    <Text className="text-white/80 text-sm">{t('soil-result:results.confidenceLabel')}: {Math.round(confidence * 100)}%</Text>
                  )}
                </View>
              )}
            </>
          )}

          {!error && (
            <View className="rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
              <Text className="text-white/70 text-xs">{t('soil-result:results.fertilizerLabel')}</Text>
              <Text className="text-white text-xl mt-1">{fertilizer || t('soil-result:results.noRecommendation')}</Text>
            </View>
          )}

          {(care || medicine) && (
            <View className="rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
              <Text className="text-white/70 text-xs">{t('soil-result:results.treatmentLabel')}</Text>
              {!!care && <Text className="text-white/90 mt-1">{t('soil-result:results.explainedFields.care')}: {care}</Text>}
              {!!medicine && <Text className="text-white/90 mt-1">{t('soil-result:results.explainedFields.medicine')}: {medicine}</Text>}
            </View>
          )}

          {data && (
            <View className="rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
              <Text className="text-white text-lg" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('soil-result:inputData.title')}</Text>
              <View className="flex-row flex-wrap gap-2 mt-3">
                {Object.entries(data).map(([k, v]) => (
                  v ? (
                    <View key={k} className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t(`soil-result:fields.${k}`) || k}</Text>
                      <Text className="text-white text-sm mt-1">{String(v)}</Text>
                    </View>
                  ) : null
                ))}
              </View>
            </View>
          )}

          <View className="rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
            <Pressable disabled={isLoading} onPress={onExplain} className="px-4 py-3 rounded-xl items-center" style={{ backgroundColor: isLoading ? '#3a3953' : '#A8B5DB' }}>
              {isLoading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="#0F0D23" size="small" />
                  <Text className="text-primary ml-2" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('soil-result:buttons.generating')}</Text>
                </View>
              ) : (
                <Text className="text-primary" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('soil-result:buttons.gptDetails')}</Text>
              )}
            </Pressable>
            {gptErr ? (
              <Text className="text-red-300 mt-3">{gptErr}</Text>
            ) : null}
            {gptText ? (
              <Text className="text-white mt-3 whitespace-pre-wrap">{gptText}</Text>
            ) : null}
          </View>

          {!saved && (
            <View className="rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
              <Pressable disabled={saving} onPress={onSave} className="px-4 py-3 rounded-xl items-center" style={{ backgroundColor: saving ? '#3a3953' : '#93C5FD' }}>
                {saving ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator color="#0F0D23" size="small" />
                    <Text className="text-primary ml-2" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('soil-result:buttons.saving')}</Text>
                  </View>
                ) : (
                  <Text className="text-primary" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('soil-result:buttons.save')}</Text>
                )}
              </Pressable>
            </View>
          )}

          <View className="rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
            <Pressable onPress={() => router.push('/(system)/SoilPredict')} className="px-4 py-3 rounded-xl items-center" style={{ backgroundColor: '#A8B5DB' }}>
              <Text className="text-primary" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('soil-result:buttons.newAnalysis')}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <ThemedAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        confirmText={t('common:ok')}
      />
    </View>
  );
}


