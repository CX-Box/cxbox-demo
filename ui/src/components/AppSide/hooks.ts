import { useAppSelector } from '@store'
import { EFeatureSettingKey, FeatureSetting } from '@interfaces/session'
import { useEffect, useRef, useState } from 'react'

type InfoItem = Omit<FeatureSetting, 'value'> & { value: string; isPinned: boolean }

export const useAppInfo = (defaultBcColor: string) => {
    const featureSettings = useAppSelector(state => state.session.featureSettings)
    const data = featureSettings?.filter(
        feature => [EFeatureSettingKey.appInfoEnv, EFeatureSettingKey.apInfoDescription].includes(feature.key) && feature.value
    ) as InfoItem[] | undefined

    const backgroundColor =
        featureSettings?.find(feature => EFeatureSettingKey.appInfoColor === feature.key && feature.value)?.value ?? defaultBcColor

    return {
        data: data?.map(item => (item.key === EFeatureSettingKey.appInfoEnv ? { ...item, isPinned: true } : item)),
        backgroundColor
    }
}

// Resolves an issue with element twitching when expanding
export const useHeightLimiter = (collapsed: boolean) => {
    const rootRef = useRef<HTMLDivElement>(null)

    const [maxHeight, setMaxHeight] = useState<number | null>(null)

    useEffect(() => {
        if (!collapsed && maxHeight === null) {
            setTimeout(() => {
                setMaxHeight(rootRef.current?.offsetHeight ?? null)
            }, 0)
        }
    }, [maxHeight, collapsed, rootRef])

    return { contentRef: rootRef, contentMaxHeight: (collapsed ? null : maxHeight) ?? undefined }
}
