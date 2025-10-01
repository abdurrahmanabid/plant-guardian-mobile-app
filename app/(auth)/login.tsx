import Background from '@/components/Background'
import api from '@/hooks/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable, Text, TextInput, View } from 'react-native'

export default function Login() {
  const router = useRouter()
  const { t } = useTranslation('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      setIsSuccess(false)
      setModalMessage(t('errors.server') as string)
      setModalVisible(true)
      return
    }

    try {
      setLoading(true)

      const res = await api.post('/user/signin', {
        email: email.trim(),
        password,
      })

      const message = res?.data?.message || (t('success.default') as string)
      console.log(res.data)
      await AsyncStorage.setItem('Login', 'true')

      // Token storage disabled (cookie-based auth)

      setIsSuccess(true)
      setModalMessage(message)
      setModalVisible(true)
    } catch (err: any) {
      const status = err?.response?.status
      const msg =
        err?.response?.data?.message ||
        (status === 401 ? (t('errors.invalid') as string) : (t('errors.server') as string))
      setIsSuccess(false)
      setModalMessage(String(msg))
      setModalVisible(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    if (isSuccess) {
      // navigate after success and reset
      setEmail('')
      setPassword('')
      router.push('/(tabs)')
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

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="w-11/12 rounded-2xl p-5" style={{ backgroundColor: '#0F0D23' }}>
            <Text className="text-white text-lg mb-4">{modalMessage}</Text>
            <View className="flex-row justify-end gap-3">
              <Pressable
                onPress={handleCloseModal}
                className="px-4 py-2 rounded-xl"
                style={{ backgroundColor: isSuccess ? '#1E90FF' : '#6B7280' }}
              >
                <Text className="text-white">{isSuccess ? t('buttons.continue') : t('buttons.ok') }</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Background>
  )
}


