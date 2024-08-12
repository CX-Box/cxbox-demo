import { useQuery } from '@tanstack/react-query'
import { CxBoxApiInstance } from '../api'
import { useBcLocation } from '@hooks/useBcLocation'
import { BcMeta, LoginResponse } from '@cxbox-ui/core'
import { firstValueFrom } from 'rxjs'

export const useMeta = <TData = LoginResponse>(select?: (data: LoginResponse) => TData) =>
    useQuery({
        queryKey: ['meta'],
        queryFn: () => firstValueFrom(CxBoxApiInstance.loginByRoleRequest('')),
        staleTime: Infinity,
        select: select
    })
