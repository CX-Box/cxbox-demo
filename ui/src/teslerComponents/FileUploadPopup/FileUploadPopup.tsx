import React from 'react'
import { Upload } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Store } from '@interfaces/store'
import { Popup } from '@teslerComponents/ui/Popup/Popup'
import styles from './FileUploadPopup.less'
import { getFileUploadEndpoint } from '@cxbox-ui/core'
import { $do } from '@actions'
import { FrownOutlined } from '@ant-design/icons'

/**
 * @category Components
 */
export const FileUploadPopup: React.FC = () => {
    const { t } = useTranslation()
    const popupData = useSelector((state: Store) => state.view.popupData)
    const dispatch = useDispatch()
    const uploadUrl = getFileUploadEndpoint()
    const [ids, setIds] = React.useState<Record<string, string>>({})
    return (
        <div>
            <Popup
                bcName={popupData.bcName}
                showed
                size="medium"
                onOkHandler={() => {
                    dispatch($do.bulkUploadFiles({ fileIds: Object.values(ids) }))
                }}
                onCancelHandler={() => dispatch($do.closeViewPopup({ bcName: popupData.bcName }))}
            >
                <Upload.Dragger
                    className={styles.dragContainer}
                    multiple
                    action={uploadUrl}
                    onChange={info => {
                        if (info.file.status === 'done') {
                            setIds({ ...ids, [info.file.uid]: info.file.response.data.id })
                        }
                    }}
                    onRemove={file => {
                        const newIds = { ...ids }
                        delete newIds[file.uid]
                        setIds(newIds)
                        // TODO: Probably should send delete request
                    }}
                >
                    <div className={styles.icon}>
                        <FrownOutlined />
                    </div>
                    <div className={styles.text}>{t('Select files')}</div>
                </Upload.Dragger>
            </Popup>
        </div>
    )
}

/**
 * @category Components
 */
export default React.memo(FileUploadPopup)
