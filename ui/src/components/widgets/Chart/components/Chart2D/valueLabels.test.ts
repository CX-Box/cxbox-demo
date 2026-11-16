import { expect, it, vi } from 'vitest'
import { FieldType, WidgetField } from '@cxbox-ui/schema'
import { getValueLabel } from './valueLabels'

vi.mock('@cxbox-ui/core', async () => await import('@cxbox-ui/schema'))

const field = { key: 'amount', title: 'Amount', type: FieldType.number, digits: 2 } as WidgetField

it('does not enable labels on existing charts or without a value field', () => {
    expect(getValueLabel(field, undefined, 'vertical')).toBeUndefined()
    expect(getValueLabel(undefined, 'inner', 'horizontal')).toBeUndefined()
})

it.each(['vertical', 'horizontal'] as const)(
    'formats %s labels like their numeric field, including zero and negative values',
    orientation => {
        const label = getValueLabel(field, 'inner', orientation)
        if (!label || typeof label.content !== 'function') {
            throw new Error('Value label formatter is missing')
        }
        const content = label.content
        const format = (amount: number | null | undefined) => content({ amount } as never, {} as never, 0) as string

        expect(format(1234.567)).toBe('1\u00a0234,57')
        expect(format(0)).toBe('0,00')
        expect(format(-12.345)).toBe('-12,34')
        for (const value of [null, undefined, Number.NaN, Number.POSITIVE_INFINITY]) {
            expect(format(value)).toBe('')
        }
    }
)

it.each([
    [{ ...field, type: FieldType.percent, digits: 1 }, '12,3 %'],
    [{ ...field, type: FieldType.money, digits: 2, currency: '$' }, '12,35 $']
] as const)('keeps the field format and unit for %j', (meta, expected) => {
    const label = getValueLabel(meta as WidgetField, 'inner', 'horizontal')
    if (!label || typeof label.content !== 'function') {
        throw new Error('Value label formatter is missing')
    }
    expect(label.content({ amount: 12.345 }, {} as never, 0)).toBe(expected)
})

it.each([
    ['horizontal', 10, 'right'],
    ['horizontal', -10, 'right'],
    ['vertical', 10, 'top'],
    ['vertical', -10, 'bottom']
] as const)('places %s outer labels beyond the end of %s bars', (orientation, amount, expected) => {
    const label = getValueLabel(field, 'outer', orientation)
    if (!label || typeof label.position !== 'function') {
        throw new Error('Value label position is missing')
    }
    expect(label.position({ amount }, {} as never, 0)).toBe(expected)
})
