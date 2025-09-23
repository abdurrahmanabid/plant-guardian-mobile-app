import Section from '@/components/Section'
import React from 'react'
import { useTranslation } from 'react-i18next'

const Saved = () => {
  const { t } = useTranslation('saved')
  return (
    <Section
      title={t('left-title')}
      text={t('left-text')}
      info={t('right-text')}
      cta={t('right-button')}
    />
  )
}

export default Saved
