import React, { ReactNode } from 'react'
import { Icon, Menu, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { ReactComponent as HierarchySVG } from '@assets/icons/hierarchy.svg'
import Button from '@components/ui/Button/Button'
import styles from '../Table.less'
import DropdownSetting from './DropdownSetting'
import { TREE_SEARCH_MODES } from '@constants/tree'

interface TableSettingsProps {
    customSettings?: ReactNode
    showSettings?: boolean
    showColumnSettings: boolean
    showExport?: boolean
    showSaveFiltersButton?: boolean
    enabledGrouping: boolean
    isGroupingHierarchy?: boolean
    isIncorrectLimit: boolean
    bcPageLimit: number
    bcCountForShowing: number | string
    showUp: boolean
    onChangeColumns: () => void
    onResetColumns: () => void
    onExport: () => void
    onSaveFilters: () => void
    onCollapseAll: () => void
    onChangeGroupingMode: (enabled: boolean) => void
    onScrollToTop: () => void
    showPaginationLimit?: boolean
    availableLimitsList?: number[]
    paginationLimit?: number
    onChangePaginationLimit?: (limit: number) => void
    showSearchMode?: boolean
    searchMode?: string
    onChangeSearchMode?: (searchMode: string) => void
}

function TableSettings({
    customSettings,
    showSettings,
    showColumnSettings,
    showExport,
    showSaveFiltersButton,
    enabledGrouping,
    isGroupingHierarchy,
    isIncorrectLimit,
    bcPageLimit,
    bcCountForShowing,
    showUp,
    onChangeColumns,
    onResetColumns,
    onExport,
    onSaveFilters,
    onCollapseAll,
    onChangeGroupingMode,
    onScrollToTop,
    showPaginationLimit,
    availableLimitsList = [],
    paginationLimit,
    onChangePaginationLimit,
    showSearchMode,
    searchMode,
    onChangeSearchMode
}: TableSettingsProps) {
    const { t } = useTranslation()

    if (customSettings) {
        return <>{customSettings}</>
    }

    if (!showSettings) {
        return null
    }

    const selectedKeys = isGroupingHierarchy ? [enabledGrouping ? 'grouping_enabled' : 'grouping_disabled'] : []

    if (showSearchMode && searchMode !== undefined) {
        selectedKeys.push(`search-mode-${searchMode}`)
    }

    if (showPaginationLimit && paginationLimit !== undefined) {
        selectedKeys.push(`pagination-limit-${paginationLimit}`)
    }

    const limitWarning = isIncorrectLimit
        ? t('Warning! Only List mode available for Grouping Hierarchy', {
              limit: bcPageLimit,
              bcCount: bcCountForShowing
          })
        : undefined

    return (
        <>
            <DropdownSetting
                overlay={
                    <Menu selectedKeys={selectedKeys}>
                        {showColumnSettings && (
                            <Menu.ItemGroup key="additionalColumns" title={t('Additional columns')}>
                                <Menu.Item key="0" onClick={onChangeColumns}>
                                    {t('Change')}
                                </Menu.Item>
                                <Menu.Item key="1" onClick={onResetColumns}>
                                    {t('Reset')}
                                </Menu.Item>
                            </Menu.ItemGroup>
                        )}
                        {showExport && (
                            <Menu.ItemGroup key="export" title={t('Export to')}>
                                <Menu.Item key="3" onClick={() => onExport()}>
                                    {t('Excel')}
                                    <Icon type="file-excel" style={{ fontSize: 14, marginLeft: 4 }} />
                                </Menu.Item>
                            </Menu.ItemGroup>
                        )}
                        {showSaveFiltersButton && (
                            <Menu.ItemGroup key="filtersSettings" title={t('Filters settings')}>
                                <Menu.Item key="4" onClick={onSaveFilters}>
                                    {t('Save filters')}
                                </Menu.Item>
                            </Menu.ItemGroup>
                        )}
                        {showPaginationLimit && (
                            <Menu.ItemGroup key="availableLimitList" title={t('Available Limit List')}>
                                {availableLimitsList.map(limit => (
                                    <Menu.Item key={`pagination-limit-${limit}`} onClick={() => onChangePaginationLimit?.(limit)}>
                                        {t('limit / page', { limit })}
                                    </Menu.Item>
                                ))}
                            </Menu.ItemGroup>
                        )}
                        {showSearchMode && (
                            <Menu.ItemGroup key="searchMode" title={t('Search Mode')}>
                                {Object.values(TREE_SEARCH_MODES).map(searchMode => (
                                    <Menu.Item key={`search-mode-${searchMode}`} onClick={() => onChangeSearchMode?.(searchMode)}>
                                        {t(searchMode)}
                                    </Menu.Item>
                                ))}
                            </Menu.ItemGroup>
                        )}
                        {enabledGrouping && (
                            <Menu.ItemGroup key="grouping" title={t('Grouping')}>
                                <Menu.Item onClick={onCollapseAll}>{t('Collapse all')}</Menu.Item>
                            </Menu.ItemGroup>
                        )}
                        {isGroupingHierarchy && (
                            <Menu.ItemGroup key="mode" title={t('Mode')}>
                                <Menu.Item key="grouping_enabled" disabled={isIncorrectLimit} onClick={() => onChangeGroupingMode(true)}>
                                    <Tooltip title={limitWarning} trigger="hover">
                                        <Icon component={HierarchySVG} />
                                        {t('Hierarchy')}
                                    </Tooltip>
                                </Menu.Item>
                                <Menu.Item key="grouping_disabled" onClick={() => onChangeGroupingMode(false)}>
                                    <Icon type="table" />
                                    {t('Table')}
                                </Menu.Item>
                            </Menu.ItemGroup>
                        )}
                    </Menu>
                }
            />
            {isGroupingHierarchy && (
                <div
                    style={{
                        display: showUp ? 'flex' : 'none',
                        position: 'absolute',
                        alignItems: 'center',
                        top: 0,
                        bottom: 0
                    }}
                >
                    <Button className={styles.moveToTop} type="empty" onClick={() => onScrollToTop()} icon="arrow-up" />
                </div>
            )}
            {isGroupingHierarchy && isIncorrectLimit && (
                <Tooltip title={limitWarning} trigger="hover">
                    <Icon type="warning" className={styles.limitWarningIcon} />
                </Tooltip>
            )}
        </>
    )
}

export default React.memo(TableSettings)
