import React, { useEffect, useState } from 'react'
import cn from 'classnames'
import { Menu, Icon } from 'antd'
import { ClickParam } from 'antd/lib/menu'
import { useAppSelector } from '@store'
import Search from 'antd/lib/input/Search'
import styles from './ScreenNavigation.less'
import { useChangeLocation } from '@router'

const selectedItemClass = 'selectedItem'

function ScreenNavigation() {
    const screens = useAppSelector(state => state.session.screens)
    const screenName = useAppSelector(state => state.router.screenName)
    const selectedScreen = screens.find(item => item.name === screenName) || screens.find(screen => screen.defaultScreen) || screens[0]
    const screenUrl = selectedScreen?.url ?? `/screen/${screenName}`
    const changeLocation = useChangeLocation({ forceUpdate: true })
    const menuCollapsed = useAppSelector(state => state.screen.menuCollapsed)
    const handleScreen = (e: ClickParam) => {
        changeLocation(e.key)
    }

    const featureSettings = useAppSelector(state => state.session.featureSettings)
    const wordWrapEnabled = featureSettings?.find(setting => setting?.key === 'sideBarWordBreak')?.value === 'auto'
    const sideBarSearchEnabled = featureSettings?.find(setting => setting?.key === 'sideBarSearchEnabled')?.value !== 'false'

    const { filteredValues: filteredScreens, handleSearch } = useLocalSearch({ values: screens, comparisonField: 'text' })

    useEffect(() => {
        // can't use .ant-menu-item-selected because dom nodes changes it too slowly
        const selectedItem = document.querySelector(`.${CSS.escape(styles.item)}.${selectedItemClass}`)
        selectedItem?.scrollIntoView()
    }, [screenUrl])

    const menuSearch = !menuCollapsed && (
        <div className={styles.search}>
            <Search onSearch={handleSearch} />
        </div>
    )

    return (
        <div className={styles.menuContainer}>
            {sideBarSearchEnabled && menuSearch}
            <Menu className={styles.container} data-test="MAIN_MENU" selectedKeys={[screenUrl]} onClick={handleScreen} theme="dark">
                {filteredScreens.map(item => {
                    return (
                        <Menu.Item
                            key={item.url}
                            className={cn(styles.item, {
                                [selectedItemClass]: screenUrl === item.url,
                                [styles.breakRow]: wordWrapEnabled
                            })}
                            data-test="MAIN_MENU_ITEM"
                            title={item.text}
                        >
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
