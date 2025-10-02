import Background from '@/components/Background';
import api from '@/hooks/api';
import i18n from '@/src/i18n';
import { useRouter } from 'expo-router'; // বা আপনার রাউটিং লাইব্রেরি অনুযায়ী
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

export default function Profile() {
  const { t } = useTranslation('profile')
  const router = useRouter() // রাউটিং হুক

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSignIn = () => {
    router.push('/(auth)/login')
  }

  const onSignUp = () => {
    router.push('/(auth)/registration')
  }

  useEffect(() => {
    let alive = true
    const fetchUser = async () => {
      try {
        setLoading(true)
        const res = await api.get('/user/get-user')
        if (!alive) return
        if (res.status === 200) {
          setUser(res.data)
          setError(null)
        } else {
          setUser(null)
          setError('not_found')
        }
      } catch (err: any) {
        if (!alive) return
        const status = err?.response?.status
        if (status === 401) {
          setUser(null)
          setError('unauthorized')
        } else {
          setUser(null)
          setError('server')
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    fetchUser()
    return () => {
      alive = false
    }
  }, [])

  const initials = useMemo(() => {
    const name: string = user?.name || ''
    if (!name) return ''
    return name
      .split(' ')
      .map((n: string) => n[0])
      .slice(0, 2)
      .join('')
  }, [user?.name])

  return (
    <Background>
      <View className="px-5 py-4">
        <Text className="text-white text-2xl font-semibold mb-4">{t('profile.title')}</Text>

        {/* ভাষা পরিবর্তন সেকশন */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white/80">
            {t('language.current', { defaultValue: `Current: ${i18n.language}` })}
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => i18n.changeLanguage('en')}
              className="px-3 py-2 rounded-full"
              style={{ backgroundColor: i18n.language === 'en' ? '#1E90FF' : '#0F0D23' }}
            >
              <Text className="text-white font-medium">{t('language.en', { defaultValue: 'EN' })}</Text>
            </Pressable>
            <Pressable
              onPress={() => i18n.changeLanguage('bn')}
              className="px-3 py-2 rounded-full"
              style={{ backgroundColor: i18n.language === 'bn' ? '#1E90FF' : '#0F0D23' }}
            >
              <Text className="text-white font-medium">{t('language.bn', { defaultValue: 'BN' })}</Text>
            </Pressable>
          </View>
        </View>

        {loading ? (
          <View className="mt-8 items-center">
            <Text className="text-white/80">Loading...</Text>
          </View>
        ) : !user ? (
          <View className="mt-8 items-center">
            {/* অ্যাকাউন্ট না থাকলে মেসেজ */}
            <View className="mb-8 p-4 rounded-2xl" style={{ backgroundColor: '#0F0D23' }}>
              <Text className="text-white text-lg mb-2 text-center">{t('profile.noProfile.title')}</Text>
              <Text className="text-white/80 text-center">{t('profile.noProfile.message')}</Text>
            </View>

            {/* সাইন ইন এবং সাইন আপ বাটন */}
            <View className="gap-4 w-full max-w-xs">
              <Pressable
                onPress={onSignIn}
                className="px-6 py-4 rounded-xl items-center"
                style={{ backgroundColor: '#1E90FF' }}
              >
                <Text className="text-white font-medium text-lg">{t('auth.signin.button')}</Text>
              </Pressable>

              <Pressable
                onPress={onSignUp}
                className="px-6 py-4 rounded-xl items-center border border-white/30"
                style={{ backgroundColor: 'transparent' }}
              >
                <Text className="text-white font-medium text-lg">{t('auth.signup.button')}</Text>
              </Pressable>

              {/* অতিরিক্ত টেক্সট */}
              <View className="flex-row justify-center gap-2 mt-4">
                <Text className="text-white/80">{t('auth.signup.haveAccount')}</Text>
                <Pressable onPress={onSignIn}>
                  <Text className="text-blue-400 font-medium">{t('auth.signup.loginHere')}</Text>
                </Pressable>
              </View>

              <View className="flex-row justify-center gap-2">
                <Text className="text-white/80">{t('auth.signin.noAccount')}</Text>
                <Pressable onPress={onSignUp}>
                  <Text className="text-blue-400 font-medium">{t('auth.signin.registerHere')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View className="mt-6">
            {/* Card */}
            <View className="rounded-2xl p-5 border border-white/10" style={{ backgroundColor: '#0F0D23' }}>
              <View className="flex-row items-center gap-4">
                {/* Simple avatar badge with initials */}
                <View className="h-16 w-16 rounded-2xl items-center justify-center border border-white/15" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <Text className="text-white text-2xl font-semibold">{initials}</Text>
                </View>
                <View>
                  <Text className="text-white/70 text-xs">{t('profile.profileId')}</Text>
                  <Text className="text-white font-mono" numberOfLines={1} ellipsizeMode="middle">{user?.id}</Text>
                </View>
              </View>

              <View className="mt-5">
                <Text className="text-white text-xl font-semibold">{user?.name}</Text>
                <Text className="text-white/80">{user?.role} • {user?.address?.city || ''}, {user?.address?.state || ''}</Text>
              </View>

              <View className="mt-5 gap-3">
                <View>
                  <Text className="text-white/60 text-xs">{t('profile.email')}</Text>
                  <Text className="text-white">{user?.email}</Text>
                </View>
                <View>
                  <Text className="text-white/60 text-xs">{t('profile.phone')}</Text>
                  <Text className="text-white">{user?.phone}</Text>
                </View>
                <View>
                  <Text className="text-white/60 text-xs">{t('profile.city')}</Text>
                  <Text className="text-white">{user?.address?.city || ''}</Text>
                </View>
                <View>
                  <Text className="text-white/60 text-xs">{t('profile.street')}</Text>
                  <Text className="text-white">{user?.address?.street || ''}</Text>
                </View>
              </View>

              <View className="mt-6">
                <Text className="text-white/60 text-xs">{t('profile.about')}</Text>
                <Text className="text-white/90">
                  {t('profile.aboutText', {
                    name: user?.name,
                    role: String(user?.role || '').toLowerCase(),
                    city: user?.address?.city || '',
                    state: user?.address?.state || '',
                  })}
                </Text>
              </View>

              <View className="mt-6 flex-row gap-3">
            <Pressable
                  onPress={() => router.push('/(auth)/registration')}
                  className="px-5 py-3 rounded-xl items-center"
                  style={{ backgroundColor: '#1E90FF' }}
                >
                  <Text className="text-white font-medium">{t('profile.update')}</Text>
            </Pressable>
              </View>
            </View>
          </View>
        )}
    </View>
    </Background>
  )
}
