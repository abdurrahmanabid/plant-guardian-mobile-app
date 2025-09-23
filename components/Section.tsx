import React from 'react'
import { Pressable, Text, View } from 'react-native'

type Props = {
  title: string
  text: string
  cta: string
  info: string
  onPress?: () => void
}

export default function Section({ title, text, cta, info, onPress }: Props) {
  return (
    <View className="px-5 py-4">
      <Text className="text-white text-2xl font-semibold mb-3 f">{title}</Text>
      <Text className="text-white/80 mb-5 font-sans">{text}</Text>

      <View className="mt-6 p-4 rounded-2xl" style={{ backgroundColor: '#0F0D23' }}>
        <Text className="text-white mb-3 font-sans font-medium">{info}</Text>
        <Pressable className="self-start px-4 py-2 rounded-full" style={{ backgroundColor: '#1E90FF' }} onPress={onPress}>
          <Text className="text-white font-medium font-sans">{cta}</Text>
        </Pressable>
      </View>
    </View>
  )
}


