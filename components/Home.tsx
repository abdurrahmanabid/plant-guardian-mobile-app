import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Section from './Section'

export default function Home() {
  const { t } = useTranslation('home')
  return (
    <Section
      title={t('left-title')}
      text={t('left-text')}
      info={t('right-text')}
      cta={t('right-button')}
      onPress={() => router.push('/(system)/SoilPredict')}
    />
  )
}


