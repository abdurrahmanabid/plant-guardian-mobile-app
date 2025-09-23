import Background from '@/components/Background';
import i18n from '@/src/i18n';
import { useRouter } from 'expo-router'; // বা আপনার রাউটিং লাইব্রেরি অনুযায়ী
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

export default function Profile() {
  const { t } = useTranslation('profile')
  const router = useRouter() // রাউটিং হুক

  const [hasProfile, setHasProfile] = useState(false)

  const onSignIn = () => {
    // সাইন ইন পেজে রিডাইরেক্ট
    router.push('/(auth)/login')
  }

  const onSignUp = () => {
    // সাইন আপ পেজে রিডাইরেক্ট
    router.push('/(auth)/registration')
  }

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

        {!hasProfile ? (
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
          // যদি প্রোফাইল থাকে (ভবিষ্যতের জন্য রেখে দেওয়া)
          <View className="items-center mt-8">
            <Text className="text-white text-lg mb-4">আপনার প্রোফাইল আছে!</Text>
            <Pressable
              onPress={() => setHasProfile(false)}
              className="px-6 py-3 rounded-xl"
              style={{ backgroundColor: '#2E8B57' }}
            >
              <Text className="text-white font-medium">লগআউট</Text>
            </Pressable>
          </View>
        )}
    </View>
    </Background>
  )
}