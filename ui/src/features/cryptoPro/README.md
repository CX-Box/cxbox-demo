# cryptoPro

A wrapper around [CryptoPro ECP Browser plug-in](https://docs.cryptopro.ru/cades/plugin) (async API): signing and
encryption of files in the browser. The public API is `index.ts`; reading files in chunks is `features/file`. The plugin
itself, its objects and HRESULT codes are described in the CryptoPro documentation; here — only what the wrapper adds or
changes. Facts marked «checked» were checked with plugin 2.0.15820, CryptoPro CSP 5 and Chromium 150 on Windows 11.

## Settings

`CRYPTOPRO_CONFIG` in `config.ts`. From environment variables (`ui/.env*`):

| Variable                                | Meaning                                                                          | Default       |
| --------------------------------------- | -------------------------------------------------------------------------------- | ------------- |
| `REACT_APP_CRYPTOPRO_TSA_URL`           | time stamp service, required for CAdES-T                                         | not set       |
| `REACT_APP_CRYPTOPRO_ATTACHED_ASSEMBLY` | `true` — every attached signature, of any size, is assembled from a detached one | `false`       |
| `REACT_APP_CRYPTOPRO_INSTRUCTION_LINK`  | setup link when the plugin or certificates are not found (`CRYPTOPRO_LINKS`)     | doc.cxbox.org |

Constants: `chunkSize` (3 MiB), `nativeAttachedMaxSize` (limit of the native attached signature, 30 MB — 30 000 000
bytes), `chunkTimeout` (60 s for one chunk), `minPluginVersion` (`2.0.15260`).

## Errors

Every error is `CadesPluginError` (`errors.ts`): `code` from `CADES_ERROR_CODES` for the user message
(`CADES_ERROR_I18N_KEYS` — a short title, `CADES_ERROR_I18N_HINT_KEYS` — what to do, if anything), `pluginCode` —
HRESULT, `pluginMessage` — the plugin text for details, `cause` — the original error (for `FILE_TOO_LARGE` —
`FileTooLargeError` with `size` and `maxSize` in bytes).

-   Our checks, before the plugin or the file is read: `UNSUPPORTED_KEY` (signer's key not in `hashAlgorithm.ts`),
    `FILE_TOO_LARGE` (attached over `CRYPTOPRO_CONFIG.nativeAttachedMaxSize` without the assembly), `TSA_NOT_CONFIGURED`
    (CAdES-T without a service), `PLUGIN_OUTDATED` (encryption with a plugin older than `minPluginVersion`),
    `ASSEMBLY_NOT_AVAILABLE` (assembly on, module removed).
-   Our checks during the operation: `INVALID_CMS` (unexpected structure of the plugin's detached signature at
    assembly), `PLUGIN_NOT_RESPONDING` (a chunk not taken in `chunkTimeout`), `OPERATION_ABORTED` (the `signal` is
    aborted: the user stopped waiting).
-   From the plugin: an HRESULT with one meaning at any step gives the code of the cause; anything else — the code of
    the failed step (`SIGN_FAILED`, `VERIFY_FAILED`, `ENCRYPT_FAILED`, `PLUGIN_NOT_AVAILABLE`, `UNKNOWN`). The title
    claims only what is certain, the plugin text is always shown as details.

| HRESULT      | Meaning                                          | Our code          |
| ------------ | ------------------------------------------------ | ----------------- |
| `0x8010006E` | «Cancel» in the PIN dialog                       | `USER_CANCELLED`  |
| `0x800B0101` | a certificate in the chain has expired           | `CERT_EXPIRED`    |
| `0x800B0109` | the chain ends at an untrusted root              | `CERT_UNTRUSTED`  |
| `0x80090014` | key in CNG (usual RSA and ECDSA keys of Windows) | `UNSUPPORTED_KEY` |

Not mapped on purpose: `0x800B010E` (revocation not checked — comes at signing too) and `0x80070057` (invalid parameter
— any step). Checked on Windows only; on other systems an unknown code gives the code of the failed step.

`CERT_NOT_YET_VALID`, `CERT_EXPIRED`, `CERT_NO_PRIVATE_KEY`, `CERT_UNTRUSTED`, `UNSUPPORTED_KEY` are also returned by
`getCertificateProblem` to mark a certificate in the list; nothing is blocked by it — the plugin decides at the
operation.

## What it can and cannot do

-   `sign(file, signer, options)` — signs a file:
    -   detached (default) of any size: hash in chunks ([`HashedData`][cphasheddata]), [`SignHash`][signhash];
    -   attached: [`SignCades`][signcades] up to `CRYPTOPRO_CONFIG.nativeAttachedMaxSize`, or of any size with the
        assembly on;
    -   CAdES-BES or CAdES-T; signed attributes signingTime (the computer clock) and documentName; the whole certificate
        chain in the signature; every signature is verified by the plugin before it is returned
        ([`VerifyHash`][verifyhash], [`VerifyCades`][verifycades]).
-   `encrypt(file, recipient)` — encrypts a file of any size in chunks ([`StreamEncrypt`][streamencrypt]; an empty file
    — by [`Encrypt`][cpenvelopeddata]).
-   `signAndEncrypt(file, signer, recipient, options)` — signs, then encrypts: detached — the file, attached — the
    signature with the file inside. `encryptAndSign(file, signer, recipient, options)` — encrypts, then signs the
    `.enc`.
-   `getCertificates()` — certificates of the current user ([sample][container-store]), not expired by default;
    `getCertificateProblem(cert, { purpose })` — why a certificate cannot sign or encrypt, to mark it in the list.
-   `isNativeAttached(signaturePackage)` — whether the attached signature goes to [`SignCades`][signcades], the call
    without a timeout: the UI may offer to stop waiting with `signal`.
-   `ensureCadesPluginInstalled()`, `getPluginVersion()` — optional, every operation loads the plugin itself.

```ts
const [cert] = await getCertificates()
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
    }
}
```

It cannot:

-   Sign with keys other than GOST R 34.10-2012 256/512 (`1.2.643.7.1.1.1.1`, `.2`; GOST 34.10-2018 has the same OIDs):
    GOST R 34.10-2001 is not allowed for signing since 2019–2020; RSA — the plugin signs only with SHA-1, with SHA-2 it
    returns an empty string without an error (checked); CNG keys — `0x80090014` (checked). Encryption does not depend on
    this: the algorithm is chosen by the plugin. A new key algorithm is one line in `hashAlgorithm.ts`.
-   Verify an assembled attached signature as attached in the browser: [`VerifyCades`][verifycades] takes the whole
    file, so only the detached part is verified ([`VerifyHash`][verifyhash] checks the hash only against the
    messageDigest attribute, not against data). `csptest` verified assembled signatures up to 100 MB and failed at 200
    MB (`0x80093104`), so above 100 MB a warning is logged; the signature is still made.
-   Decrypt and verify existing signatures: there is no such operation.
-   Cancel a plugin call that is running: `cadesplugin_api.js` has no such method. `signal` only stops waiting; the call
    goes on in the plugin and its result is ignored.
-   Work with plugins older than 2.0.15260 for encryption, or without the async API.

## Why

What the wrapper changes compared with calling the plugin directly, and the plugin property behind it:

-   **Files in 3 MiB chunks.** [`SignCades`][signcades] and [`Encrypt`][cpenvelopeddata] take the whole file as one
    base64 string: ≈ 3.5 × the file in the browser, the V8 string limit at ≈ 400 MB, and the plugin fails at 10–60 MB
    depending on RAM ([CryptoPro][content-encoding]). Chunks keep memory constant; the size is the one of the CryptoPro
    sample [plugin-samples-fileapi_stream][fileapi-stream].
-   **Limit before the plugin.** Hence `nativeAttachedMaxSize` for [`SignCades`][signcades], checked for the user's file
    before any work. One limit for every attached operation, with a margin: `encryptAndSign` signs the `.enc`, which is
    base64 text, so [`SignCades`][signcades] gets ≈ 1.78 × the source file. Over the plugin's limit
    [`SignCades`][signcades] hangs without an answer or fails with «Lost connection to extension», and the plugin stops
    answering until the extension is restarted (testing: 35 MiB hung in `encryptAndSign`, 34 MiB was signed). The user
    should not have to know what the file becomes after encryption.
-   **Assembled attached signature** (optional `attachedAssembly`, loaded lazily; to drop it with pkijs and asn1js — its
    `index.ts`). The plugin signs the hash, our code puts the file into `encapContentInfo.eContent`. By RFC 5652 (§5.2,
    §5.4) the signature covers the signed attributes with the file hash, not the file, so the result is the attached
    signature of the same file; no cryptography outside CryptoPro. Check that the recipient accepts attached signatures:
    some require detached ones.
-   **Joined encrypted parts.** The bytes of the parts are joined, not the base64 strings: the documentation of
    [`StreamEncrypt`][streamencrypt] forbids joining the strings and decrypts the parts one by one with
    [`StreamDecrypt`][streamdecrypt]; a joined message is not described there. Joinable since plugin 2.0.15260 (release
    notes, CADES-2639 — not found in the documentation), hence `minPluginVersion`. The `.enc` is BER as the plugin
    returns it (an empty file — DER, a subset of BER); checked: decrypted by [`StreamDecrypt`][streamdecrypt],
    [`Decrypt`][cpenvelopeddata] and `csptest`. No conversion to DER: CryptoPro reads BER, and a conversion keeps the
    encrypted bytes until the end (300 MB file: peak ≈ +706 MB instead of +442 MB).
-   **Hash algorithm by the key.** [`SignHash`][signhash] takes the algorithm from [`HashedData`][cphasheddata]; without
    it the plugin hashes with GOST R 34.11-94 and a GOST 2012 key fails with `0x80070057`.
-   **Our checks of the result.** The plugin may return an empty signature without an error (RSA with SHA-2), so the
    signature is checked to be a CMS; an unknown signature type would silently become CAdES-X Long Type 1, the default
    of [`SignCades`][signcades] and [`SignHash`][signhash] — it is rejected.
-   **Errors with codes.** The async plugin rejects with a plain object `{ message, requestid, type }`, the HRESULT only
    in the text: `… (0x80070057)` ([`getLastError`][plugin-methods]); the wrapper extracts it and maps it (see
    «Errors»).
-   **Calls one by one.** Plugin calls on one object are awaited one by one: otherwise the error of a part is lost and
    incomplete data gets signed. Chunk calls show no dialogs, so a wait over `chunkTimeout` means the extension lost the
    answer; calls that may show the PIN dialog ([`SignCades`][signcades], [`SignHash`][signhash]) are not limited,
    because a hung plugin cannot be told from a user typing the PIN. Instead the caller may stop waiting with `signal`:
    the operation rejects with `OPERATION_ABORTED` at once and calls the plugin no more.
-   **Plugin memory.** Plugin objects live in a separate process (`nmcades`) until the page is reloaded, not freed by
    the browser GC; one operation creates a few small objects, opened stores are closed.

[cphasheddata]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_class/cphasheddata
[signhash]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_interface/icpsigneddata4signhash
[signcades]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_interface/icpsigneddata2signcades
[verifyhash]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_interface/icpsigneddata4verifyhash
[verifycades]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_interface/icpsigneddata2verifycades
[streamencrypt]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_interface/icpenvelopeddata2streamencrypt
[container-store]: https://docs.cryptopro.ru/cades/plugin/plugin-samples/plugin-samples-cadescom-container-store
[content-encoding]: https://docs.cryptopro.ru/cades/plugin/content-encoding
[fileapi-stream]: https://docs.cryptopro.ru/cades/plugin/plugin-samples/plugin-samples-fileapi_stream
[plugin-methods]: https://docs.cryptopro.ru/cades/plugin/plugin-methods
[streamdecrypt]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_interface/icpenvelopeddata2streamdecrypt
[cpenvelopeddata]: https://docs.cryptopro.ru/cades/reference/cadescom/cadescom_class/cpenvelopeddata
