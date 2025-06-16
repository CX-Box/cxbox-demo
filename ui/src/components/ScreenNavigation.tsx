import React, { useMemo, useState } from 'react'
import { Menu, MenuProps } from 'antd'
import Search from 'antd/lib/input/Search'
import styles from './ScreenNavigation.module.less'
import { Icon } from './Icon.tsx'
import { useHooks } from '../hooks/useHooks.ts'

type MenuItem = Required<MenuProps>['items'][number]

const getItem = (label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[]): MenuItem => {
    return {
        label,
        key,
        icon,
        children
    }
}

export const ScreenNavigation = () => {
    const hooks = useHooks()
    const location = hooks.useBcLocation()
    const navigate = hooks.useNavigate()
    const { data } = hooks.useMeta()
    const { data: screen } = hooks.useScreenMeta()

    const screenUrl = screen?.url ?? `/screen/${location.bcMap.get('screen')}`

    const handleClick: MenuProps['onClick'] = e => {
        navigate(e.key)
    }

    const { filteredValues: filteredScreens, handleSearch } = useLocalSearch({ values: data?.screens ?? [], comparisonField: 'text' })

    const items = useMemo(() => {
        return filteredScreens.map(screen => getItem(screen.text, screen.url, <Icon type={screen.icon} />))
    }, [filteredScreens])

    return (
        <div>
            <div className={styles.search}>
                <Search onSearch={handleSearch} />
            </div>
            <Menu items={items} data-test="MAIN_MENU" selectedKeys={[screenUrl]} onClick={handleClick} />
        </div>
    )
}

export default React.memo(ScreenNavigation)

interface UseLocalSearch<T> {
    values: T[]
    comparisonField: string
}
/* eslint-disable @typescript-eslint/no-explicit-any */
function useLocalSearch<T extends Record<string, any>>({ comparisonField = 'text', values }: UseLocalSearch<T>) {
    const [searchText, setSearchText] = useState<string>('')

    const filteredValues = searchText.length
        ? values.filter((value: T) => value[comparisonField]?.toLowerCase()?.includes(searchText.toLowerCase()))
        : values

    const handleSearch = (value: unknown) => setSearchText(typeof value === 'string' ? value : '')

    return {
        filteredValues,
        handleSearch
    }
}
