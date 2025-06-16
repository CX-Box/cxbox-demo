import { useHooks } from '../hooks/useHooks.ts'
import { FC, ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

interface Props {
    children: ReactNode
}

export const ReactQueryProvider: FC<Props> = props => {
    const hooks = useHooks()
    const client = hooks.useQueryClient()

    return (
        <QueryClientProvider client={client}>
            {props.children}
            <ReactQueryDevtools />
        </QueryClientProvider>
    )
}
