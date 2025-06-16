import { FC, useCallback, useMemo } from 'react'
import { WidgetAnyProps } from '../components/Widget.tsx'
import { useHooks } from '../hooks/useHooks.ts'
import { Tabs, TabsProps } from 'antd'
import { isViewNavigationGroup, isViewNavigationItem } from '../core/contract/appMeta.ts'

export const SecondLevelMenu: FC<WidgetAnyProps> = () => {
    const hooks = useHooks()
    const { data: screenMeta } = hooks.useScreenMeta()
    const screenName = hooks.useScreenName()
    const viewName = hooks.useViewName()
    const navigate = hooks.useNavigate()
    const items = useMemo(() => {
        const acc: TabsProps['items'] = []
        screenMeta?.meta?.navigation?.menu?.forEach(itemOrGroup => {
            if (isViewNavigationGroup(itemOrGroup)) {
                itemOrGroup.child.forEach(secondLevelItem => {
                    if (isViewNavigationItem(secondLevelItem)) {
                        acc.push({ key: secondLevelItem.viewName, label: itemOrGroup.title })
                    }
                })
            }
        })
        return acc
    }, [screenMeta?.meta?.navigation?.menu])

    const handleTabClick = useCallback(
        (key: string) => {
            if (screenName) {
                navigate(['/screen', screenName, 'view', key].join('/'))
            }
        },
        [navigate, screenName]
    )

    return <Tabs type={'card'} items={items} onTabClick={handleTabClick} activeKey={viewName} />
}
