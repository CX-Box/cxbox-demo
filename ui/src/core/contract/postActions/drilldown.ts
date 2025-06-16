import { ActionPostInvoke } from './common'
import { DrillDownType } from '../common'

/**
 * Calling a browser transition to some record
 *
 * @param urlName При выполнении перехода на внешнюю сущность (POST-запрос на пришедший url),
 * этот адрес будет передан в теле запроса (см. CBR-9320 МР и тикет)
 */
export interface ActionPostInvokeDrillDown extends ActionPostInvoke {
    type: 'drillDown'
    /**
     * URL of transition
     */
    url: string
    /**
     * A type of transition
     */
    drillDownType?: DrillDownType | (string & {})
    /**
     * If transition performs to outer entity (POST call),
     * this param will be passed to request body
     */
    urlName?: string
}

export function isActionPostInvokeDrillDown(postAction: ActionPostInvoke): postAction is ActionPostInvokeDrillDown {
    return postAction.type === 'drillDown'
}
