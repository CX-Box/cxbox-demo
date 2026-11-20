import { registerGeometryLabelLayout } from '@antv/g2'

interface Bounds {
    minX: number
    maxX: number
    minY: number
    maxY: number
}

const gap = 4
const inset = 2

/** Finds the nearest free position along the value axis, within the bar's length. */
function findOffset(box: Bounds, bar: Bounds, placed: Bounds[], horizontal: boolean): number | undefined {
    const start = horizontal ? 'minX' : 'minY'
    const end = horizontal ? 'maxX' : 'maxY'
    const crossStart = horizontal ? 'minY' : 'minX'
    const crossEnd = horizontal ? 'maxY' : 'maxX'
    const minimum = bar[start] + inset - box[start]
    const maximum = bar[end] - inset - box[end]

    if (minimum > maximum) {
        return undefined
    }

    const blocked = placed
        .filter(other => box[crossStart] < other[crossEnd] + gap && box[crossEnd] > other[crossStart] - gap)
        .map(other => ({ start: other[start] - gap - box[end], end: other[end] + gap - box[start] }))
        .sort((a, b) => a.start - b.start)

    let best: number | undefined
    let cursor = minimum
    const consider = (from: number, to: number) => {
        if (from <= to) {
            const offset = Math.max(from, Math.min(0, to))
            if (best === undefined || Math.abs(offset) < Math.abs(best)) {
                best = offset
            }
        }
    }

    for (const interval of blocked) {
        if (interval.end < cursor) {
            continue
        }
        consider(cursor, Math.min(interval.start, maximum))
        cursor = Math.max(cursor, interval.end)
        if (cursor > maximum) {
            break
        }
    }
    consider(cursor, maximum)
    return best
}

registerGeometryLabelLayout('interval-shift-overlap', (_items, labels, shapes) => {
    const placed: Bounds[] = []
    labels.forEach((label, index) => {
        const shape = shapes[index]
        const coordinate = label.get('coordinate')
        const text = label.find(child => child.get('type') === 'text')
        if (!shape || !coordinate || !text) {
            return
        }

        const horizontal = coordinate.isTransposed
        const box = label.getCanvasBBox()
        // During updates G2 supplies detached target shapes from its offscreen group.
        const offset = findOffset(box, shape.getBBox(), placed, horizontal)
        if (offset === undefined) {
            label.hide()
            return
        }

        label.show()
        // G2 updates text attributes on resize; it does not copy the label group's transform.
        const axis = horizontal ? 'x' : 'y'
        text.attr(axis, text.attr(axis) + offset)
        placed.push(label.getCanvasBBox())
    })
})
