import React, { useCallback, useMemo } from 'react'
import { TableWidget } from '@cxboxComponents'
import { ColumnProps } from 'antd/es/table'
import Pagination from '../../ui/Pagination/Pagination'
import ColumnTitle from '../../ColumnTitle/ColumnTitle'
import { useExpandableForm } from './hooks/useExpandableForm'
import styles from './Table.less'
import { AppWidgetTableMeta } from '@interfaces/widget'
import { TableWidgetOwnProps } from '@cxboxComponents/widgets/TableWidget/TableWidget'
import { interfaces } from '@cxbox-ui/core'
import { useAppSelector } from '@store'
import { useTableSetting } from '@components/widgets/Table/hooks/useTableSetting'
import { useVisibility } from '@components/widgets/Table/hooks/useVisibility'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { actions } from '@actions'
import { buildBcUrl } from '@utils/buildBcUrl'
import { useExportTable } from '@components/widgets/Table/hooks/useExportTable'
import ReactDragListView from 'react-drag-listview'
import { Checkbox, Icon, Menu, Modal, Transfer } from 'antd'
import DropdownSetting from './components/DropdownSetting'
import Operations from '../../Operations/Operations'
import FilterSettingModal from './components/FilterSettingModal'
import { usePresetFilterSettings } from './hooks/usePresetFilterSettings'

export type ControlColumn = { column: ColumnProps<interfaces.DataItem>; position: 'left' | 'right' }
interface TableProps extends TableWidgetOwnProps {
    meta: AppWidgetTableMeta
    primaryColumn?: ControlColumn
}

function Table({ meta, primaryColumn, disablePagination, ...rest }: TableProps) {
    const { expandable, expandIcon, expandIconColumn, getExpandIconColumnIndex, expandedRowRender, expandedRowKeys } =
        useExpandableForm(meta)

    const controlColumns = React.useMemo(() => {
        const resultColumns: Array<ControlColumn> = []

        if (meta.options?.primary?.enabled && primaryColumn) {
            resultColumns.push(primaryColumn as any)
        }

        if (expandIconColumn) {
            resultColumns.push({ column: expandIconColumn, position: 'right' })
        }

        return [...resultColumns]
    }, [expandIconColumn, meta.options?.primary?.enabled, primaryColumn])

    const bc = useAppSelector(state => state.screen.bo.bc[meta.bcName])

    const {
        showColumnSettings,
        allFields,
        resultedFields,
        currentAdditionalFields,
        changeOrder,
        changeColumnVisibility,
        changeColumnsVisibility,
        resetSetting
    } = useTableSetting(meta)

    const normalizedMeta = useMemo(() => ({ ...meta, fields: resultedFields }), [resultedFields, meta])

    const { visible: showCloseButton, toggleVisibility: toggleCloseButtonVisibility } = useVisibility(false)

    const handleColumnClose = useCallback((fieldKey: string) => changeColumnVisibility(fieldKey, false), [changeColumnVisibility])

    const { visible: transferVisible, toggleVisibility: toggleTransferVisible } = useVisibility(false)

    const handleTransferChange = useCallback(
        (nextTargetKeys: string[], direction, moveKeys) => {
            if (direction === 'right') {
                changeColumnsVisibility([...nextTargetKeys], false)
            }

            if (direction === 'left') {
                changeColumnsVisibility(moveKeys, true)
            }
        },
        [changeColumnsVisibility]
    )

    const { visible: filterSettingVisible, toggleVisibility: toggleFilterSettingVisible } = useVisibility(false)

    const { saveCurrentFiltersAsGroup, filterGroups, removeFilterGroup, filtersExist } = usePresetFilterSettings(meta.bcName)

    const handleSaveFilterGroup = useCallback(
        (values: { name: string }) => {
            saveCurrentFiltersAsGroup(values.name)
        },
        [saveCurrentFiltersAsGroup]
    )

    const { t } = useTranslation()

    const dispatch = useDispatch()

    const changeCursor = (rowId: string) => {
        if (rowId !== bc.cursor) {
            dispatch(actions.bcSelectRecord({ bcName: bc.name, cursor: rowId }))
        }
    }

    // TODO the condition is necessary because of editable table cells inside the core, so that there would not be duplicated actions of record change
    const needRowSelectRecord = expandable || normalizedMeta.options?.readOnly

    const bcUrl = useAppSelector(state => state.screen.bo.bc[meta.bcName] && buildBcUrl(meta.bcName, true))
    const operations = useAppSelector(state => state.view.rowMeta?.[meta.bcName]?.[bcUrl]?.actions)

    const { showExport, exportTable } = useExportTable({ widget: meta })

    const showSaveFiltersButton = normalizedMeta.options?.filterSetting?.enabled

    const showSettings = showSaveFiltersButton || showColumnSettings || showExport

    return (
        <div className={styles.tableContainer}>
            <div className={styles.operations}>
                <Operations operations={operations} bcName={meta.bcName} widgetMeta={meta} />

                {showSettings && (
                    <DropdownSetting
                        buttonClassName={styles.settingButton}
                        overlay={
                            <Menu>
                                {showColumnSettings && [
                                    <Menu.Item key="0" onClick={toggleTransferVisible}>
                                        {t('Change visibility')}
                                    </Menu.Item>,
                                    <Menu.Item key="1" onClick={toggleCloseButtonVisibility}>
                                        {t('Enable close buttons')}
                                        <Checkbox checked={showCloseButton} style={{ marginLeft: 5 }} />
                                    </Menu.Item>,
                                    <Menu.Item key="2" onClick={resetSetting}>
                                        {t('Reset table settings')}
                                    </Menu.Item>
                                ]}
                                {showExport && (
                                    <Menu.Item key="3" onClick={exportTable}>
                                        {t('Export to Excel')}
                                        <Icon type="file-excel" style={{ fontSize: 14, marginLeft: 4 }} />
                                    </Menu.Item>
                                )}
                                {showSaveFiltersButton && (
                                    <Menu.Item key="4" onClick={toggleFilterSettingVisible}>
                                        {t('Save filters')}
                                    </Menu.Item>
                                )}
                            </Menu>
                        }
                    />
                )}
            </div>

            <Modal visible={transferVisible} onCancel={toggleTransferVisible} footer={null}>
                <Transfer
                    locale={{ itemUnit: t('column'), itemsUnit: t('columns') }}
                    dataSource={allFields}
                    titles={[t('Main'), t('Additional')]}
                    targetKeys={currentAdditionalFields}
                    onChange={handleTransferChange}
                    render={item => item.title ?? ''}
                    listStyle={{ width: '44%' }}
                />
            </Modal>

            <FilterSettingModal
                filtersExist={filtersExist}
                onDelete={removeFilterGroup}
                filterGroups={filterGroups}
                visible={filterSettingVisible}
                onCancel={toggleFilterSettingVisible}
                onSubmit={handleSaveFilterGroup}
            />

            <ReactDragListView.DragColumn onDragEnd={changeOrder} nodeSelector="th">
                <TableWidget
                    meta={normalizedMeta}
                    showRowActions={true}
                    controlColumns={controlColumns}
                    disablePagination={true}
                    {...rest}
                    columnTitleComponent={props =>
                        props && <ColumnTitle showCloseButton={showCloseButton} onClose={handleColumnClose} {...props} />
                    }
                    expandedRowKeys={expandedRowKeys}
                    allowEdit={!expandable}
                    expandIconColumnIndex={getExpandIconColumnIndex(controlColumns, resultedFields)}
                    expandIconAsCell={false}
                    expandIcon={expandIcon}
                    expandedRowRender={expandedRowRender}
                    rowClassName={record => (record.id === bc.cursor ? 'ant-table-row-selected' : '')}
                    onHeaderRow={() => ({ onDoubleClick: showSettings ? toggleCloseButtonVisibility : undefined })}
                    onRow={record => ({
                        onDoubleClick: needRowSelectRecord ? () => changeCursor(record.id) : undefined
                    })}
                />
            </ReactDragListView.DragColumn>
            {!disablePagination && <Pagination meta={meta} />}
        </div>
    )
}

export default React.memo(Table)
