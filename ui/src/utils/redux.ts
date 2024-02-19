import { Dispatch } from 'redux'
import { MapDispatchToPropsFactory } from 'react-redux'

type Nullable<T> = T | null

/**
 * TODO: JSDoc
 */
class ActionsContext<T> {
    /**
     * TODO
     */
    dispatch: Nullable<Dispatch<any>> = null

    /**
     * TODO
     */
    props: Nullable<T> = null
}

/**
 * TODO: JSDoc
 *
 * @param contextCreator
 * @param actionsCreator
 */
export function createMapDispatchToProps<ContextProps, Actions, OwnProps>(
    contextCreator: (props: OwnProps) => ContextProps,
    actionsCreator: (context: ActionsContext<ContextProps>) => Actions
): MapDispatchToPropsFactory<Actions, OwnProps> {
    return (initDispatch, initProps) => {
        const context = new ActionsContext<ContextProps>()
        const actions = actionsCreator(context)
        context.dispatch = initDispatch
        return (dispatch, props) => {
            context.props = contextCreator(props)
            return actions
        }
    }
}
