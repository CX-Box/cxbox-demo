import { sessionEpics } from './session'
import { viewEpics } from './view'
import { combineEpics } from 'redux-observable'
import { epics } from '@cxbox-ui/core'
import { RootEpic } from '../store'

const mergedEpics = {
    // default epics typings uses CXBoxEpic type, RootEpic is extension of state and api injection
    ...(epics as unknown as Record<string, RootEpic>),
    ...sessionEpics,
    ...viewEpics
}
export const rootEpic = combineEpics(...Object.values(mergedEpics))
