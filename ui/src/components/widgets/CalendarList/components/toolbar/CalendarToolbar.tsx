import React from 'react'
import { Button, Radio } from 'antd'
import { useTranslation } from 'react-i18next'
import { ToolbarSize } from '@components/widgets/CalendarList/constants'
import { CalendarToolbarLayout } from '@components/widgets/CalendarList/components/toolbar/CalendarToolbarLayout'
import CalendarTitle from '@components/widgets/CalendarList/components/toolbar/CalendarTitle'

interface CalendarToolbarProps<T = string> {
    mode?: 'month' | 'year'
    title: string
    currentDate: Date
    onDateChange: (date: Date) => void
    viewList?: { value: T; title: string }[]
    view: T
    size?: ToolbarSize
    onPrev: () => void
    onNext: () => void
    onToday: () => void
    onViewChange: (e: any) => void
    disableFilter?: boolean
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
    title,
    viewList = [],
    mode = 'month',
    currentDate,
    onDateChange,
    view,
    size = 'default',
    onPrev,
    onNext,
    onToday,
    onViewChange,
    disableFilter
}) => {
    const { t } = useTranslation()

    return (
        <CalendarToolbarLayout
            leftControls={[
                <Button.Group key="arrows" size={size}>
                    <Button onClick={onPrev} icon="left" data-test-widget-calendar-prev={true} />
                    <Button onClick={onNext} icon="right" data-test-widget-calendar-next={true} />
                </Button.Group>,
                <Button key="today" onClick={onToday} size={size} type="link" data-test-widget-calendar-today={true}>
                    {t('Today')}
                </Button>
            ]}
            title={
                <CalendarTitle
                    currentDate={currentDate}
                    mode={mode}
                    onDateChange={onDateChange}
                    title={title}
                    disableFilter={disableFilter}
                />
            }
            rightControls={
                viewList.length ? (
                    <Radio.Group value={view} onChange={onViewChange} size={size}>
                        {viewList.map(item => (
                            <Radio.Button key={item.value} value={item.value}>
                                <span data-test-widget-calendar-view={item.value}>{item.title}</span>
                            </Radio.Button>
                        ))}
                    </Radio.Group>
                ) : undefined
            }
        />
    )
}

export default React.memo(CalendarToolbar)
