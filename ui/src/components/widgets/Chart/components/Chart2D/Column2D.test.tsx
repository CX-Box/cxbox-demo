import React from 'react'
import { beforeEach, expect, it, vi } from 'vitest'
import { ColumnConfig } from '@ant-design/plots/es/components/column'
import { renderToStaticMarkup } from 'react-dom/server'
import { Bar, Column } from '@ant-design/plots'
import Column2D from './Column2D'
import { FieldType } from '@cxbox-ui/schema'

vi.mock('@ant-design/plots', () => ({ Bar: vi.fn(() => null), Column: vi.fn(() => null) }))
vi.mock('@cxbox-ui/core', async () => await import('@cxbox-ui/schema'))

const makeConfig = (): ColumnConfig => ({
    data: [
        { id: 'a', category: 'A', amount: 0, series: 'Current' },
        { id: 'b', category: 'B', amount: -12, series: 'Previous' }
    ],
    xField: 'category',
    yField: 'amount',
    xAxis: { title: { text: 'Category' } },
    yAxis: { min: -20, max: 100, tickInterval: 20, title: { text: 'Amount' } },
    seriesField: 'series',
    isGroup: true,
    isStack: false,
    color: ['#123456', '#abcdef'],
    tooltip: { showTitle: true },
    legend: { position: 'top' },
    onReady: vi.fn()
})

beforeEach(() => {
    vi.clearAllMocks()
})

it.each([undefined, 'vertical'] as const)('keeps the existing column configuration for %s orientation', orientation => {
    const config = makeConfig()
    renderToStaticMarkup(<Column2D config={config} orientation={orientation} />)
    expect(vi.mocked(Column).mock.calls[0][0]).toEqual(config)
    expect(Bar).not.toHaveBeenCalled()
})

it('places category labels on the vertical axis and keeps the value scale on the horizontal axis', () => {
    const config = makeConfig()
    renderToStaticMarkup(<Column2D config={config} orientation="horizontal" />)
    const props = vi.mocked(Bar).mock.calls[0][0]
    expect(props.xField).toBe('amount')
    expect(props.yField).toBe('category')
    expect(props.xAxis).toBe(config.yAxis)
    expect(props.yAxis).toBe(config.xAxis)
    expect(Column).not.toHaveBeenCalled()
})

it.each([false, true])('preserves records, grouping, colors, tooltips and drilldowns with stack=%s', isStack => {
    const config = { ...makeConfig(), isStack, isGroup: !isStack }
    renderToStaticMarkup(<Column2D config={config} orientation="horizontal" />)
    const props = vi.mocked(Bar).mock.calls[0][0]
    for (const key of ['data', 'seriesField', 'isStack', 'isGroup', 'color', 'tooltip', 'legend', 'onReady'] as const) {
        expect(props[key]).toBe(config[key])
    }
    expect(props.data.map(row => row.amount)).toEqual([0, -12])
})

it('preserves explicitly hidden axes and does not invent values for empty data', () => {
    const config: ColumnConfig = { ...makeConfig(), data: [], xAxis: false, yAxis: false }
    renderToStaticMarkup(<Column2D config={config} orientation="horizontal" />)
    expect(vi.mocked(Bar).mock.calls[0][0]).toMatchObject({ data: [], xAxis: false, yAxis: false })
})

it.each([false, true])('keeps the standard column legend position when stack=%s', isStack => {
    const config: ColumnConfig = { ...makeConfig(), isStack, legend: { radio: { style: { r: 0 } } } }
    renderToStaticMarkup(<Column2D config={config} orientation="horizontal" />)
    expect(vi.mocked(Bar).mock.calls[0][0].legend).toEqual({
        radio: { style: { r: 0 } },
        position: isStack ? 'right-top' : 'top-left'
    })
})

it.each(['horizontal', 'vertical'] as const)('preserves a hidden legend in %s mode', orientation => {
    const config: ColumnConfig = Object.freeze({ ...makeConfig(), legend: false })
    renderToStaticMarkup(<Column2D config={config} orientation={orientation} />)
    const chart = orientation === 'horizontal' ? vi.mocked(Bar) : vi.mocked(Column)
    expect(chart.mock.calls[0][0]).toMatchObject({ legend: false })
})

it('maps column appearance to the matching bar options without changing the source configuration', () => {
    const config = Object.freeze({
        ...makeConfig(),
        columnStyle: { cursor: 'pointer' },
        columnWidthRatio: 0.5,
        minColumnWidth: 8,
        maxColumnWidth: 30,
        columnBackground: { style: { fill: '#eeeeee' } }
    })
    renderToStaticMarkup(<Column2D config={config} orientation="horizontal" />)
    const props = vi.mocked(Bar).mock.calls[0][0]
    expect(props).toMatchObject({
        barStyle: config.columnStyle,
        barWidthRatio: 0.5,
        minBarWidth: 8,
        maxBarWidth: 30,
        barBackground: config.columnBackground
    })
    expect(props).not.toHaveProperty('columnStyle')
    expect(config.xField).toBe('category')
})

it.each(['horizontal', 'vertical'] as const)(
    'shows numeric values in %s bars without changing their data or click handler',
    orientation => {
        const config = makeConfig()
        renderToStaticMarkup(
            <Column2D
                config={config}
                orientation={orientation}
                valuePosition="inner"
                valueField={{ key: 'amount', title: 'Amount', type: FieldType.number, digits: 0 }}
            />
        )
        const chart = orientation === 'horizontal' ? vi.mocked(Bar) : vi.mocked(Column)
        const props = chart.mock.calls[0][0]
        expect(props.data).toBe(config.data)
        expect(props.onReady).toBe(config.onReady)
        expect(props.label).toMatchObject({ position: 'middle', autoRotate: false })
        expect(config).not.toHaveProperty('label')
    }
)
