import React from 'react'
import ErrorPopupInner from '@components/ui/ErrorPopup/ErrorPopupInner'
import { ApplicationErrorType } from '@cxbox-ui/core'
import { Trans } from 'react-i18next'
import { CRYPTOPRO_LINKS } from '@constants/cadesPlugin'

const BUSINESS_ERROR = { type: ApplicationErrorType.BusinessError }

interface CertErrorPopupProps {
    hasError: boolean | undefined
    onClose: (() => void) | undefined
}

const CertErrorPopup: React.FC<CertErrorPopupProps> = ({ hasError, onClose }) => {
    if (!hasError) {
        return null
    }

    return (
        <ErrorPopupInner
            error={BUSINESS_ERROR}
            forceBusinessMessage={
                <Trans
                    i18nKey="Failed to get certificate"
                    components={[
                        <a key="0" href={CRYPTOPRO_LINKS.INSTRUCTION_URL} target="_blank" rel="noreferrer">
                            placeholder
                        </a>
                    ]}
                />
            }
            onClose={onClose}
        />
    )
}

export default CertErrorPopup
