import ThemedAlert from "@/components/ThemedAlert";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";

import api from "@/hooks/api";
import { images } from "@/src/constants/images";
import i18n from "@/src/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MAX_MB = 8;
const MAX_BYTES = MAX_MB * 1024 * 1024;

type PredictUI = {
  top: { label: string; confidence?: number };
  treatment: { care: string | null; medicine: string | null; raw: string | null };
};

export default function LeafPredict() {
  const { t } = useTranslation(["leafPredict", "soil-result"]);
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type?: string }>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [serverImagePath, setServerImagePath] = useState<string | null>(null);
  const [isPicking, setIsPicking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [result, setResult] = useState<PredictUI | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [gptErr, setGptErr] = useState<string>("");
  const [gptText, setGptText] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const requestPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow media access.");
      return false;
    }
    return true;
  }, []);

  const requestCameraPermissions = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please allow camera access.");
      return false;
    }
    return true;
  }, []);

  const handlePick = useCallback(async () => {
    const ok = await requestPermissions();
    if (!ok) return;
    try {
      setIsPicking(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });
      if (!result.canceled) {
        const asset = result.assets?.[0];
        if (asset?.uri) {
          if (asset.fileSize && asset.fileSize > MAX_BYTES) {
            Alert.alert(t("leafPredict:errSize", { mb: MAX_MB }));
            return;
          }
          setImageUri(asset.uri);
          setResult(null);
          setError(null);
        }
      }
    } catch (e) {
      Alert.alert(t("leafPredict:errUnknown"));
    } finally {
      setIsPicking(false);
    }
  }, [requestPermissions, t]);

  const handleCapture = useCallback(async () => {
    const ok = await requestCameraPermissions();
    if (!ok) return;
    try {
      setIsPicking(true);
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });
      if (!result.canceled) {
        const asset = result.assets?.[0];
        if (asset?.uri) {
          if (asset.fileSize && asset.fileSize > MAX_BYTES) {
            Alert.alert(t("leafPredict:errSize", { mb: MAX_MB }));
            return;
          }
          setImageUri(asset.uri);
          setResult(null);
          setError(null);
        }
      }
    } catch (e) {
      Alert.alert(t("leafPredict:errUnknown"));
    } finally {
      setIsPicking(false);
    }
  }, [requestCameraPermissions, t]);

  const header = useMemo(() => (
    <View className="mt-16 mb-6">
      <Text className="text-white text-2xl font-semibold" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t("leafPredict:title")}</Text>
      <Text className="text-slate-300 mt-2" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t("leafPredict:subtitle")}</Text>
    </View>
  ), [t]);

  // ---- map backend → UI shape (parity with web) ----
  function mapApiToUI(apiPayload: any): PredictUI {
    const d = apiPayload?.data ?? apiPayload ?? {};
    const prediction: string = d.prediction ?? d.label ?? d.top?.label ?? "-";
    const confidence: number | undefined =
      typeof d.confidence === "number"
        ? d.confidence
        : typeof d.top?.confidence === "number"
          ? d.top.confidence
          : undefined;

    const treatmentRaw: string | null = d.treatment ?? null;
    let care: string | null = null;
    let medicine: string | null = null;

    if (typeof treatmentRaw === "string") {
      treatmentRaw
        .split("|")
        .map((s: string) => s.trim())
        .forEach((part: string) => {
          if (/^care\s*:/i.test(part)) {
            care = part.replace(/^care\s*:/i, "").trim();
          } else if (/^medicine\s*:/i.test(part)) {
            medicine = part.replace(/^medicine\s*:/i, "").trim();
          }
        });
    }

    return {
      top: { label: prediction, confidence },
      treatment: { care, medicine, raw: treatmentRaw },
    };
  }

  const doPredict = useCallback(async () => {
    if (!imageUri) return;
    try {
      setLoading(true);
      setError(null);
      setUploadPct(0);

      // Build RN FormData
      const form = new FormData();
      const filename = imageUri.split('/').pop() || `leaf.jpg`;
      const match = /\.(\w+)$/.exec(filename || '');
      const ext = match?.[1]?.toLowerCase() || 'jpg';
      const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      const rnFile = { uri: imageUri, name: filename, type: mime } as any;
      form.append('file', rnFile);

      // 1) Upload
      const uploadRes = await api.post('/predict/leaf-upload', form as any, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: (d) => d,
        onUploadProgress: (evt) => {
          const total = (evt.total ?? 0) || 1;
          const pct = Math.round((evt.loaded / total) * 100);
          setUploadPct(pct);
        },
      });

      const imagePath = uploadRes?.data?.files?.path || uploadRes?.data?.data?.path || uploadRes?.data?.path;
      if (!imagePath) {
        throw new Error('Upload succeeded but image path is missing in response.');
      }
      setServerImagePath(imagePath);
      await AsyncStorage.setItem('imagePath', imagePath);

      // 2) Predict using uploaded path
      const predictRes = await api.post('/predict/image-predict', { imagePath });

      // 3) Map to UI
      const uiResult = mapApiToUI(predictRes?.data);
      if (!uiResult) {
        throw new Error('Prediction response was empty or malformed.');
      }
      setResult(uiResult);

      // If "all" flow is requested, jump to soil analysis screen with context
      if ((type || '').toString() === 'all') {
        setSubmitted(true);
        router.push({
          pathname: '/(system)/SoilPredict',
          params: {
            disease: uiResult.top.label || '',
            confidence: typeof uiResult.top.confidence === 'number' ? String(uiResult.top.confidence) : '',
            image: imagePath,
            care: uiResult.treatment.care || '',
            medicine: uiResult.treatment.medicine || '',
          }
        });
      }
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        (t('leafPredict:errUnknown') as string)
      );
    } finally {
      setLoading(false);
    }
  }, [imageUri, t, type, router, submitted]);

  const onExplain = useCallback(async () => {
    if (!result) return;
    setIsExplaining(true);
    setGptErr("");
    try {
      const crop = (result.top.label || '').split('___')[0] || '';
      const diseaseKey = result.top.label || '';
      const diseaseLabel = crop ? t(`soilInput:diseases.${crop}.${diseaseKey}`) : diseaseKey;
      const confidence = typeof result.top.confidence === 'number' ? result.top.confidence : undefined;
      const care = result.treatment.care || '';
      const medicine = result.treatment.medicine || '';
      const isBengali = i18n.language === 'bn';

      const req = {
        content: `Analyze leaf prediction result. Disease: ${diseaseLabel || diseaseKey}. Confidence: ${confidence ?? 'N/A'}. Treatment: ${care} | ${medicine}.`,
        systemMessage: `You're an agriculture expert. Explain simply for farmers. in json {benefit, tips, ${care || medicine ? 'whyTreatment' : ''}} provide in ${isBengali ? 'bangla' : 'english'}`,
      };
      const res = await api.post('gpt/gpt-explain', req);
      const parsed = JSON.parse(res?.data?.response || '{}');
      const { benefit, tips, whyTreatment } = parsed || {};
      const out = `${whyTreatment ? `${t('soil-result:results.explainedFields.whyTreatment')}:\n${whyTreatment}\n\n` : ''}${benefit ? `${t('soil-result:results.explainedFields.benefit')}:\n${benefit}\n\n` : ''}${tips ? `${t('soil-result:results.explainedFields.tips')}:\n${tips}` : ''}`.trim();
      setGptText(out || '');
    } catch (e) {
      setGptErr(t('soil-result:gptError.failed') as string);
    } finally {
      setIsExplaining(false);
    }
  }, [result, t]);

  const onSave = useCallback(async () => {
    try {
      if (!serverImagePath || !result) {
        setAlertTitle(t('common:error') as string);
        setAlertMessage(t('soil-result:save.failed') as string);
        setAlertVisible(true);
        return;
      }
      setSaving(true);
      const treatment = [
        result.treatment.care ? `care: ${result.treatment.care}` : '',
        result.treatment.medicine ? `medicine: ${result.treatment.medicine}` : ''
      ].filter(Boolean).join(' | ');

      const payload = {
        imageUrl: serverImagePath,
        diseaseName: result.top.label,
        confidence: typeof result.top.confidence === 'number' ? result.top.confidence : undefined,
        treatment: treatment || undefined,
        description: gptText || undefined,
      } as any;

      const res = await api.post('/model/image', payload, { withCredentials: true });
      const ok = !!res?.data?.success;
      setAlertTitle(ok ? (t('common:success') as string) : (t('common:error') as string));
      setAlertMessage(res?.data?.message || (ok ? (t('common:success') as string) : (t('soil-result:save.failed') as string)));
      setAlertVisible(true);
      await AsyncStorage.removeItem('imagePath');
    } catch (e: any) {
      setAlertTitle(t('common:error') as string);
      setAlertMessage(e?.response?.data?.message || e?.message || (t('soil-result:save.failed') as string));
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  }, [serverImagePath, result, gptText, t]);

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" resizeMode="cover" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-5">
        {header}

        <View className="bg-[#0F0D23] rounded-2xl p-4 border border-[#0F0D23]">
          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} className="w-full h-72 rounded-xl" resizeMode="cover" />
              <View className="flex-row mt-4 gap-x-3">
                <Pressable disabled={isPicking} onPress={handlePick} className="flex-1 px-4 py-3 rounded-xl" style={{ backgroundColor: "#1a1930" }}>
                  <Text className="text-white text-center" style={{ fontFamily: "HindSiliguri_500Medium" }}>{t("leafPredict:replace")}</Text>
                </Pressable>
                <Pressable disabled={isPicking} onPress={handleCapture} className="px-4 py-3 rounded-xl" style={{ backgroundColor: "#1a1930" }}>
                  <Text className="text-white" style={{ fontFamily: "HindSiliguri_500Medium" }}>📷</Text>
                </Pressable>
              </View>
              {loading && (
                <View className="mt-4">
                  {uploadPct > 0 && uploadPct < 100 && (
                    <View>
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-white/80 text-xs">{t('leafPredict:uploading')}</Text>
                        <Text className="text-white/80 text-xs">{uploadPct}%</Text>
                      </View>
                      <View className="h-2 rounded bg-white/10">
                        <View className="h-2 rounded" style={{ width: `${uploadPct}%`, backgroundColor: '#ffffffb3' }} />
                      </View>
                    </View>
                  )}
                </View>
              )}
              {error && (
                <View className="mt-3 rounded-lg border border-red-400/20" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                  <Text className="text-red-300 text-sm p-3">{error}</Text>
                </View>
              )}
            </View>
          ) : (
            <View className="items-center justify-center py-10">
              <Text className="text-slate-200 text-base" style={{ fontFamily: "HindSiliguri_500Medium" }}>{t("leafPredict:dropTitle")}</Text>
              <Text className="text-slate-400 mt-2" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t("leafPredict:dropHelp")}</Text>
              <Pressable disabled={isPicking} onPress={handlePick} className="mt-5 px-4 py-3 rounded-xl" style={{ backgroundColor: "#1a1930" }}>
                <Text className="text-white" style={{ fontFamily: "HindSiliguri_500Medium" }}>{t("leafPredict:browseBtn")}</Text>
              </Pressable>
              <Pressable disabled={isPicking} onPress={handleCapture} className="mt-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "#1a1930" }}>
                <Text className="text-white" style={{ fontFamily: "HindSiliguri_500Medium" }}>📷 {"Camera"}</Text>
              </Pressable>
              <Text className="text-slate-400 mt-3" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t("leafPredict:hint", { mb: MAX_MB })}</Text>
            </View>
          )}
        </View>

        <Pressable disabled={!imageUri || loading} onPress={doPredict} className="mt-6 px-4 py-3 rounded-xl self-stretch items-center" style={{ backgroundColor: imageUri && !loading ? "#A8B5DB" : "#3a3953" }}>
          <Text className="text-primary text-base" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t("leafPredict:predictBtn")}</Text>
        </Pressable>

        <View className="mt-8">
          <Text className="text-white text-lg" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t("leafPredict:results")}</Text>
          {!result ? (
            <Text className="text-slate-400 mt-2" style={{ fontFamily: "HindSiliguri_400Regular" }}>{t("leafPredict:noResult")}</Text>
          ) : (
            <View className="mt-3 gap-y-4">
              {/* Predicted label */}
              {type !== 'all' && <>
                <View>
                  <Text className="text-white/60 text-xs" style={{ fontFamily: "HindSiliguri_500Medium" }}>{t('leafPredict:predicted')}</Text>
                  <View className="rounded-lg p-3 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <View className="flex-row items-center">
                      <Text className="text-white text-base" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>
                        {t(`leafPredict:crop`)}: {t(`soilInput:crops.${result.top.label.split('___')[0]}`)}
                      </Text>
                    </View>
                    <View className="flex-row items-center mt-2">
                      <Text className="text-white text-base" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>
                        {t(`leafPredict:disease`)}: {t(`soilInput:diseases.${result.top.label.split('___')[0]}.${result.top.label}`)}
                      </Text>
                    </View>
                  </View>
                  {typeof result.top.confidence === 'number' && (
                    <Text className="text-white/80 text-sm" style={{ fontFamily: "HindSiliguri_400Regular" }}>
                      {t('leafPredict:confidence', { pct: Math.round(result.top.confidence * 100) })}
                    </Text>
                  )}
                </View>

                {/* Treatment */}
                {(result.treatment.care || result.treatment.medicine) && (
                  <View>
                    <Text className="text-white/60 text-xs mb-2" style={{ fontFamily: "HindSiliguri_500Medium" }}>{t('leafPredict:treatment')}</Text>
                    {result.treatment.care && (
                      <View className="rounded-lg p-3 border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <Text className="text-white font-semibold mb-1" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t('leafPredict:care')}</Text>
                        <Text className="text-white/90" style={{ fontFamily: "HindSiliguri_400Regular" }}>{result.treatment.care}</Text>
                      </View>
                    )}
                    {result.treatment.medicine && (
                      <View className="rounded-lg p-3 border border-white/10 mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <Text className="text-white font-semibold mb-1" style={{ fontFamily: "HindSiliguri_600SemiBold" }}>{t('leafPredict:medicine')}</Text>
                        <Text className="text-white/90" style={{ fontFamily: "HindSiliguri_400Regular" }}>{result.treatment.medicine}</Text>
                      </View>
                    )}
                  </View>
                )}
              </>}
            </View>
          )}
        </View>

        {result && (
          <View className="mt-4 rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
            <Pressable disabled={isExplaining} onPress={onExplain} className="px-4 py-3 rounded-xl items-center" style={{ backgroundColor: isExplaining ? '#3a3953' : '#A8B5DB' }}>
              {isExplaining ? (
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
        )}

        {result && type !== 'all' && !submitted && (
          <View className="mt-4 rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
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
      </ScrollView>
      <ThemedAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        confirmText={t('common:ok') as string}
      />
    </View>
  );
}


