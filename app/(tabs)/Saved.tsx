import DetailsModal, { type SelectedRecord } from '@/components/DetailsModal'
import { getFileNameFromPath, getImageUrl } from '@/hooks'
import api from '@/hooks/api'
import { useAuth } from '@/hooks/useAuth'
import { images } from '@/src/constants/images'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Alert, Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'

type ImageOnly = { id: string; imageUrl: string; diseaseName: string; confidence?: number | null; treatment?: string | null; createdAt?: string };
type SoilOnly = {
  id: string; cropType?: string | null; predictedFertilizer?: string | null; predictedTreatment?: string | null; confidence?: number | null; createdAt?: string,
  temperature?: number | null; phLevel?: number | null; soilColor?: string | null; rainfall?: number | null; nitrogen?: number | null; phosphorous?: number | null; potassium?: number | null
};
type SoilImage = {
  id: string; imageUrl?: string | null; cropType?: string | null; diseaseDetected?: string | null; recommendedFertilizer?: string | null; treatmentSuggestion?: string | null; confidence?: number | null; createdAt?: string,
  temperature?: number | null; phLevel?: number | null; soilColor?: string | null; rainfall?: number | null; nitrogen?: number | null; phosphorous?: number | null; potassium?: number | null
};

export default function Saved() {
  const { t } = useTranslation(['saved', 'soilInput', 'soil-result', 'common', 'profile', 'auth'])
  const router = useRouter()
  const { isLoggedIn } = useAuth()

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const [imageOnly, setImageOnly] = useState<ImageOnly[]>([])
  const [soilOnly, setSoilOnly] = useState<SoilOnly[]>([])
  const [soilImage, setSoilImage] = useState<SoilImage[]>([])
  const [activeTab, setActiveTab] = useState<'image' | 'soil' | 'soilImage'>('image')
  const [refreshing, setRefreshing] = useState(false)

  const [selected, setSelected] = useState<SelectedRecord>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const formatDate = (iso?: string) => {
    try {
      if (!iso) return '-'
      const d = new Date(iso)
      if (isNaN(d.getTime())) return '-'
      return d.toLocaleString()
    } catch { return '-' }
  }

  const fetchAll = async (showLoader: boolean = true) => {
    try {
      setErr(null)
      if (showLoader) setLoading(true)
      if (!isLoggedIn) {
        setLoading(false)
        return
      }
      const [imgRes, soilRes, soilImgRes] = await Promise.all([
        api.get('/model/image', { withCredentials: true }),
        api.get('/soil-model/saved', { withCredentials: true }),
        api.get('/soil-and-image-model/saved', { withCredentials: true }),
      ])
      const imgList: ImageOnly[] = imgRes?.data?.data || imgRes?.data || []
      const soilList: SoilOnly[] = soilRes?.data?.data || soilRes?.data || []
      const soilImgList: SoilImage[] = soilImgRes?.data?.data || soilImgRes?.data || []
      setImageOnly(imgList)
      setSoilOnly(soilList)
      setSoilImage(soilImgList)
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || t('saved:error') as string)
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [isLoggedIn])

  const onRefresh = async () => {
    try {
      setRefreshing(true)
      await fetchAll(false)
    } finally {
      setRefreshing(false)
    }
  }

  const openModal = (record: SelectedRecord) => {
    setSelected(record)
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setSelected(null)
  }

  const onDelete = async (type: 'image' | 'soil' | 'soilImage', id: string) => {
    try {
      const confirm = await new Promise<boolean>((resolve) => {
        Alert.alert(t('saved:deleteTitle') as string, t('saved:deleteConfirm') as string, [
          { text: t('saved:cancel') as string, style: 'cancel', onPress: () => resolve(false) },
          { text: t('saved:delete') as string, style: 'destructive', onPress: () => resolve(true) },
        ])
      })
      if (!confirm) return
      if (type === 'image') await api.delete(`/model/image/${id}`, { withCredentials: true })
      if (type === 'soil') await api.delete(`/soil-model/saved/${id}`, { withCredentials: true })
      if (type === 'soilImage') await api.delete(`/soil-and-image-model/saved/${id}`, { withCredentials: true })
      fetchAll()
    } catch (e: any) {
      Alert.alert(t('saved:error') as string, e?.response?.data?.message || e?.message || (t('saved:deleteFailed') as string))
    }
  }

  const header = useMemo(() => (
    <View className="mt-16 mb-6">
      <Text className="text-white text-2xl font-semibold" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('saved:title')}</Text>
      <Text className="text-slate-300 mt-2" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:subtitle')}</Text>
    </View>
  ), [t])

  const Stat = ({ label, value }: { label: string, value: number }) => (
    <View className="flex-1 p-4 rounded-xl border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
      <Text className="text-white/60 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{label}</Text>
      <Text className="text-white text-xl mt-1" style={{ fontFamily: 'HindSiliguri_700Bold' }}>{value}</Text>
    </View>
  )

  const CardRow = ({ label, children }: { label: string, children: any }) => (
    <View className="mt-2">
      <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{label}</Text>
      {children}
    </View>
  )


  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" resizeMode="cover" />
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} className="px-5" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" colors={["#ffffff"]} />}>
        {header}
        {/* Tabs */}
        <View className="flex-row rounded-xl overflow-hidden border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
          <Pressable onPress={() => setActiveTab('image')} className="flex-1 px-4 py-3 items-center" style={{ backgroundColor: activeTab === 'image' ? '#1a1930' : 'transparent' }}>
            <Text className="text-white" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('saved:tabs.imageOnly')} ({imageOnly.length})</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab('soil')} className="flex-1 px-4 py-3 items-center" style={{ backgroundColor: activeTab === 'soil' ? '#1a1930' : 'transparent' }}>
            <Text className="text-white" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('saved:tabs.soilOnly')} ({soilOnly.length})</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab('soilImage')} className="flex-1 px-4 py-3 items-center" style={{ backgroundColor: activeTab === 'soilImage' ? '#1a1930' : 'transparent' }}>
            <Text className="text-white" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('saved:tabs.soilImage')} ({soilImage.length})</Text>
          </Pressable>
        </View>

        {!isLoggedIn ? (
          <View className="mt-12 px-4">
            <View className="rounded-2xl p-6 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
              <Text className="text-white text-2xl font-semibold text-center" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('profile.noProfile.title', { ns: 'profile' })}</Text>
              <Text className="text-white/80 text-center mt-2" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('profile.noProfile.message', { ns: 'profile' })}</Text>
              <View className="flex-row gap-3 mt-5">
                <Pressable onPress={() => router.push('/(auth)/login')} className="flex-1 px-4 py-3 rounded-xl items-center" style={{ backgroundColor: '#1E90FF' }}>
                  <Text className="text-white" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('auth.signin.button', { ns: 'profile' })}</Text>
                </Pressable>
                <Pressable onPress={() => router.push('/(auth)/registration')} className="flex-1 px-4 py-3 rounded-xl items-center border border-white/20" style={{ backgroundColor: '#151332' }}>
                  <Text className="text-white" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('auth.signup.button', { ns: 'profile' })}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : loading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator color="#ffffff" />
            <Text className="text-white/80 mt-3" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:loading')}</Text>
          </View>
        ) : err ? (
          <View className="rounded-2xl p-4 border border-red-400/20" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
            <Text className="text-red-300" style={{ fontFamily: 'HindSiliguri_500Medium' }}>{err}</Text>
          </View>
        ) : (
          <>
            {/* Image Only */}
            {activeTab === 'image' && <View className="mt-6">
              <Text className="text-white text-lg" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('saved:sections.imageOnly')}</Text>
              {imageOnly.length === 0 ? (
                <Text className="text-slate-400 mt-2" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:empty')}</Text>
              ) : imageOnly.map((item) => (
                <Pressable key={item.id} onPress={() => openModal({ kind: 'image', data: item })} className="mt-3 rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
                  {item.imageUrl ? (
                    <Image source={{ uri: getImageUrl(getFileNameFromPath(item.imageUrl)) }} className="w-full h-48 rounded-xl" resizeMode="cover" />
                  ) : null}
                  <CardRow label={t('saved:labels.disease') as string}>
                    <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{item.diseaseName}</Text>
                  </CardRow>
                  {typeof item.confidence === 'number' && (
                    <CardRow label={t('saved:labels.confidence') as string}>
                      <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{Math.round(item.confidence * 100)}%</Text>
                    </CardRow>
                  )}
                  {item.treatment ? (
                    <CardRow label={t('saved:labels.treatment') as string}>
                      <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{item.treatment}</Text>
                    </CardRow>
                  ) : null}
                  <View className="flex-row justify-end mt-3">
                    <Pressable onPress={() => onDelete('image', item.id)} className="px-4 py-2 rounded-xl" style={{ backgroundColor: '#7F1D1D' }}>
                      <Text className="text-white" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('saved:delete')}</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>}

            {/* Soil Only */}
            {activeTab === 'soil' && <View className="mt-6">
              <Text className="text-white text-lg" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('saved:sections.soilOnly')}</Text>
              {soilOnly.length === 0 ? (
                <Text className="text-slate-400 mt-2" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:empty')}</Text>
              ) : soilOnly.map((item) => (
                <Pressable key={item.id} onPress={() => openModal({ kind: 'soil', data: item })} className="mt-3 rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
                  <CardRow label={t('saved:labels.crop') as string}>
                    <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{item.cropType ? (t(`soilInput:crops.${item.cropType}`) as string) : '-'}</Text>
                  </CardRow>
                  {item.predictedFertilizer ? (
                    <CardRow label={t('saved:labels.fertilizer') as string}>
                      <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{item.predictedFertilizer}</Text>
                    </CardRow>
                  ) : null}
                  {item.predictedTreatment ? (
                    <CardRow label={t('saved:labels.treatment') as string}>
                      <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{item.predictedTreatment}</Text>
                    </CardRow>
                  ) : null}
                  {typeof item.confidence === 'number' && (
                    <CardRow label={t('saved:labels.confidence') as string}>
                      <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{Math.round(item.confidence * 100)}%</Text>
                    </CardRow>
                  )}
                  <View className="flex-row justify-end mt-3">
                    <Pressable onPress={() => onDelete('soil', item.id)} className="px-4 py-2 rounded-xl" style={{ backgroundColor: '#7F1D1D' }}>
                      <Text className="text-white" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('saved:delete')}</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>}

            {/* Soil + Image */}
            {activeTab === 'soilImage' && <View className="mt-6">
              <Text className="text-white text-lg" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('saved:sections.soilImage')}</Text>
              {soilImage.length === 0 ? (
                <Text className="text-slate-400 mt-2" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:empty')}</Text>
              ) : soilImage.map((item) => (
                <Pressable key={item.id} onPress={() => openModal({ kind: 'soilImage', data: item })} className="mt-3 rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
                  {item.imageUrl ? (
                    <Image source={{ uri: getImageUrl(getFileNameFromPath(item.imageUrl)) }} className="w-full h-48 rounded-xl" resizeMode="cover" />
                  ) : null}
                  <View className="flex-row gap-3 mt-2">
                    <View className="flex-1">
                      <CardRow label={t('saved:labels.crop') as string}>
                        <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{item.cropType ? (t(`soilInput:crops.${item.cropType}`) as string) : '-'}</Text>
                      </CardRow>
                    </View>
                    <View className="flex-1">
                      <CardRow label={t('saved:labels.disease') as string}>
                        <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{item.diseaseDetected || '-'}</Text>
                      </CardRow>
                    </View>
                  </View>
                  {item.recommendedFertilizer ? (
                    <CardRow label={t('saved:labels.fertilizer') as string}>
                      <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{item.recommendedFertilizer}</Text>
                    </CardRow>
                  ) : null}
                  {item.treatmentSuggestion ? (
                    <CardRow label={t('saved:labels.treatment') as string}>
                      <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{item.treatmentSuggestion}</Text>
                    </CardRow>
                  ) : null}
                  {typeof item.confidence === 'number' && (
                    <CardRow label={t('saved:labels.confidence') as string}>
                      <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{Math.round((item.confidence as number) * 100)}%</Text>
                    </CardRow>
                  )}
                  <View className="flex-row justify-end mt-3">
                    <Pressable onPress={() => onDelete('soilImage', item.id)} className="px-4 py-2 rounded-xl" style={{ backgroundColor: '#7F1D1D' }}>
                      <Text className="text-white" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('saved:delete')}</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>}
          </>
        )}
      </ScrollView>

      <DetailsModal visible={modalVisible} onClose={closeModal} record={selected} />
    </View>
  )
}
