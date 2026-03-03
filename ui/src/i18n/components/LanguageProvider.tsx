import React, { useEffect, ReactNode } from 'react'
import { ConfigProvider } from 'antd'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { initLocale } from '@i18n'
import { defaultLocale, SUPPORTED_LANGUAGE } from '../constants'
import { antdResources } from '../assets'
import { Lookup } from '@utils/Lookup'
import { useAppSelector } from '@store'

interface LanguageProviderProps {
    children: ReactNode
}

initLocale(defaultLocale)
moment.locale(defaultLocale)

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const externalLanguage = useAppSelector(state => state.session.language)
    const currentLanguage = Lookup.has(SUPPORTED_LANGUAGE, externalLanguage) ? externalLanguage : defaultLocale
    const { i18n } = useTranslation()

    useEffect(() => {
        moment.locale(currentLanguage)

        if (i18n.isInitialized) {
            i18n.changeLanguage(currentLanguage)
        }
    }, [currentLanguage, i18n])

    return (
        <ConfigProvider
            locale={Lookup.has(SUPPORTED_LANGUAGE, currentLanguage) ? antdResources[currentLanguage] : antdResources[defaultLocale]}
        >
            {children}
        </ConfigProvider>
    )
}
