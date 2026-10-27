import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { lastValueFrom } from 'rxjs'
import { DataItem } from '@cxbox-ui/schema'
import { utils } from '@cxbox-ui/core'
import { CxBoxApiInstance } from 'api'
import { useAppSelector } from '@store'
import { actions } from '@actions'
import { selectBcData, selectWidget } from '@selectors/selectors'
import { FIELDS } from '@constants'
import { FilterType } from '@interfaces/filters'
import { AppWidgetMeta, CryptoGeneratorItem } from '@interfaces/widget'
import { buildBcUrl } from '@utils/buildBcUrl'
import { isCadesPluginError } from '@features/cryptoPro'
import { getErrorMessage } from '@components/CryptoGeneratorContent/CryptoGeneratorContent'
import { cryptoProNotification } from '@components/CryptoGeneratorContent/cryptoProErrorMessage'
import {
    createCryptoData,
    CryptoFiles,
    CryptoSettings,
    getCryptoFileBaseNames,
    getCryptoGenerator,
    getSignedDocumentName,
    uploadCryptoData,
    validateEncryptionCertificate
} from '@components/CryptoGeneratorContent/cryptoFile'

/**
 * Element of `massIds_` for one row: files of the row in `options` (keys of `MassOptionType` on the backend),
 * or the result of the row if the frontend could not process it
 */
interface MassCryptoRow {
    id: string
    options?: Record<string, string>
    success?: false
    errorMessage?: string
    /**
     * What the files in `options` were made from, see `getCryptoKey`. It stays in the selected rows and is not sent
     */
    cryptoKey?: string
}

type RowResult = Omit<MassCryptoRow, 'id'>

/**
 * How a run ended: the action is sent, nothing is sent because no row is processed, or the step is left
 */
export type MassCryptoRunResult = 'sent' | 'nothing' | 'left'

export interface MassCryptoProgress {
    done: number
    total: number
}

const toOptions = ({ signature, encrypted }: CryptoFiles): Record<string, string> => ({
    ...(signature && { signatureFileId: signature.id, signatureFileName: signature.name }),
    ...(encrypted && { encryptedFileId: encrypted.id, encryptedFileName: encrypted.name })
})

/**
 * The same settings and the same document file give the same result: such a row is not signed again
 */
const getCryptoKey = ({ generatorType, signaturePackage, signatureType, signCert, encCert }: CryptoSettings, documentFileId: string) =>
    [generatorType, signaturePackage, signatureType, signCert?.thumbprint, encCert?.thumbprint, documentFileId].join('|')

/**
 * Signs and/or encrypts the files of the selected rows one by one, then sends the mass action once.
 *
 * A repeated run, for example after the action failed, sends the files that the rows already got with the same certificates
 * from the same documents and processes only the other rows: the files are not created again.
 *
 * `stop` interrupts the processing at once: the current row is not waited for and gets the error "Interrupted"
 * as the next rows, the processed rows are sent. If no row is processed yet, nothing is sent: `run` gives `nothing`.
 * Leaving the step ends the processing at once and the mass action is not sent: `run` gives `left`.
 * The plugin call already running cannot be cancelled: its plugin window may stay open, but no more plugin calls are made
 * for the row, its files are not uploaded and its result is not kept. Only the files of a row whose upload has started
 * stay in the storage unused.
 */
export const useMassCrypto = (widgetName: string, bcName: string, operationType: string) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const widget = useAppSelector(state => selectWidget(state, widgetName)) as AppWidgetMeta | undefined
    const screenName = useAppSelector(state => state.screen.screenName)
    const selectedRows = useAppSelector(state => state.view.selectedRows[bcName])
    const bcData = useAppSelector(state => selectBcData(state, bcName))
    const cryptoGenerator = getCryptoGenerator(widget, operationType)

    const [progress, setProgress] = useState<MassCryptoProgress | null>(null)
    const [processing, setProcessing] = useState(false)
    // interrupts the run, `null` when nothing runs or the run is already interrupted
    const interruptRef = useRef<(() => void) | null>(null)
    const unmountedRef = useRef(false)

    useEffect(() => {
        return () => {
            unmountedRef.current = true
            interruptRef.current?.()
        }
    }, [])

    const stop = useCallback(() => {
        if (!interruptRef.current) {
            return
        }
        interruptRef.current()
        interruptRef.current = null
    }, [])

    // the text of a row error, as the popup shows it for one record
    const getRowErrorMessage = useCallback(
        (error: unknown, { signCert, encCert }: CryptoSettings) => {
            if (!isCadesPluginError(error)) {
                return getErrorMessage(error)
            }
            const { key, params } = cryptoProNotification(error, { signCert, encCert })
            return t(key, params)
        },
        [t]
    )

    const processRow = useCallback(
        async (
            record: DataItem | undefined,
            settings: CryptoSettings,
            config: CryptoGeneratorItem,
            signal: AbortSignal,
            // the run does not wait for the row any more: nothing is signed or uploaded after that
            isInterrupted: () => boolean
        ): Promise<RowResult> => {
            const fileId = record?.[config.documentFileIdKey!] as string | undefined

            if (!fileId) {
                return { success: false, errorMessage: t('There is no file in this row') }
            }

            try {
                const response = await CxBoxApiInstance.getFile(fileId)
                if (isInterrupted()) {
                    return { success: false, errorMessage: t('Interrupted') }
                }
                const baseNames = getCryptoFileBaseNames(record, config)
                const documentName = record?.[config.documentFileNameKey!] as string | undefined
                const cryptoData = await createCryptoData(response.data, settings, {
                    documentName: getSignedDocumentName(settings.generatorType, documentName, baseNames),
                    signal
                })
                if (isInterrupted()) {
                    return { success: false, errorMessage: t('Interrupted') }
                }
                const files = await uploadCryptoData(cryptoData, settings.generatorType, config, baseNames)

                return files.signature || files.encrypted
                    ? { options: toOptions(files) }
                    : { success: false, errorMessage: t('No files were created') }
            } catch (e) {
                return { success: false, errorMessage: getRowErrorMessage(e, settings) }
            }
        },
        [getRowErrorMessage, t]
    )

    const run = useCallback(
        async (settings: CryptoSettings, send: () => void): Promise<MassCryptoRunResult> => {
            if (!cryptoGenerator || !selectedRows?.length) {
                return 'nothing'
            }

            const ids = selectedRows.map(row => row.id as string)
            const previousRows = new Map((selectedRows as unknown as MassCryptoRow[]).map(row => [row.id, row]))
            const results = new Map<string, RowResult>()
            let interrupted = false
            // stops the plugin calls of the current row, the race below stops waiting for it
            const controller = new AbortController()
            const interruptSignal = new Promise<null>(resolve => {
                interruptRef.current = () => {
                    interrupted = true
                    controller.abort()
                    resolve(null)
                }
            })
            const isInterrupted = () => interrupted

            setProcessing(true)
            setProgress({ done: 0, total: ids.length })

            try {
                // one certificate for all rows: a refused one fails every row at once, without downloading the files
                validateEncryptionCertificate(settings)
                // the previous step loads the selected rows, they are requested again only if they did not fit on its page
                const loadedRecords = bcData?.filter(item => ids.includes(item.id)) ?? []
                // the records are not waited for when interrupted: no row is processed yet
                const records =
                    loadedRecords.length === ids.length
                        ? loadedRecords
                        : await Promise.race([
                              lastValueFrom(
                                  CxBoxApiInstance.fetchBcDataAll(screenName, buildBcUrl(bcName), {
                                      ...utils.getFilters([{ fieldName: FIELDS.TECHNICAL.ID, type: FilterType.equalsOneOf, value: ids }]),
                                      _limit: ids.length
                                  })
                              ),
                              interruptSignal
                          ])
                for (const id of ids) {
                    if (interrupted || !records) {
                        break
                    }

                    const record = records.find(item => item.id === id)
                    const documentFileId = record?.[cryptoGenerator.documentFileIdKey!] as string | undefined
                    const cryptoKey = documentFileId ? getCryptoKey(settings, documentFileId) : undefined
                    const previous = previousRows.get(id)

                    if (cryptoKey && previous?.options && previous.cryptoKey === cryptoKey) {
                        results.set(id, { options: previous.options, cryptoKey })
                        setProgress({ done: results.size, total: ids.length })
                        continue
                    }

                    // neither interrupting nor leaving the step waits for the current row
                    const result: RowResult | null = await Promise.race([
                        processRow(record, settings, cryptoGenerator, controller.signal, isInterrupted),
                        interruptSignal
                    ])

                    if (!result) {
                        break
                    }

                    results.set(id, result.options ? { ...result, cryptoKey } : result)
                    setProgress({ done: results.size, total: ids.length })
                }
            } catch (e) {
                const errorMessage = getRowErrorMessage(e, settings)
                ids.forEach(id => results.has(id) || results.set(id, { success: false, errorMessage }))
            }

            interruptRef.current = null

            if (unmountedRef.current) {
                return 'left'
            }

            setProcessing(false)

            if (interrupted && !results.size) {
                // nothing is processed, so there is nothing to send: the step is shown again
                setProgress(null)
                return 'nothing'
            }

            const rows: MassCryptoRow[] = ids.map(id => ({
                // selectRows merges the fields: undefined clears the values of a previous run of the step
                id,
                options: undefined,
                success: undefined,
                errorMessage: undefined,
                cryptoKey: undefined,
                ...(results.get(id) ?? { success: false, errorMessage: t('Interrupted') })
            }))
            // selected rows keep `options` only to send them with the mass action, DataItem has no object values
            dispatch(actions.selectRows({ bcName, dataItems: rows as unknown as Array<Omit<DataItem, 'vstamp'>> }))
            // the progress stays until the results step; if the action fails, the step is repeated with Back
            send()
            return 'sent'
        },
        [bcData, bcName, cryptoGenerator, dispatch, getRowErrorMessage, processRow, screenName, selectedRows, t]
    )

    return { progress, processing, run, stop }
}
