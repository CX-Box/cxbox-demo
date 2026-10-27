# cryptoPro

Signing and encryption of files in the browser with [CryptoPro ECP Browser plug-in][plugin]. The wrapper handles the
plugin's limitations with large files, including attached signatures, and turns plugin failures into errors the
application can handle. The public API is `index.ts`; reading files in chunks is `features/file`.

Facts marked «checked» were checked with plugin 2.0.15820, CryptoPro CSP 5 and Chromium 150 on Windows 11.

## The plugin and file size

The plugin offers two ways to work with a file.

### Whole file in one call

The file is passed to the plugin as one base64 string:

-   sign with [`SignCades`][signcades], attached or detached; verify with [`VerifyCades`][verifycades];
-   encrypt with [`Encrypt`][cpenvelopeddata].

This works for small files. The size is limited: depending on RAM and open tabs, the plugin signs files of 10–60 MB
([CryptoPro][content-encoding]); while the string is built and sent, the browser holds several times the file (≈ 3.5 ×,
estimate). For large inputs the plugin may hang without returning an error or fail with «Lost connection to extension».
In testing, `encryptAndSign` hung on a 35 MiB file, while 34 MiB was signed; after the failure the extension had to be
restarted.

### File in chunks

The plugin also processes a file in parts:

-   hash with [`HashedData`][cphasheddata], sign the hash with [`SignHash`][signhash], verify with
    [`VerifyHash`][verifyhash]; the CryptoPro sample [plugin-samples-fileapi_stream][fileapi-stream];
-   encrypt with [`StreamEncrypt`][streamencrypt], decrypt with [`StreamDecrypt`][streamdecrypt].

This avoids passing the whole file in one call, but leaves two problems:

-   **`SignHash` gives a detached signature.** It receives only a hash and does not put the file inside the signature;
    an attached signature needs `SignCades`, which takes the whole file and has the size limit above.
-   **`StreamEncrypt` returns base64-encoded parts.** Its documentation forbids concatenating the strings and decrypts
    the parts one by one with `StreamDecrypt`. The [release notes, post #61][release-2-0-15260] confirm that the
    intermediate results can be joined starting with plugin 2.0.15260 (CADES-2639).

The hash algorithm must also be set by hand: without it the plugin hashes with GOST R 34.11-94 and a GOST 2012 key fails
with `0x80070057`.

## What the wrapper solves

The entry points are `sign(file, signer, options)` and `encrypt(file, recipient)`. The wrapper chooses the path by the
operation, the signature type and the assembly setting; the size only decides whether a native attached operation is
allowed.

| Operation                        | How                                                               | Wrapper size limit                             |
| -------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| detached signature               | hash in 3 MiB chunks, `SignHash`                                  | no configured limit                            |
| native attached signature        | `SignCades` with the whole input                                  | 30 MB of the original file                     |
| attached signature with assembly | detached signature by the hash, then the wrapper inserts the file | no configured limit                            |
| encryption                       | `StreamEncrypt` in 3 MiB chunks, the parts joined into one `.enc` | no configured limit; plugin 2.0.15260 or newer |

No configured limit does not mean any size works: browser memory, the plugin and the recipient's software still have
their own limits.

-   **Large attached signatures.** The optional assembly makes an attached CMS without passing the whole file to
    `SignCades`; see the next section.
-   **One `.enc` file.** The wrapper decodes each part and joins the bytes, rather than concatenating the base64
    strings; hence `minPluginVersion`. Checked: the result is decrypted by `StreamDecrypt`, `Decrypt` and `csptest`.
-   **Reject oversized native attached operations.** The original file is checked before it is read and before the
    plugin is called; the user gets `FILE_TOO_LARGE` with the file size and the limit.
-   **Hash algorithm by the key.** Taken from the signer's key (`hashAlgorithm.ts`).
-   **Errors with codes.** The HRESULT is extracted from the plugin error text and turned into a code with a user
    message; inputs and the returned CMS are checked (see «Errors», «Details»).
-   **Stop waiting.** Calls that may show the PIN dialog have no timeout: a hung plugin cannot be told from a user
    typing the PIN. The caller stops waiting with `signal`; a plugin call already running is not cancelled.

## Attached signature of a large file

An attached signature contains the file; a detached one is stored separately. The wrapper has two attached modes,
chosen by `REACT_APP_CRYPTOPRO_ATTACHED_ASSEMBLY`:

-   **Off (default) — native signing.** The wrapper calls `SignCades` and rejects an original file over
    `nativeAttachedMaxSize` (30 MB — 30 000 000 bytes) with `FILE_TOO_LARGE` before any work. 30 MB is a setting of the
    wrapper with a margin, not a documented limit of the plugin. It applies to every native attached operation,
    including `encryptAndSign`: the encrypted CMS is stored as base64 text in `.enc`, and encoding that text as base64
    again for `SignCades` makes the transmitted data ≈ 1.78 × (16/9) the original file, without the CMS overhead. The
    user should not have to know what the file becomes after encryption.
-   **On — assembly.** The plugin signs the hash calculated in chunks; the wrapper inserts the file into
    `encapContentInfo.eContent` of the returned CMS. The `attachedAssembly` module is loaded lazily and uses pkijs and
    asn1js. The signature covers the signed attributes with the file hash, not the file ([RFC 5652][rfc5652] §5.2,
    §5.4), so the result is the attached signature of the same file; the signature itself is made by CryptoPro.

With assembly there is no configured size limit, but there are limits of verification and compatibility:

-   the plugin verifies the detached signature against the hash **before** the file is inserted; the completed attached
    CMS is not verified in the browser: [`VerifyCades`][verifycades] would need the whole file again;
-   `csptest` verified assembled signatures up to 100 MB and failed at 200 MB (`0x80093104`), so above 100 MB a warning
    is logged; the signature is still made (checked);
-   check that the recipient's software accepts attached signatures: some require detached ones.

## API

-   `sign(file, signer, options)` — detached (default) or attached; CAdES-BES or CAdES-T; signed attributes
    signingTime (the computer clock) and documentName; the whole certificate chain. A native attached signature is
    verified with `VerifyCades`; a detached one, including the one for assembly, with `VerifyHash` against the hash.
-   `encrypt(file, recipient)` — encrypts in chunks; an empty file — by `Encrypt`.
-   `signAndEncrypt(file, signer, recipient, options)` — signs, then encrypts: detached — the file, attached — the
    signature with the file inside. `encryptAndSign(file, signer, recipient, options)` — encrypts, then signs the
    `.enc`.
-   `getCertificates()` — certificates of the current user ([sample][container-store]), not expired by default;
    `getCertificateProblem(cert, { purpose })` — why a certificate cannot sign or encrypt, to mark it in the list.
-   `isNativeAttached(signaturePackage)` — whether the attached signature goes to `SignCades` (the size limit, a call
    without a timeout): the UI may offer to stop waiting.
-   `ensureCadesPluginInstalled()`, `getPluginVersion()` — optional, every operation loads the plugin itself.

```ts
const [cert] = await getCertificates()
if (!cert) {
    throw new Error('No signing certificate is available')
}
const controller = new AbortController() // controller.abort() — stop waiting, OPERATION_ABORTED
try {
    const { signature } = await sign(file, cert, {
        signaturePackage: 'attached',
        documentName: file.name,
        signal: controller.signal
    })
} catch (error) {
    if (isCadesPluginError(error)) {
        notify(t(CADES_ERROR_I18N_KEYS[error.code]), error.pluginMessage)
    } else {
        throw error
    }
}
```

## Settings

`CRYPTOPRO_CONFIG` in `config.ts`. From environment variables (`ui/.env*`):

| Variable                                | Meaning                                                                         | Default       |
| --------------------------------------- | ------------------------------------------------------------------------------- | ------------- |
| `REACT_APP_CRYPTOPRO_TSA_URL`           | time stamp service, required for CAdES-T                                        | not set       |
| `REACT_APP_CRYPTOPRO_ATTACHED_ASSEMBLY` | `true` — every attached signature is assembled from a detached one and the file | `false`       |
| `REACT_APP_CRYPTOPRO_INSTRUCTION_LINK`  | setup link when the plugin or certificates are not found (`CRYPTOPRO_LINKS`)    | doc.cxbox.org |

Constants: `chunkSize` (3 MiB), `nativeAttachedMaxSize` (30 MB), `chunkTimeout` (60 s for one chunk),
`minPluginVersion` (`2.0.15260`). MB is 1 000 000 bytes, MiB is 1 048 576 bytes.

## Errors

Every error is `CadesPluginError` (`errors.ts`): `code` from `CADES_ERROR_CODES` for the user message
(`CADES_ERROR_I18N_KEYS` — a short title, `CADES_ERROR_I18N_HINT_KEYS` — what to do, if anything), `pluginCode` —
HRESULT, `pluginMessage` — the plugin text for details, `cause` — the original error (for `FILE_TOO_LARGE` —
`FileTooLargeError` with `size` and `maxSize` in bytes).

-   Precondition checks: `UNSUPPORTED_KEY` (signer's key not in `hashAlgorithm.ts`),
    `FILE_TOO_LARGE` (native attached over `nativeAttachedMaxSize`), `TSA_NOT_CONFIGURED` (CAdES-T without a service),
    `PLUGIN_OUTDATED` (encryption with a plugin older than `minPluginVersion`), `ASSEMBLY_NOT_AVAILABLE` (assembly on,
    module removed).
-   During the operation: `INVALID_CMS` (unexpected structure of the plugin's detached signature at assembly),
    `PLUGIN_NOT_RESPONDING` (a chunk not taken in `chunkTimeout`), `OPERATION_ABORTED` (the `signal` is aborted).
-   From the plugin ([`getLastError`][plugin-methods]): an HRESULT with one meaning at any step gives the code of the
    cause; anything else — the code of the failed step (`SIGN_FAILED`, `VERIFY_FAILED`, `ENCRYPT_FAILED`,
    `PLUGIN_NOT_AVAILABLE`, `UNKNOWN`). The title claims only what is certain, the plugin text is always shown as
    details.

| HRESULT      | Meaning                                                                                             | Our code          |
| ------------ | --------------------------------------------------------------------------------------------------- | ----------------- |
| `0x8010006E` | «Cancel» in the PIN dialog                                                                          | `USER_CANCELLED`  |
| `0x800B0101` | a certificate is outside its validity period at verification time                                   | `CERT_EXPIRED`    |
| `0x800B0109` | the chain ends at an untrusted root                                                                 | `CERT_UNTRUSTED`  |
| `0x80090014` | invalid provider type ([`NTE_BAD_PROV_TYPE`][nte-bad-prov-type]); observed with CNG keys on Windows | `UNSUPPORTED_KEY` |

Not mapped on purpose: `0x800B010E` (revocation not checked — comes at signing too) and `0x80070057` (invalid parameter
— any step). On other systems an unknown code gives the code of the failed step.

`CERT_NOT_YET_VALID`, `CERT_EXPIRED`, `CERT_NO_PRIVATE_KEY`, `CERT_UNTRUSTED`, `UNSUPPORTED_KEY` are also returned by
`getCertificateProblem` to mark a certificate in the list; nothing is blocked by it — the plugin decides at the
operation. The exception is encryption: the plugin encrypts for a recipient with an expired certificate or a broken chain,
so `validateEncryptionCertificate` (`components/CryptoGeneratorContent/cryptoFile.ts`) refuses such a certificate
before encryption.

## Details

-   **Keys.** The wrapper signs with GOST R 34.10-2012 256/512 keys (`1.2.643.7.1.1.1.1`, `.2`). The key → hash
    algorithm mapping is `HASH_BY_KEY_OID` in `hashAlgorithm.ts`: a new key algorithm is one line there. Checked: RSA
    with SHA-2 returned an empty signature without an error, CNG keys on Windows returned `0x80090014`. The encryption
    algorithm is chosen by the plugin.
-   **Checks of the result.** The plugin may return an empty signature without an error (RSA with SHA-2), so the
    signature is checked to be a CMS; an unknown signature type would silently become CAdES-X Long Type 1, the default
    of `SignCades` and `SignHash` — it is rejected.
-   **Calls one by one.** Plugin calls on one object are awaited one by one: otherwise the error of a part is lost and
    incomplete data gets signed. Chunk calls do not wait for user input: if a call does not complete within
    `chunkTimeout`, the wrapper returns `PLUGIN_NOT_RESPONDING`.
-   **Stop waiting is not cancel.** `cadesplugin_api.js` has no method to cancel a running call: `signal` rejects the
    operation with `OPERATION_ABORTED` at once and calls the plugin no more, but the call goes on in the plugin and its
    result is ignored.
-   **The `.enc` format.** BER as the plugin returns it (an empty file — DER, a subset of BER). No conversion to DER:
    CryptoPro reads BER, and a conversion keeps the encrypted bytes until the end (300 MB file: peak ≈ +706 MB instead
    of +442 MB).
-   **Plugin memory.** Plugin objects live in a separate process (`nmcades`) until the page is reloaded, not freed by
    the browser GC; one operation creates a few small objects, opened stores are closed.
-   **Not supported:** decrypting and verifying existing signatures; encryption with plugins older than 2.0.15260;
    plugins without the async API.

[plugin]: https://docs.cryptopro.ru/cades/plugin
[content-encoding]: https://docs.cryptopro.ru/cades/plugin/content-encoding
[signcades]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_interface/icpsigneddata2signcades
[verifycades]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_interface/icpsigneddata2verifycades
[cpenvelopeddata]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_class/cpenvelopeddata
[cphasheddata]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_class/cphasheddata
[signhash]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_interface/icpsigneddata4signhash
[verifyhash]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_interface/icpsigneddata4verifyhash
[fileapi-stream]: https://docs.cryptopro.ru/cades/plugin/plugin-samples/plugin-samples-fileapi_stream
[streamencrypt]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_interface/icpenvelopeddata2streamencrypt
[streamdecrypt]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_interface/icpenvelopeddata2streamdecrypt
[release-2-0-15260]: https://cryptopro.ru/forum2/default.aspx?g=posts&m=158774
[rfc5652]: https://www.rfc-editor.org/rfc/rfc5652
[container-store]: https://docs.cryptopro.ru/cades/plugin/plugin-samples/plugin-samples-cadescom-container-store
[plugin-methods]: https://docs.cryptopro.ru/cades/plugin/plugin-methods
[nte-bad-prov-type]: https://learn.microsoft.com/en-us/windows/win32/com/com-error-codes-4
