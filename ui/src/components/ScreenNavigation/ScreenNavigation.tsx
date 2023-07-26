import React, { useState } from 'react'
import { Menu, Icon } from 'antd'
import { changeLocation } from '@cxbox-ui/core'
import styles from './ScreenNavigation.less'
import { ClickParam } from 'antd/lib/menu'
import { useSelector } from 'react-redux'
import { AppState } from '../../interfaces/storeSlices'
import Search from 'antd/lib/input/Search'

function ScreenNavigation() {
    const screens = useSelector((state: AppState) => state.session.screens)
    const screenName = useSelector((state: AppState) => state.router.screenName)
    const selectedScreen = screens.find(item => item.name === screenName) || screens.find(screen => screen.defaultScreen) || screens[0]
    const screenUrl = selectedScreen?.url ?? `/screen/${screenName}`
    const handleScreen = (e: ClickParam) => {
        changeLocation(e.key)
    }

    const { filteredValues: filteredScreens, handleSearch } = useLocalSearch({ values: screens, comparisonField: 'text' })

    return (
        <div className={styles.menuContainer}>
            <div className={styles.search}>
                <Search onSearch={handleSearch} />
            </div>
            <Menu className={styles.container} selectedKeys={[screenUrl]} onClick={handleScreen} theme="dark">
                {filteredScreens.map(item => {
                    return (
                        <Menu.Item key={item.url} className={styles.item}>
                            <span className={styles.menuItemLink}>
                                <Icon type={item.icon ? item.icon : 'coffee'} />
                                <span>{item.text}</span>
                            </span>
                        </Menu.Item>
                    )
                })}
            </Menu>
        </div>
    )
}

export default React.memo(ScreenNavigation)

interface UseLocalSearch<T> {
    values: T[]
    comparisonField: string
}

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
