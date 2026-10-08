import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { lastValueFrom } from 'rxjs'
import { DataItem } from '@cxbox-ui/schema'
import { utils } from '@cxbox-ui/core'
import { CxBoxApiInstance } from 'api'
import { useAppSelector } from '@store'
import { actions } from '@actions'
import { selectWidget } from '@selectors/selectors'
import { FIELDS } from '@constants'
import { FilterType } from '@interfaces/filters'
import { AppWidgetMeta, CryptoGeneratorItem } from '@interfaces/widget'
import { buildBcUrl } from '@utils/buildBcUrl'
import { getErrorMessage } from '@components/CryptoGeneratorContent/CryptoGeneratorContent'
import {
    createCryptoData,
    CryptoFiles,
    CryptoSettings,
    getCryptoFileBaseNames,
    getCryptoGenerator,
    uploadCryptoData
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
    [generatorType, signaturePackage, signatureType, signCert?.publicKeyValue, encCert?.publicKeyValue, documentFileId].join('|')

/**
 * Signs and/or encrypts the files of the selected rows one by one, then sends the mass action once.
 *
 * A repeated run, for example after the action failed, sends the files that the rows already got with the same certificates
 * from the same documents and processes only the other rows: the files are not created again.
 *
 * `stop` interrupts the processing at once: the current row is not waited for and gets the error "Interrupted"
 * as the next rows, the processed rows are sent. If no row is processed yet, nothing is sent: `run` gives `false`.
 * Leaving the step ends the processing at once and the mass action is not sent.
 * The CryptoPro plugin cannot be cancelled, so the current row goes on in the background and its plugin window may stay
 * open, but it is not signed after the file is downloaded, its files are not uploaded after the signing and its result
 * is not kept. Only the files of a row whose upload has started stay in the storage unused.
 */
export const useMassCrypto = (widgetName: string, bcName: string, operationType: string) => {
    const { t } = useTranslation()
    const dispatch = useDispatch()
    const widget = useAppSelector(state => selectWidget(state, widgetName)) as AppWidgetMeta | undefined
    const screenName = useAppSelector(state => state.screen.screenName)
    const selectedRows = useAppSelector(state => state.view.selectedRows[bcName])
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

    const processRow = useCallback(
        async (
            record: DataItem | undefined,
            settings: CryptoSettings,
            config: CryptoGeneratorItem,
            verify: boolean,
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
                const cryptoData = await createCryptoData(response.data, settings, verify)
                if (isInterrupted()) {
                    return { success: false, errorMessage: t('Interrupted') }
                }
                const files = await uploadCryptoData(cryptoData, settings.generatorType, config, getCryptoFileBaseNames(record, config))

                return files.signature || files.encrypted
                    ? { options: toOptions(files) }
                    : { success: false, errorMessage: t('No files were created') }
            } catch (e) {
                return { success: false, errorMessage: getErrorMessage(e) }
            }
        },
        [t]
    )

    const run = useCallback(
        async (settings: CryptoSettings, send: () => void): Promise<boolean> => {
            if (!cryptoGenerator || !selectedRows?.length) {
                return false
            }

            const ids = selectedRows.map(row => row.id as string)
            const previousRows = new Map((selectedRows as unknown as MassCryptoRow[]).map(row => [row.id, row]))
            const results = new Map<string, RowResult>()
            let interrupted = false
            const interruptSignal = new Promise<null>(resolve => {
                interruptRef.current = () => {
                    interrupted = true
                    resolve(null)
                }
            })
            const isInterrupted = () => interrupted

            setProcessing(true)
            setProgress({ done: 0, total: ids.length })

            try {
                // the records are not waited for when interrupted: no row is processed yet
                const records = await Promise.race([
                    lastValueFrom(
                        CxBoxApiInstance.fetchBcDataAll(screenName, buildBcUrl(bcName), {
                            ...utils.getFilters([{ fieldName: FIELDS.TECHNICAL.ID, type: FilterType.equalsOneOf, value: ids }]),
                            _limit: ids.length
                        })
                    ),
                    interruptSignal
                ])
                // signature is checked until the first success: the same certificate signs every row
                let verified = false

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
                        processRow(record, settings, cryptoGenerator, !verified, isInterrupted),
                        interruptSignal
                    ])

                    if (!result) {
                        break
                    }

                    verified = verified || !!result.options
                    results.set(id, result.options ? { ...result, cryptoKey } : result)
                    setProgress({ done: results.size, total: ids.length })
                }
            } catch (e) {
                const errorMessage = getErrorMessage(e)
                ids.forEach(id => results.has(id) || results.set(id, { success: false, errorMessage }))
            }

            interruptRef.current = null

            if (unmountedRef.current) {
                return false
            }

            setProcessing(false)

            if (interrupted && !results.size) {
                // nothing is processed, so there is nothing to send: the step is shown again
                setProgress(null)
                return false
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
            return true
        },
        [bcName, cryptoGenerator, dispatch, processRow, screenName, selectedRows, t]
    )

    return { progress, processing, run, stop }
}
