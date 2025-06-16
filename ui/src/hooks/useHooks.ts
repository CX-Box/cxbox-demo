import { HooksFacade } from '../core/hooks/HooksFacade.ts'
import { createContext, useContext } from 'react'
import { Api } from '../api'
import { Navigation } from '../core/data/Navigation.ts'
import { Store } from '../core/data/Store.ts'
import type { UnionState } from '../core/data/slices'
import { createFilterSlice, createModalSlice, createMutationSlice, createBcTreeSlice } from '../core/data/slices'

const navigation = new Navigation()

/**
 * TODO: FIX TYPES
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const store = new Store<UnionState>([createFilterSlice, createModalSlice, createMutationSlice, createBcTreeSlice])

export class Hooks extends HooksFacade<UnionState> {}

export const hooksInstance = new Hooks({ api: Api, store: store, navigation: navigation })

export const HooksContext = createContext(hooksInstance)

export const useHooks = () => useContext(HooksContext)
