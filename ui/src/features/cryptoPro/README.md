# cryptoPro

Signing and encryption of files in the browser with
[CryptoPro ECP Browser plug-in](https://docs.cryptopro.ru/cades/plugin) (async API, plugin 2.0.15260 or later).
The public API is `index.ts`; reading files in chunks is `features/file`.

This file keeps only what the code relies on and what is not obvious from it. The facts marked «checked» were checked
with plugin 2.0.15820, CryptoPro CSP 5 and Chromium 150 on Windows 11.

## Settings

| Variable                                | Meaning                                                                                                 | Default       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------- |
| `REACT_APP_CRYPTOPRO_TSA_URL`           | Time stamp service for CAdES-T. Without it CAdES-T fails before the file is read (`TSA_NOT_CONFIGURED`) | not set       |
| `REACT_APP_CRYPTOPRO_ATTACHED_ASSEMBLY` | `true` — attached signatures are always assembled from a detached one (any size)                        | `false`       |
| `REACT_APP_CRYPTOPRO_INSTRUCTION_LINK`  | Link to the setup instructions in error messages                                                        | doc.cxbox.org |

The rest is in `config.ts` as constants: the chunk size (3 MiB), the limit of the native attached signature (40 MiB) and
the wait for one chunk (60 s).

## Supported keys

Signing — GOST R 34.10-2012, 256 and 512 bit keys (OIDs `1.2.643.7.1.1.1.1`, `1.2.643.7.1.1.1.2`). The interstate
GOST 34.10-2018 is the same algorithm with the same OIDs. Other keys are listed, but cannot sign (`UNSUPPORTED_KEY`):

-   GOST R 34.10-2001 — signing with it is not allowed since 2019–2020;
-   RSA — the plugin signs only with SHA-1, `SignHash` with SHA-256/384/512 returns an empty string without an error (checked);
-   keys in CNG (Microsoft Software Key Storage Provider: usual RSA and ECDSA keys of Windows) — `0x80090014` (checked).

Encryption does not depend on this list: the algorithm is chosen by the plugin.

A new key algorithm is one line in `hashAlgorithm.ts`: key OID → hash constant of the plugin.

## Plugin behaviour

-   The async plugin rejects with a plain object `{ message, requestid, type }`, not an `Error`; the code is only inside
    the message: `… (0x80070057)`.
-   `SignHash` takes the hash algorithm from `HashedData`; without it the plugin hashes with GOST R 34.11-94 and a GOST
    2012 key fails with `0x80070057`.
-   Plugin calls on one object must run one by one, each awaited: otherwise the error of a part is lost.
-   A call that takes a chunk (`Hash`, `StreamEncrypt`) is awaited at most 60 s, then `PLUGIN_NOT_RESPONDING`: these calls
    show no dialogs, so a longer wait means the extension lost the answer. Calls that may show the PIN dialog are not limited.

### Error codes

The plugin reports errors with HRESULT codes. The rule for user messages: the title claims only what is certain,
the plugin text is always shown as details.

-   By default the title names the failed step: `SIGN_FAILED`, `VERIFY_FAILED`, `ENCRYPT_FAILED`, `PLUGIN_NOT_AVAILABLE`.
-   The title names the cause only when it is certain: found by our checks before the plugin is called (the
    signer's key algorithm, file size), or an HRESULT with one meaning at any step (the table in `errors.ts`).
-   The plugin text with the code (`pluginMessage`) is shown as details for every error from the plugin; the whole
    error goes to the console.

| HRESULT      | Meaning                                | Where we got it                                  | Our code          |
| ------------ | -------------------------------------- | ------------------------------------------------ | ----------------- |
| `0x8010006E` | the user cancelled                     | «Cancel» in the PIN dialog                       | `USER_CANCELLED`  |
| `0x800B0101` | a certificate in the chain has expired | expired signer certificate                       | `CERT_EXPIRED`    |
| `0x800B0109` | the chain ends at an untrusted root    | test CA root not installed                       | `CERT_UNTRUSTED`  |
| `0x80090014` | wrong provider type                    | key in CNG (usual RSA and ECDSA keys of Windows) | `UNSUPPORTED_KEY` |

Seen, but deliberately not in the table — they get the code of the failed step:

| HRESULT      | Meaning                         | Where we got it                             | Why not mapped                                           |
| ------------ | ------------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| `0x800B010E` | revocation could not be checked | verification with a self-signed certificate | can come at signing too: «verification failed» would lie |
| `0x80070057` | invalid parameter               | hash algorithm does not match the key       | generic: can come at any step                            |

The codes were checked on Windows only. On Linux and macOS they may differ: an unknown code gives the title of the
failed step, the plugin text is still shown as details.

## Signature attributes

Signed attributes: signing time (the computer clock; trusted time only with CAdES-T) and the document name —
`SignOptions.documentName`. The UI passes the document file name from the record (`documentFileNameKey`), for
`encryptAndSign` — the `.enc` file name; without a name — `'Document Name'`, as before. The name is optional for the
signature to be valid, it only tells which document was signed. The whole certificate chain is put into the signature.

When `.sig` and `.enc` share one record field, `encryptAndSign` uploads only the `.sig` (as before); its document name is
still the `.enc` name — the signed data, though there is no such file on the server.

## Certificates

`getCertificates()` lists the not expired certificates of the user (`{ expired: true }` — all). A certificate that cannot
be read is skipped. Certificate problems (dates, no private key, untrusted chain, key algorithm) are only marked in the
list: the plugin decides at the operation and reports its own error. The only check before the plugin is the signer's key
algorithm — signing by hash is impossible without it.

## Size and memory

-   Signing by hash and encryption read the file in 3 MiB chunks: the browser and the plugin process take a constant
    amount of memory for any file size.
-   Native attached signature (`SignCades`) passes the whole file to the plugin as one base64 string: ≈ 3.5 × the file
    in the browser, and the plugin fails at 10–60 MB depending on RAM (CryptoPro documentation). Hence the 40 MiB limit
    (`FILE_TOO_LARGE`, the user sees «40 МБ» — as Windows Explorer counts). The limit is for the size of the file itself,
    the base64 overhead is already in it; for `encryptAndSign` — of the source file, checked before encryption, though
    the `.enc` that is signed is ≈ 4/3 of it.
-   A whole-file base64 string hits the V8 string limit at ≈ 400 MB of file.

### Plugin memory

Plugin objects live in a separate process (`nmcades`) until the page is reloaded; they are not freed by the browser
garbage collector. One operation creates a few small objects, so this does not grow noticeably. Opened stores are
closed (`Store.Close`).

## Encryption in parts

`CPEnvelopedData.StreamEncrypt` returns parts that are joined into one CMS EnvelopedData (BER with indefinite lengths).
The parts are concatenable since plugin 2.0.15260 (release notes, CADES-2639), older plugins are rejected
(`PLUGIN_OUTDATED`). Checked: the joined message is decrypted by `StreamDecrypt`, by plain `Decrypt` and by `csptest`.

Format of the `.enc`: before, `Encrypt` of the whole file returned DER; now a non-empty file is BER, as the plugin
returns it, written to the file without conversion. An empty file is still DER: the plugin encrypts it only by
`Encrypt`. Both are valid: DER is a subset of BER, and CMS is defined in BER (RFC 5652). Signatures are DER.

Why there is no conversion to DER: CryptoPro reads BER, and a conversion costs more than it gives. DER lengths are known
only at the end, so the encrypted bytes would be kept until then (300 MB file: peak ≈ +706 MB instead of +442 MB); asn1js
parses the whole message in memory and belongs to the optional `attachedAssembly` module; an own converter is ≈ 150 lines
of BER parsing to maintain. Such a converter was tried and worked on the real plugin output, and was removed for that cost.

## Attached signature of large files

Optional, the `attachedAssembly` directory, loaded lazily. To drop it together with pkijs and asn1js, follow its `index.ts`:
delete the other files of the directory and export `undefined` instead of the loader.

-   How: the plugin signs the hash (`SignHash`) as for a detached signature, then our code puts the file into
    `encapContentInfo.eContent`. By RFC 5652 (§5.2, §5.4) the signature value covers the signed attributes with the
    file hash, not the file itself, so it does not change: the result is the attached signature of the same file.
    No cryptography is done outside CryptoPro: the code only packs ready bytes into a standard CMS.
-   Verification in the browser: the file goes to the plugin only in chunks, so the plugin verifies only the detached
    signature (`VerifyHash`); `VerifyCades` would need the whole file. Unit tests check this call protocol and that an
    assembled signature of a small file with a real key is verified as attached by an independent implementation
    and fails after a byte of the file is changed.
-   Verification by CryptoPro tools: `csptest` verified assembled signatures up to 100 MB and failed at 200 MB
    (`0x80093104`, `CRYPT_E_ASN1_LARGE`), so above 100 MB a warning is logged; the signature is still made.
-   Check that the recipient accepts attached signatures: some require detached ones (e.g. Russian courts).
    A detached signature is the standard way for large files.
