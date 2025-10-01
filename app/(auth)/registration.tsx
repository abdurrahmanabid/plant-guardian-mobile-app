import Background from '@/components/Background'
import api from '@/hooks/api'
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
    const [errors, setErrors] = useState<Record<string, string>>({})

    const roles = useMemo(() => (['Doctor', 'Farmer'] as const), [])

    const onSubmit = async () => {
        // Basic client-side validation
        const nextErrors: Record<string, string> = {}
        if (!name.trim()) nextErrors.name = t('errors.name') as string
        if (!email.trim()) nextErrors.email = t('errors.email.required') as string
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = t('errors.email.format') as string
        if (!password || password.length < 6) nextErrors.password = t('errors.password') as string
        if (!role) nextErrors.role = t('errors.role') as string

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors)
            return
        }

        setLoading(true)
        setErrors({})

        const payload = {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || null,
            password,
            role,
            address: street || city || state
                ? { street: street.trim(), city: city.trim(), state: state.trim() }
                : null,
        }

        try {
            const res = await api.post('/user/signup', payload)
            console.log(res.data)
            const msg = res?.data?.message || (t('success.default', { name: payload.name }) as string)
            Alert.alert(msg)

            // Reset form
            setName('')
            setEmail('')
            setPhone('')
            setPassword('')
            setStreet('')
            setCity('')
            setState('')
            setRole('')

            router.replace('/(auth)/login')
        } catch (err: any) {
            console.log({err: JSON.stringify(err)})
            const status = err?.response?.status

            console.log("status", status)

            const fallbackMsg = (t('errors.server') as string) || 'Something went wrong'
            const networkMsg = 'Network error. Please check your connection and server URL.'
            const msg = err?.response?.data?.message || (err?.message === 'Network Error' ? networkMsg : err?.message) || fallbackMsg

            if (status === 409) {
                const conflictField = err?.response?.data?.field || (msg?.includes('email') ? 'email' : msg?.includes('phone') ? 'phone' : null)
                if (conflictField) setErrors(prev => ({ ...prev, [conflictField]: msg }))
            }

            Alert.alert('Error', String(msg))
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


