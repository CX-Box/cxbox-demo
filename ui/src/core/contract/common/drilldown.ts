/**
 * Types of drilldowns in the application, specified by Cxbox API
 */
export type DrillDownType =
    /**
     * Drilldown to inner entity of the application (screen, view), i.e. url will be places after route hash sy: `#/${inner}`
     */
    | 'inner'
    /**
     * Drilldown to an url relative to the current url: `/${relative}`
     */
    | 'relative'
    /**
     * Drilldown to an url relative to the current url: `/${relative}` that opens in a new browser tab
     */
    | 'relativeNew'
    /**
     * An external redirect, i.e. `http://${external}`
     */
    | 'external'
    /**
     * An external redirect, i.e. `http://${external}` that opens in a new browser tab
     */
    | 'externalNew'
