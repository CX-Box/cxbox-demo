/** CMS object identifiers (RFC 5652) that the assembly checks */

/** id-data: the content is plain data, the type of the file inside the signature */
export const ID_DATA = '1.2.840.113549.1.7.1'
/** id-signedData: the ContentInfo holds a SignedData */
export const ID_SIGNED_DATA = '1.2.840.113549.1.7.2'
/** id-contentType: the signed attribute with the content type */
export const ID_CONTENT_TYPE = '1.2.840.113549.1.9.3'
/** id-messageDigest: the signed attribute with the content hash */
export const ID_MESSAGE_DIGEST = '1.2.840.113549.1.9.4'
