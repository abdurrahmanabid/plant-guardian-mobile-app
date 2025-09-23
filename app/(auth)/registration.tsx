import Background from '@/components/Background'
import { useRouter } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'

export default function Registration() {
    const router = useRouter()
    const { t } = useTranslation('registration')

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'Doctor' | 'Farmer' | ''>('')
    const [street, setStreet] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [loading, setLoading] = useState(false)

    const roles = useMemo(() => (['Doctor', 'Farmer'] as const), [])

    const onSubmit = async () => {
        try {
            if (!name) return Alert.alert(t('errors.name'))
            if (!email) return Alert.alert(t('errors.email.required'))
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Alert.alert(t('errors.email.format'))
            if (password.length < 6) return Alert.alert(t('errors.password'))
            if (!role) return Alert.alert(t('errors.role'))

            setLoading(true)
            await new Promise(r => setTimeout(r, 700))
            Alert.alert(t('success.default', { name }))
            router.replace('/(auth)/login')
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
                        <Text className="text-white mb-2">{t('fields.name')}</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder={t('placeholders.name')}
                            placeholderTextColor="#A8B5DB"
                            className="px-4 py-3 rounded-xl text-white"
                            style={{ backgroundColor: '#0F0D23' }}
                        />
                    </View>

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
                        <Text className="text-white mb-2">{t('fields.phone')}</Text>
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            placeholder={t('placeholders.phone')}
                            placeholderTextColor="#A8B5DB"
                            keyboardType="phone-pad"
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

                    <View>
                        <Text className="text-white mb-2">{t('fields.role')}</Text>
                        <View className="flex-row gap-3">
                            {roles.map(r => (
                                <Pressable
                                    key={r}
                                    onPress={() => setRole(r)}
                                    className="px-4 py-2 rounded-xl"
                                    style={{ backgroundColor: role === r ? '#1E90FF' : '#0F0D23' }}
                                >
                                    <Text className="text-white">{t(`roles.${r}`)}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Text className="text-white mb-2">{t('fields.address.street')}</Text>
                            <TextInput
                                value={street}
                                onChangeText={setStreet}
                                placeholder={t('placeholders.address.street')}
                                placeholderTextColor="#A8B5DB"
                                className="px-4 py-3 rounded-xl text-white"
                                style={{ backgroundColor: '#0F0D23' }}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white mb-2">{t('fields.address.city')}</Text>
                            <TextInput
                                value={city}
                                onChangeText={setCity}
                                placeholder={t('placeholders.address.city')}
                                placeholderTextColor="#A8B5DB"
                                className="px-4 py-3 rounded-xl text-white"
                                style={{ backgroundColor: '#0F0D23' }}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white mb-2">{t('fields.address.state')}</Text>
                            <TextInput
                                value={state}
                                onChangeText={setState}
                                placeholder={t('placeholders.address.state')}
                                placeholderTextColor="#A8B5DB"
                                className="px-4 py-3 rounded-xl text-white"
                                style={{ backgroundColor: '#0F0D23' }}
                            />
                        </View>
                    </View>

                    <Pressable onPress={onSubmit} className="px-4 py-3 rounded-xl items-center" style={{ backgroundColor: '#1E90FF' }}>
                        <Text className="text-white font-medium">{loading ? t('buttons.submitting') : t('buttons.submit')}</Text>
                    </Pressable>

                    <View className="flex-row justify-center mt-2">
                        <Pressable onPress={() => router.replace('/(auth)/login')}><Text className="text-white/80">Login</Text></Pressable>
                    </View>
                </View>
            </View>
        </Background>
    )
}


