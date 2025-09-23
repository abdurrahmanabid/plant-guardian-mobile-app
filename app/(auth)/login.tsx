import Background from '@/components/Background'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'

export default function Login() {
  const router = useRouter()
  const { t } = useTranslation('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    try {
      setLoading(true)
      // fake delay
      await new Promise(r => setTimeout(r, 600))
      Alert.alert(t('success.default'))
    } catch (e) {
      Alert.alert(t('errors.server'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Background>
      <View className="px-5 py-6 flex-1 justify-center">
        <Text className="text-white text-2xl font-semibold mb-2 f">{t('title')}</Text>
        <Text className="text-white/80 mb-6 f">{t('subtitle')}</Text>

        <View className="gap-4">
          <View>
            <Text className="text-white mb-2">{t('fields.email')}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t('placeholders.email')}
              placeholderTextColor="#A8B5DB"
              keyboardType="email-address"
              autoCapitalize="none"
              className="px-4 py-3 rounded-xl text-white"
              style={{ backgroundColor: '#0F0D23' }}
            />
          </View>
          <View>
            <Text className="text-white mb-2">{t('fields.password')}</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={t('placeholders.password')}
              placeholderTextColor="#A8B5DB"
              secureTextEntry
              className="px-4 py-3 rounded-xl text-white"
              style={{ backgroundColor: '#0F0D23' }}
            />
          </View>

          <Pressable onPress={onSubmit} className="px-4 py-3 rounded-xl items-center" style={{ backgroundColor: '#1E90FF' }}>
            <Text className="text-white font-medium">{loading ? t('buttons.submitting') : t('buttons.submit')}</Text>
          </Pressable>

          <View className="flex-row justify-between mt-2">
            <Pressable><Text className="text-white/80">{t('links.forgot')}</Text></Pressable>
            <View className="flex-row gap-1">
              <Text className="text-white/80">{t('links.noAccount')}</Text>
              <Pressable onPress={() => router.push('/(auth)/registration')}><Text className="text-white">{t('links.register')}</Text></Pressable>
            </View>
          </View>
        </View>
      </View>
    </Background>
  )
}


