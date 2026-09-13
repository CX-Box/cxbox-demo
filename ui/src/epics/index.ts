import { sessionEpics } from './session'
import { viewEpics } from './view'
import { combineEpics } from 'redux-observable'
import { epics } from '@cxbox-ui/core'
import { screenEpics } from './screen'
import { RootEpic } from '@store'
import { dataEpics } from './data'
import { routerEpics } from './router'
import { treeEpics } from './tree'

const coreEpics = { ...epics } as unknown as Record<string, RootEpic>

const mergedEpics = {
    ...coreEpics,
    ...sessionEpics,
    ...treeEpics,
    ...viewEpics,
    ...screenEpics,
    ...dataEpics,
    ...routerEpics
}

export const rootEpic = combineEpics(...Object.values(mergedEpics))
