import { useQuery } from '@tanstack/react-query'
import { CxBoxApiInstance } from '../api'

export const useMeta = () =>
    useQuery({
        queryKey: ['meta'],
        queryFn: () => CxBoxApiInstance.loginByRoleRequest('').toPromise(),
        staleTime: Infinity
    })
