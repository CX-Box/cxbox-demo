import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppWidgetMeta, AppWidgetTableMeta } from '@interfaces/widget'
import Operations from '@components/Operations/Operations'
import { useAppSelector } from '@store'
import Calendar, { CalendarYearApiHandle } from '@components/widgets/CalendarList/CalendarYear'
import ListToggleButton from '@components/widgets/CalendarList/ListToggleButton'
import { useCheckLimit } from '@hooks/useCheckLimit'
import { useTranslation } from 'react-i18next'
import Table from '@components/widgets/Table/Table'
import Filters from '@components/widgets/CalendarList/Filters'
import { mapRefinerKeyToFieldKey } from '@components/widgets/CalendarList/interfaces'
import { useWidgetOperations } from '@hooks/useWidgetOperations'
import { selectBcRecordForm } from '@selectors/selectors'
import { useCalendarDataCheck } from '@components/widgets/CalendarList/hooks/useCalendarDataCheck'

interface CalendarYearListProps {
    meta: AppWidgetMeta
}

const CalendarYearList: React.FC<CalendarYearListProps> = ({ meta: widget }) => {
    const calendarRef = useRef<CalendarYearApiHandle>(null)
    const prevIsListRef = useRef<boolean>(false)
    const recordForm = useAppSelector(selectBcRecordForm(widget.bcName))

    const { t } = useTranslation()
    const operations = useWidgetOperations(widget.name, ['bc', 'mass'])
    const [isList, setIsList] = useState(false)
    const { bcPageLimit, isIncorrectLimit, bcCountForShowing } = useCheckLimit(widget.bcName)
    const { isIncorrectData } = useCalendarDataCheck(widget.name)

    const toggleWidgetView = useCallback(() => {
        setIsList(prev => !prev)
    }, [])

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

    const listToggleButton = (
        <ListToggleButton
            widgetIcon="calendar"
            tooltipTitle={togglerErrorMessage}
            disabled={togglerDisabled}
            isList={enabledListMode}
            onClick={toggleWidgetView}
        />
    )

    const ignoreFieldNames = useMemo(() => {
        const refinerKeyToFieldKeyMapper = mapRefinerKeyToFieldKey(widget?.options?.calendar)

        return [refinerKeyToFieldKeyMapper.start, refinerKeyToFieldKeyMapper.end]
    }, [widget?.options?.calendar])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-color)' }}>
            {enabledListMode ? (
                <>
                    {listToggleButton}
                    <Table meta={widget as AppWidgetTableMeta} />
                </>
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

export default React.memo(CalendarYearList)
