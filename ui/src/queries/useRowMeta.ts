import { useQuery } from '@tanstack/react-query'
import { CxBoxApiInstance } from '../api'
import { useScreenBcMeta, useScreenMeta } from './'

export const useRowMeta = (bcName: string, cursor: string) => {
    const { data: screenMeta } = useScreenMeta()
    const { data: ScreenBcMeta } = useScreenBcMeta(bcName)

    return useQuery({
        queryKey: ['rowMeta'],
        queryFn: () => CxBoxApiInstance.fetchRowMeta(ScreenMeta?.name || '')
    })
}
