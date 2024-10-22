import { useQuery } from '@tanstack/react-query'
import { CxBoxApiInstance } from '../../api'
import { useScreenBcPath, useScreenMeta } from './'
import { useMemo } from 'react'
import { buildBcKey } from '@utils/buildBcKey'

export const useRowMeta = (bcName: string) => {
    const { data: screenMeta } = useScreenMeta()
    const { thisBcPath, cursor } = useScreenBcPath(bcName)

    const metaPath = cursor && thisBcPath ? `${thisBcPath}/${cursor}` : ''

    return useQuery({
        queryKey: ['rowMeta', metaPath],
        queryFn: () => CxBoxApiInstance.fetchRowMeta(screenMeta?.name || '', metaPath).toPromise(),
        enabled: cursor !== null,
        staleTime: 10000
    })
}
