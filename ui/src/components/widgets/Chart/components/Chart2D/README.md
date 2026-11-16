# Column2D orientation and values

Use horizontal bars when category labels need more room. The default remains vertical.

```json
"options": {
  "chart2D": {
    "xValueFieldKey": "clientName",
    "yValueFieldKey": "sum",
    "groupFieldKey": "productName",
    "orientation": "horizontal",
    "valuePosition": "inner",
    "maxRows": 3
  }
}
```

`orientation` accepts `vertical` or `horizontal`. Keep the field keys unchanged:
`xValueFieldKey` identifies the category and `yValueFieldKey` the numeric value.
In horizontal mode the category labels are on the vertical axis. Numeric scale
settings (`yMin`, `yMax`, `yStep`) apply to the horizontal value axis.

The legend keeps the standard Column2D placement in either orientation.

`valuePosition` uses the same values as Pie1D: `inner` places numeric labels
inside the bars and `outer` places them beyond the ends. Omit it to keep
labels hidden. Both orientations use the numeric field's type, digits and
currency. Labels stay horizontal, with white text and a black outline. The chart
hides overlapping labels. Labels that reach the plot boundary move inward to stay visible.
Tooltips remain available for every bar.

Groups, stacking, colors, tooltips, record order and drilldowns use the existing
configuration. Table mode, empty states and page limits are unchanged. The existing
**Sales sum per product** chart uses horizontal bars to make client names readable.
The combined sales chart keeps its original position, series and axes, and shows
values inside its columns.

`orientation` applies to standalone `Column2D` widgets. `Line2D` and `DualAxes2D`
retain their existing orientation. `valuePosition` also applies to a `Column2D`
used inside `DualAxes2D`; set it on that child widget. No additional dependency
is required.

`maxRows` limits the drawing container's height in standard Form rows. A row
includes the label, field and spacing, using the same CSS variables as Form.
Omitting it preserves the existing chart size; it has no default row limit.
Only positive integers are accepted. The limit never enlarges a chart.

All chart widgets support this property in their existing options object:
`chart1D`, `chart2D`, `dual2D`, `relationGraph`, `funnelOptions` and
`ringProgressOptions`. A combined chart uses `dual2D.maxRows` for its shared
container. The dashboard charts use `maxRows: 3`.
