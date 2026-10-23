/** First octet (tag) of DER parts of a CMS that our code checks or builds */
export const SEQUENCE = 0x30
export const OCTET_STRING = 0x04
/** `[0] EXPLICIT`: ContentInfo.content and encapContentInfo.eContent */
export const EXPLICIT_0 = 0xa0
