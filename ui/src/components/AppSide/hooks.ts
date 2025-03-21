import { useAppSelector } from '@store'
import { EFeatureSettingKey, FeatureSetting } from '@interfaces/session'

type InfoItem = Omit<FeatureSetting, 'value'> & { value: string }

export const useAppInfo = (defaultBcColor: string) => {
    const featureSettings = useAppSelector(state => state.session.featureSettings)
    const data = featureSettings?.filter(
        feature =>
            [EFeatureSettingKey.infoEnv, EFeatureSettingKey.infoDescription].includes(feature.key) &&
            feature.value &&
            feature.value !== 'null'
    ) as InfoItem[] | undefined

    const backgroundColor =
        featureSettings?.find(feature => EFeatureSettingKey.infoColor === feature.key && feature.value && feature.value !== 'null')
            ?.value ?? defaultBcColor

    return {
        smallContent: data?.find(item => item.key === EFeatureSettingKey.infoEnv)?.value,
        data,
        backgroundColor
    }
}
