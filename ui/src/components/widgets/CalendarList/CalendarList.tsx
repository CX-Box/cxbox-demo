import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AppWidgetMeta, AppWidgetTableMeta } from '@interfaces/widget'
import Operations from '@components/Operations/Operations'
import { useAppSelector } from '@store'
import Calendar, { CalendarMonthApiHandle } from '@components/widgets/CalendarList/CalendarMonth'
import { useCheckLimit } from '@hooks/useCheckLimit'
import { useTranslation } from 'react-i18next'
import Table from '@components/widgets/Table/Table'
import Filters from '@components/widgets/CalendarList/Filters'
import { mapRefinerKeyToFieldKey } from '@components/widgets/CalendarList/interfaces'
import { useWidgetOperations } from '@hooks/useWidgetOperations'
import { selectBcRecordForm } from '@selectors/selectors'
import { useCalendarMonthDataCheck } from '@components/widgets/CalendarList/hooks/useCalendarMonthDataCheck'
import DropdownSetting from '@components/widgets/Table/components/DropdownSetting'
import { Icon, Menu, Tooltip } from 'antd'

interface CalendarListProps {
    meta: AppWidgetMeta
}

const CalendarList: React.FC<CalendarListProps> = ({ meta: widget }) => {
    const calendarRef = useRef<CalendarMonthApiHandle>(null)
    const prevIsListRef = useRef<boolean>(false)
    const recordForm = useAppSelector(selectBcRecordForm(widget.bcName))

    const { t } = useTranslation()
    const operations = useWidgetOperations(widget.name, ['bc', 'mass'])
    const [isList, setIsList] = useState(false)
    const { bcPageLimit, isIncorrectLimit, bcCountForShowing } = useCheckLimit(widget.bcName)
    const { isIncorrectData } = useCalendarMonthDataCheck(widget.name)

    useEffect(() => {
        if (prevIsListRef.current && !isList) {
            calendarRef.current?.navigateToDateByFilter()
        }
        prevIsListRef.current = isList
    }, [isList])

    useEffect(() => {
        if (isIncorrectLimit || recordForm?.create || isIncorrectData) {
            setIsList(true)
        }
    }, [isIncorrectData, isIncorrectLimit, recordForm?.create])

    const enabledMassMode = useAppSelector(state => state.screen.viewerMode[widget.bcName]?.mode === 'mass')
    const enabledListMode = isList || enabledMassMode

    const togglerErrorMessage = useMemo(() => {
        if (isIncorrectLimit) {
            return t(`Warning! Only List mode available for CalendarList`, {
                limit: bcPageLimit,
                bcCount: bcCountForShowing
            })
        }

        if (isIncorrectData) {
            return t(`There is incorrect data, only table mode is available`)
        }

        return undefined
    }, [bcCountForShowing, bcPageLimit, isIncorrectData, isIncorrectLimit, t])

    const togglerDisabled = isIncorrectLimit || isIncorrectData

    const selectedKeys = useMemo(() => {
        if (isList) {
            return ['list']
        }
        return ['calendar']
    }, [isList])

    const listToggleButton = (
        <DropdownSetting
            overlay={
                <Menu selectedKeys={selectedKeys}>
                    <Menu.ItemGroup key={'mode'} title={t('Mode')}>
                        <Menu.Item key={'calendar'} onClick={() => setIsList(false)} disabled={togglerDisabled}>
                            <Tooltip title={togglerErrorMessage}>
                                <Icon type={'calendar'} />
                                {t('Calendar')}
                            </Tooltip>
                        </Menu.Item>
                        <Menu.Item key={'list'} onClick={() => setIsList(true)}>
                            <Icon type={'table'} />
                            {t('Table')}
                        </Menu.Item>
                    </Menu.ItemGroup>
                </Menu>
            }
        />
    )

    const ignoreFieldNames = useMemo(() => {
        const refinerKeyToFieldKeyMapper = mapRefinerKeyToFieldKey(widget?.options?.calendar)

        return [refinerKeyToFieldKeyMapper.start, refinerKeyToFieldKeyMapper.end]
    }, [widget?.options?.calendar])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-color)' }}>
            {enabledListMode ? (
                <Table meta={widget as AppWidgetTableMeta} settingsComponent={listToggleButton} />
            ) : (
                <>
                    {operations?.length ? <Operations widgetMeta={widget} bcName={widget.bcName} operations={operations} /> : null}
                    <Filters widgetName={widget.name} ignoreFieldNames={ignoreFieldNames} />
                    <Calendar ref={calendarRef} meta={widget} toggleButton={listToggleButton} />
                </>
            )}
        </div>
    )
}

export default React.memo(CalendarList)
