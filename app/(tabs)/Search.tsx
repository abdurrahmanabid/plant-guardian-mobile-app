import DetailsModal, { type SelectedRecord } from '@/components/DetailsModal'
import { getFileNameFromPath, getImageUrl } from '@/hooks'
import api from '@/hooks/api'
import { useAuth } from '@/hooks/useAuth'
import { images } from '@/src/constants/images'
import { useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native'

export default function Search() {
  const { t } = useTranslation(['search', 'saved', 'profile', 'auth'])
  const router = useRouter()
  const { isLoggedIn } = useAuth()

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  type ImageOnly = { kind: 'image', id: string, imageUrl?: string, diseaseName?: string, confidence?: number | null, treatment?: string | null, createdAt?: string }
  type SoilOnly = { kind: 'soil', id: string, cropType?: string | null, predictedFertilizer?: string | null, predictedTreatment?: string | null, confidence?: number | null, createdAt?: string }
  type SoilImage = { kind: 'soilImage', id: string, imageUrl?: string | null, cropType?: string | null, diseaseDetected?: string | null, recommendedFertilizer?: string | null, treatmentSuggestion?: string | null, confidence?: number | null, createdAt?: string }
  type Result = ImageOnly | SoilOnly | SoilImage
  const [results, setResults] = useState<Result[]>([])
  const [selected, setSelected] = useState<SelectedRecord>(null)
  const [modalVisible, setModalVisible] = useState(false)

  const openModal = (item: Result) => {
    const record: SelectedRecord = item.kind === 'image'
      ? { kind: 'image', data: item as any }
      : item.kind === 'soil'
        ? { kind: 'soil', data: item as any }
        : { kind: 'soilImage', data: item as any }
    setSelected(record)
    setModalVisible(true)
  }
  const closeModal = () => { setModalVisible(false); setSelected(null) }

  const fetchByDisease = async (name: string) => {
    if (!name.trim()) return
    const q = name.trim().toLowerCase()
    try {
      setError(null)
      setLoading(true)
      if (!isLoggedIn) { setLoading(false); return }
      const [imgRes, soilRes, soilImgRes] = await Promise.all([
        api.get('/model/image/recent', { withCredentials: true }),
        api.get('/soil-model/saved', { withCredentials: true }),
        api.get('/soil-and-image-model/saved', { withCredentials: true }),
      ])
      const images: Result[] = (imgRes?.data?.data || imgRes?.data || []).map((x: any) => ({ ...x, kind: 'image' }))
      const soils: Result[] = (soilRes?.data?.data || soilRes?.data || []).map((x: any) => ({ ...x, kind: 'soil' }))
      const soilImages: Result[] = (soilImgRes?.data?.data || soilImgRes?.data || []).map((x: any) => ({ ...x, kind: 'soilImage' }))
      const combined = [...images, ...soils, ...soilImages]
      const filtered = combined.filter((item) => {
        if (item.kind === 'image') {
          return (item.diseaseName || '').toLowerCase().includes(q) || (item.treatment || '').toLowerCase().includes(q)
        }
        if (item.kind === 'soil') {
          return (item.cropType || '').toLowerCase().includes(q) || (item.predictedFertilizer || '').toLowerCase().includes(q) || (item.predictedTreatment || '').toLowerCase().includes(q)
        }
        return (
          (item.cropType || '').toLowerCase().includes(q) ||
          (item.diseaseDetected || '').toLowerCase().includes(q) ||
          (item.recommendedFertilizer || '').toLowerCase().includes(q) ||
          (item.treatmentSuggestion || '').toLowerCase().includes(q)
        )
      })
      setResults(filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()))
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || (t('search:error') as string))
    } finally {
      setLoading(false)
    }
  }

  const fetchRecent = async () => {
    try {
      setError(null)
      setLoading(true)
      if (!isLoggedIn) { setLoading(false); return }
      const [imgRes, soilRes, soilImgRes] = await Promise.all([
        api.get('/model/image/recent', { withCredentials: true }),
        api.get('/soil-model/saved', { withCredentials: true }),
        api.get('/soil-and-image-model/saved', { withCredentials: true }),
      ])
      const images: Result[] = (imgRes?.data?.data || imgRes?.data || []).map((x: any) => ({ ...x, kind: 'image' }))
      const soils: Result[] = (soilRes?.data?.data || soilRes?.data || []).map((x: any) => ({ ...x, kind: 'soil' }))
      const soilImages: Result[] = (soilImgRes?.data?.data || soilImgRes?.data || []).map((x: any) => ({ ...x, kind: 'soilImage' }))
      const combined = [...images, ...soils, ...soilImages]
      setResults(combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()))
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || (t('search:error') as string))
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true)
      if (query.trim()) await fetchByDisease(query)
      else await fetchRecent()
    } finally {
      setRefreshing(false)
    }
  }, [query])

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" resizeMode="cover" />
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 60 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" colors={["#ffffff"]} />}>
        <View className="mt-16 mb-6">
          <Text className="text-white text-2xl font-semibold" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('search:title')}</Text>
          <Text className="text-slate-300 mt-2" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('search:subtitle')}</Text>
        </View>

        {!isLoggedIn ? (
          <View className="mt-8 px-2">
            <View className="rounded-2xl p-6 border border-white/10 items-center" style={{ backgroundColor: '#0F0D23' }}>
              <Text className="text-white text-2xl font-semibold text-center" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('profile.noProfile.title', { ns: 'profile' })}</Text>
              <Text className="text-white/80 text-center mt-2" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('profile.noProfile.message', { ns: 'profile' })}</Text>
              <View className="flex-row gap-3 mt-5 w-full">
                <Pressable onPress={() => router.push('/(auth)/login')} className="flex-1 px-4 py-3 rounded-xl items-center" style={{ backgroundColor: '#1E90FF' }}>
                  <Text className="text-white" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('auth.signin.button', { ns: 'profile' })}</Text>
                </Pressable>
                <Pressable onPress={() => router.push('/(auth)/registration')} className="flex-1 px-4 py-3 rounded-xl items-center border border-white/20" style={{ backgroundColor: '#151332' }}>
                  <Text className="text-white" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('auth.signup.button', { ns: 'profile' })}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View className="rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
            <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('search:byDisease')}</Text>
            <View className="flex-row items-center gap-2 mt-2">
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('search:diseasePlaceholder') as string}
                placeholderTextColor="#9CA3AF"
                className="flex-1 px-4 py-3 rounded-xl text-white"
                style={{ backgroundColor: '#1a1930', fontFamily: 'HindSiliguri_400Regular' }}
                autoCapitalize="none"
                returnKeyType="search"
                onSubmitEditing={() => fetchByDisease(query)}
              />
              <Pressable disabled={loading || !query.trim()} onPress={() => fetchByDisease(query)} className="px-4 py-3 rounded-xl" style={{ backgroundColor: loading || !query.trim() ? '#3a3953' : '#A8B5DB' }}>
                {loading ? (
                  <ActivityIndicator color="#0F0D23" size="small" />
                ) : (
                  <Text className="text-primary" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('search:searchBtn')}</Text>
                )}
              </Pressable>
            </View>

            <Pressable disabled={loading} onPress={fetchRecent} className="mt-3 px-4 py-3 rounded-xl items-center" style={{ backgroundColor: '#93C5FD' }}>
              {loading ? (
                <ActivityIndicator color="#0F0D23" size="small" />
              ) : (
                <Text className="text-primary" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('search:recentBtn')}</Text>
              )}
            </Pressable>
          </View>
        )}

        {error ? (
          <View className="rounded-2xl p-4 mt-4 border border-red-400/20" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
            <Text className="text-red-300" style={{ fontFamily: 'HindSiliguri_500Medium' }}>{error}</Text>
          </View>
        ) : null}

        {/* Results */}
        <View className="mt-6">
          <Text className="text-white text-lg" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('search:resultsTitle')}</Text>
          {results.length === 0 ? (
            <Text className="text-slate-400 mt-2" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('search:empty')}</Text>
          ) : results.map((item) => (
            <Pressable key={`${item.kind}-${item.id}`} onPress={() => openModal(item)} className="mt-3 rounded-2xl p-4 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
              {item.kind !== 'soil' && item.imageUrl ? (
                <Image source={{ uri: getImageUrl(getFileNameFromPath(item.imageUrl)) }} className="w-full h-44 rounded-xl" resizeMode="cover" />
              ) : null}
              {/* Header row showing type */}
              <View className="mt-2">
                <Text className="text-white/60 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>
                  {item.kind === 'image' ? 'Image' : item.kind === 'soil' ? 'Soil' : 'Soil + Image'}
                </Text>
              </View>
              {item.kind === 'image' && (
                <View className="flex-row gap-3 mt-1">
                  <View className="flex-1">
                    <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.disease')}</Text>
                    <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{item.diseaseName || '-'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.confidence')}</Text>
                    <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{typeof item.confidence === 'number' ? `${Math.round(item.confidence * 100)}%` : '-'}</Text>
                  </View>
                </View>
              )}
              {item.kind === 'soil' && (
                <View className="mt-1">
                  <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.crop')}</Text>
                  <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{item.cropType || '-'}</Text>
                  {item.predictedFertilizer ? (
                    <View className="mt-1">
                      <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.fertilizer')}</Text>
                      <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{item.predictedFertilizer}</Text>
                    </View>
                  ) : null}
                </View>
              )}
              {item.kind === 'soilImage' && (
                <View className="flex-row gap-3 mt-1">
                  <View className="flex-1">
                    <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.crop')}</Text>
                    <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{item.cropType || '-'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.disease')}</Text>
                    <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{item.diseaseDetected || '-'}</Text>
                  </View>
                </View>
              )}
              {item.kind === 'image' && item.treatment ? (
                <View className="mt-2">
                  <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.treatment')}</Text>
                  <Text className="text-white/90 mt-1" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{item.treatment}</Text>
                </View>
              ) : null}
              <View className="mt-2">
                <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.savedAt') || 'Saved at'}</Text>
                <Text className="text-white/90 mt-1" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <DetailsModal visible={modalVisible} onClose={closeModal} record={selected} />
    </View>
  )
}


