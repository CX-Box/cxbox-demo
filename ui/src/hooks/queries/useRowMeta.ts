import { useQuery } from '@tanstack/react-query'
import { CxBoxApiInstance } from '../../api'
import { useScreenBcPath, useScreenMeta } from './'
import { useMemo } from 'react'
import { buildBcKey } from '@utils/buildBcKey'

export const useRowMeta = (bcName: string) => {
    const { data: screenMeta } = useScreenMeta()
    const { bcPathKeys, cursor } = useScreenBcPath(bcName)

    return useQuery({
        queryKey: ['rowMeta', ...bcPathKeys],
        queryFn: () => CxBoxApiInstance.fetchRowMeta(screenMeta?.name || '', bcPathKeys?.join('/')).toPromise(),
        enabled: cursor !== null,
        staleTime: 10000
    })
}
