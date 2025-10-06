import { getFileNameFromPath, getImageUrl } from '@/hooks'
import api from '@/hooks/api'
import i18n from '@/src/i18n'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native'

export type ImageOnlyRec = {
  kind: 'image', data: {
    id: string; imageUrl?: string | null; diseaseName?: string; confidence?: number | null; treatment?: string | null; createdAt?: string;
    updatedAt?: string; userId?: string; user?: { id?: string; name?: string | null; email?: string | null }
  }
}
export type SoilOnlyRec = {
  kind: 'soil', data: {
    id: string; cropType?: string | null; predictedFertilizer?: string | null; predictedTreatment?: string | null; confidence?: number | null; createdAt?: string;
    temperature?: number | null; phLevel?: number | null; soilColor?: string | null; rainfall?: number | null; nitrogen?: number | null; phosphorous?: number | null; potassium?: number | null;
    updatedAt?: string; userId?: string; user?: { id?: string; name?: string | null; email?: string | null }
  }
}
export type SoilImageRec = {
  kind: 'soilImage', data: {
    id: string; imageUrl?: string | null; cropType?: string | null; diseaseDetected?: string | null; recommendedFertilizer?: string | null; treatmentSuggestion?: string | null; confidence?: number | null; createdAt?: string;
    temperature?: number | null; phLevel?: number | null; soilColor?: string | null; rainfall?: number | null; nitrogen?: number | null; phosphorous?: number | null; potassium?: number | null;
    updatedAt?: string; userId?: string; user?: { id?: string; name?: string | null; email?: string | null }
  }
}
export type SelectedRecord = ImageOnlyRec | SoilOnlyRec | SoilImageRec | null

export default function DetailsModal({ visible, onClose, record }: { visible: boolean, onClose: () => void, record: SelectedRecord }) {
  const { t } = useTranslation(['saved', 'soilInput', 'soil-result', 'common'])
  const [isExplaining, setIsExplaining] = useState(false)
  const [explainText, setExplainText] = useState('')
  const [explainErr, setExplainErr] = useState('')

  const formatDate = (iso?: string) => {
    try {
      if (!iso) return '-'
      const d = new Date(iso)
      if (isNaN(d.getTime())) return '-'
      return d.toLocaleString()
    } catch { return '-' }
  }

  const onExplain = async () => {
    if (!record) return
    setIsExplaining(true)
    setExplainErr('')
    setExplainText('')
    try {
      const isBengali = i18n.language === 'bn'
      let disease = ''
      let confidence: number | undefined
      let fertilizer = ''
      let treatment = ''
      let crop: string | undefined
      let formSummary: Record<string, any> = {}

      if (record.kind === 'image') {
        disease = record.data.diseaseName || ''
        confidence = typeof record.data.confidence === 'number' ? record.data.confidence : undefined
        treatment = record.data.treatment || ''
      } else if (record.kind === 'soil') {
        crop = record.data.cropType || undefined
        fertilizer = record.data.predictedFertilizer || ''
        treatment = record.data.predictedTreatment || ''
        confidence = typeof record.data.confidence === 'number' ? record.data.confidence : undefined
        formSummary = { crop }
      } else if (record.kind === 'soilImage') {
        crop = record.data.cropType || undefined
        disease = record.data.diseaseDetected || ''
        fertilizer = record.data.recommendedFertilizer || ''
        treatment = record.data.treatmentSuggestion || ''
        confidence = typeof record.data.confidence === 'number' ? record.data.confidence : undefined
        formSummary = { crop }
      }

      const diseaseLabel = crop && disease ? (t(`soilInput:diseases.${crop}.${disease}`) as string) : disease
      const hasFertilizer = Boolean(fertilizer && fertilizer.trim().length > 0)
      const fields: string[] = [
        `Disease: ${diseaseLabel || disease}`,
        `Confidence: ${typeof confidence === 'number' ? confidence : 'N/A'}`,
      ]
      if (hasFertilizer && record.kind !== 'image') fields.push(`Fertilizer: ${fertilizer}`)
      if (treatment) fields.push(`Treatment: ${treatment}`)
      fields.push(`Context: ${JSON.stringify(formSummary)}`)

      const jsonKeys: string[] = []
      if (hasFertilizer && record.kind !== 'image') jsonKeys.push('whyFertilizer')
      jsonKeys.push('benefit', 'tips')
      if (treatment) jsonKeys.push('whyTreatment')

      const req = {
        content: `Analyze saved result. ${fields.join('. ')}`,
        systemMessage: `You're an agriculture expert. Explain simply for farmers. in json {${jsonKeys.join(', ')}} provide in ${isBengali ? 'bangla' : 'english'}`,
      }
      const res = await api.post('gpt/gpt-explain', req)
      const parsed = JSON.parse(res?.data?.response || '{}')
      const { whyFertilizer, benefit, tips, whyTreatment } = parsed || {}
      const out = `${whyFertilizer ? `${t('soil-result:results.explainedFields.whyFertilizer')}:\n${whyFertilizer}\n\n` : ''}${whyTreatment ? `${t('soil-result:results.explainedFields.whyTreatment')}:\n${whyTreatment}\n\n` : ''}${benefit ? `${t('soil-result:results.explainedFields.benefit')}:\n${benefit}\n\n` : ''}${tips ? `${t('soil-result:results.explainedFields.tips')}:\n${tips}` : ''}`.trim()
      setExplainText(out)
    } catch (e: any) {
      setExplainErr(t('soil-result:gptError.failed') as string)
    } finally {
      setIsExplaining(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <View className="mt-auto rounded-t-2xl p-5" style={{ backgroundColor: '#0F0D23' }}>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-lg" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('saved:detailsTitle') || 'Details'}</Text>
            <Pressable onPress={onClose} className="px-3 py-1 rounded-lg" style={{ backgroundColor: '#1a1930' }}>
              <Text className="text-white" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{t('common:close') || 'Close'}</Text>
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 500 }}>
            {record?.kind !== 'soil' && record && 'data' in record && (record.data as any)?.imageUrl ? (
              <Image source={{ uri: getImageUrl(getFileNameFromPath((record.data as any).imageUrl as string)) }} className="w-full h-48 rounded-xl" resizeMode="cover" />
            ) : null}

            {/* Image */}
            {record?.kind === 'image' && (
              <View className="mt-3">
                <View className="mt-2">
                  <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.disease')}</Text>
                  <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{record.data.diseaseName}</Text>
                </View>
                <View className="mt-2">
                  <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.savedAt') || 'Saved at'}</Text>
                  <Text className="text-white/90 mt-1" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{formatDate((record.data as any).createdAt)}</Text>
                </View>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <Text className="text-white/70 text-xs">{t('saved:labels.recordId') || 'Record ID'}</Text>
                    <Text className="text-white text-sm mt-1">{record.data.id}</Text>
                  </View>
                  {(record.data as any).updatedAt && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('saved:labels.updatedAt') || 'Updated at'}</Text>
                      <Text className="text-white text-sm mt-1">{formatDate((record.data as any).updatedAt)}</Text>
                    </View>
                  )}
                  {(record.data as any).user?.name && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('saved:labels.userName') || 'User'}</Text>
                      <Text className="text-white text-sm mt-1">{(record.data as any).user?.name}</Text>
                    </View>
                  )}
                  {(record.data as any).user?.email && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('saved:labels.userEmail') || 'Email'}</Text>
                      <Text className="text-white text-sm mt-1">{(record.data as any).user?.email}</Text>
                    </View>
                  )}
                </View>
                {typeof record.data.confidence === 'number' && (
                  <View className="mt-2">
                    <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.confidence')}</Text>
                    <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{Math.round((record.data.confidence as number) * 100)}%</Text>
                  </View>
                )}
                {record.data.treatment ? (
                  <View className="mt-2">
                    <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.treatment')}</Text>
                    <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{record.data.treatment}</Text>
                  </View>
                ) : null}
              </View>
            )}

            {/* Soil only */}
            {record?.kind === 'soil' && (
              <View className="mt-3">
                <View className="mt-2">
                  <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.crop')}</Text>
                  <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{record.data.cropType ? (t(`soilInput:crops.${record.data.cropType}`) as string) : '-'}</Text>
                </View>
                <View className="mt-2">
                  <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.savedAt') || 'Saved at'}</Text>
                  <Text className="text-white/90 mt-1" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{formatDate((record.data as any).createdAt)}</Text>
                </View>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {record.data.temperature != null && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.temperature')}</Text>
                      <Text className="text-white text-sm mt-1">{String(record.data.temperature)}</Text>
                    </View>
                  )}
                  {record.data.phLevel != null && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.ph')}</Text>
                      <Text className="text-white text-sm mt-1">{String(record.data.phLevel)}</Text>
                    </View>
                  )}
                  {record.data.soilColor && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.soilColor')}</Text>
                      <Text className="text-white text-sm mt-1">{t(`soilInput:soilColors.${record.data.soilColor}`) as string}</Text>
                    </View>
                  )}
                  {record.data.rainfall != null && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.rainfall')}</Text>
                      <Text className="text-white text-sm mt-1">{String(record.data.rainfall)}</Text>
                    </View>
                  )}
                  {record.data.nitrogen != null && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.nitrogen')}</Text>
                      <Text className="text-white text-sm mt-1">{String(record.data.nitrogen)}</Text>
                    </View>
                  )}
                  {record.data.phosphorous != null && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.phosphorus')}</Text>
                      <Text className="text-white text-sm mt-1">{String(record.data.phosphorous)}</Text>
                    </View>
                  )}
                  {record.data.potassium != null && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.potassium')}</Text>
                      <Text className="text-white text-sm mt-1">{String(record.data.potassium)}</Text>
                    </View>
                  )}
                </View>
                {record.data.predictedFertilizer ? (
                  <View className="mt-2">
                    <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.fertilizer')}</Text>
                    <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{record.data.predictedFertilizer}</Text>
                  </View>
                ) : null}
                {record.data.predictedTreatment ? (
                  <View className="mt-2">
                    <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.treatment')}</Text>
                    <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{record.data.predictedTreatment}</Text>
                  </View>
                ) : null}
                {typeof record.data.confidence === 'number' && (
                  <View className="mt-2">
                    <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.confidence')}</Text>
                    <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{Math.round((record.data.confidence as number) * 100)}%</Text>
                  </View>
                )}
              </View>
            )}

            {/* Soil + Image */}
            {record?.kind === 'soilImage' && (
              <View className="mt-3">
                <View className="flex-row gap-3 mt-2">
                  <View className="flex-1">
                    <Text className="text-white/70 text-xs">{t('saved:labels.crop')}</Text>
                    <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{record.data.cropType ? (t(`soilInput:crops.${record.data.cropType}`) as string) : '-'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white/70 text-xs">{t('saved:labels.disease')}</Text>
                    <Text className="text-white mt-1" style={{ fontFamily: 'HindSiliguri_600SemiBold' }}>{record.data.diseaseDetected || '-'}</Text>
                  </View>
                </View>
                <View className="mt-2">
                  <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.savedAt') || 'Saved at'}</Text>
                  <Text className="text-white/90 mt-1" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{formatDate((record.data as any).createdAt)}</Text>
                </View>
                <View className="flex-row flex-wrap gap-2 mt-2">
                  {record.data.temperature != null && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.temperature')}</Text>
                      <Text className="text-white text-sm mt-1">{String(record.data.temperature)}</Text>
                    </View>
                  )}
                  {record.data.phLevel != null && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.ph')}</Text>
                      <Text className="text-white text-sm mt-1">{String(record.data.phLevel)}</Text>
                    </View>
                  )}
                  {record.data.soilColor && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.soilColor')}</Text>
                      <Text className="text-white text-sm mt-1">{t(`soilInput:soilColors.${record.data.soilColor}`) as string}</Text>
                    </View>
                  )}
                  {record.data.rainfall != null && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.rainfall')}</Text>
                      <Text className="text-white text-sm mt-1">{String(record.data.rainfall)}</Text>
                    </View>
                  )}
                  {record.data.nitrogen != null && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.nitrogen')}</Text>
                      <Text className="text-white text-sm mt-1">{String(record.data.nitrogen)}</Text>
                    </View>
                  )}
                  {record.data.phosphorous != null && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.phosphorus')}</Text>
                      <Text className="text-white text-sm mt-1">{String(record.data.phosphorous)}</Text>
                    </View>
                  )}
                  {record.data.potassium != null && (
                    <View className="flex-1 min-w-[45%] p-3 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      <Text className="text-white/70 text-xs">{t('soil-result:fields.potassium')}</Text>
                      <Text className="text-white text-sm mt-1">{String(record.data.potassium)}</Text>
                    </View>
                  )}
                </View>
                {record.data.recommendedFertilizer ? (
                  <View className="mt-2">
                    <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.fertilizer')}</Text>
                    <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{record.data.recommendedFertilizer}</Text>
                  </View>
                ) : null}
                {record.data.treatmentSuggestion ? (
                  <View className="mt-2">
                    <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.treatment')}</Text>
                    <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{record.data.treatmentSuggestion}</Text>
                  </View>
                ) : null}
                {typeof record.data.confidence === 'number' && (
                  <View className="mt-2">
                    <Text className="text-white/70 text-xs" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{t('saved:labels.confidence')}</Text>
                    <Text className="text-white/90" style={{ fontFamily: 'HindSiliguri_400Regular' }}>{Math.round((record.data.confidence as number) * 100)}%</Text>
                  </View>
                )}
              </View>
            )}

            <View className="mt-4">
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
              {explainErr ? (
                <Text className="text-red-300 mt-3">{explainErr}</Text>
              ) : null}
              {explainText ? (
                <Text className="text-white mt-3 whitespace-pre-wrap">{explainText}</Text>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}


