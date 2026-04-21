import React from 'react'
import ErrorPopupInner from '@components/ui/ErrorPopup/ErrorPopupInner'
import { ApplicationErrorType } from '@cxbox-ui/core'
import { Trans } from 'react-i18next'
import { cryptoProLinks } from '@components/CryptoGeneratorContent/constants'

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
                        <a key="0" href={cryptoProLinks.cryptoproLink} target="_blank" rel="noreferrer">
                            placeholder
                        </a>,
                        <br key="1" />,
                        <a key="2" href={cryptoProLinks.hdLink} target="_blank" rel="noreferrer">
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
