import { useQuery } from '@tanstack/react-query'
import { CxBoxApiInstance } from '../api'
import { useScreenBcMeta, useScreenMeta } from './'
import { useMemo } from 'react'
import { buildBcKey } from '@utils/buildBcKey'

export const useRowMeta = (bcName: string, enabled: boolean, cursor?: string) => {
    const { data: screenMeta } = useScreenMeta()
    const { data: screenBcMeta } = useScreenBcMeta(bcName)

    const bcKeys = useMemo(() => {
        return buildBcKey(screenBcMeta || [], cursor)
    }, [screenBcMeta, cursor])

    return useQuery({
        queryKey: ['rowMeta', ...bcKeys],
        queryFn: () => CxBoxApiInstance.fetchRowMeta(screenMeta?.name || '', bcKeys?.join('/')).toPromise(),
        enabled: enabled,
        staleTime: 10000
    })
}
