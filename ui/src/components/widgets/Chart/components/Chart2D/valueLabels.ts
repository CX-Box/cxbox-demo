import { ColumnConfig } from '@ant-design/plots/es/components/column'
import { WidgetField } from '@cxbox-ui/schema'
import { normalizeFieldValue } from '@components/TemplatedTitle/utils'
import { Chart2DConfig } from '@interfaces/widget'

export function getValueLabel(
    field: WidgetField | undefined,
    position: Chart2DConfig['valuePosition'],
    orientation: Chart2DConfig['orientation']
): ColumnConfig['label'] {
    if (!field || !position) {
        return undefined
    }

    const inner = position === 'inner'

    return {
        position: inner
            ? 'middle'
            : datum => {
                  const negative = datum[field.key] < 0
                  // Bar's right position follows the value end, including negative values.
                  return orientation === 'horizontal' ? 'right' : negative ? 'bottom' : 'top'
              },
        autoRotate: false,
        offset: inner ? 0 : 8,
        style: {
            fill: '#fff',
            stroke: '#000',
            lineWidth: 1
        },
        content: datum => {
            const value = datum[field.key]
            return typeof value === 'number' && Number.isFinite(value) ? String(normalizeFieldValue(value, field) ?? '') : ''
        },
        layout: [{ type: 'limit-in-plot' }, { type: 'interval-hide-overlap' }]
    }
}
