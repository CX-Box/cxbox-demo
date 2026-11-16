# Column2D orientation and values

Use horizontal bars when category labels need more room. The default remains vertical.

```json
"options": {
  "chart2D": {
    "xValueFieldKey": "clientName",
    "yValueFieldKey": "sum",
    "groupFieldKey": "productName",
    "orientation": "horizontal",
    "valuePosition": "inner"
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
currency. Labels stay horizontal; the chart handles text contrast and hides
overlapping labels. Labels that reach the plot boundary move inward to stay visible.
Tooltips remain available for every bar.

Groups, stacking, colors, tooltips, record order and drilldowns use the existing
configuration. Table mode, empty states and page limits are unchanged. The
dashboard includes grouped vertical and horizontal **Sales sum per product** examples.

This option applies to standalone `Column2D` widgets. `Line2D` and `DualAxes2D`
retain their existing orientation. No additional dependency is required.
