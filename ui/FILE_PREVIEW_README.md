# Example meta for document viewing

## List of documents
```json
{
  "name": "meetingDocumentList",
  "title": "",
  "type": "DocumentList",
  "bc": "meetingEdit",
  "fields": [],
  "options": {
    "documentPreview": {
      "fieldKeyForBase64": "responsibleName",
      "fieldKeyForContentType": "responsibleName",
      "type": "base64",
      "edit": {
        "widget": "meetingPopupForm"
      }
    },
    "actionGroups": {
      "include": [
        "create",
        "edit",
        "actions"
      ]
    }
  }
}
```
## Popup with a field to display an image
```json
{
  "name": "meetingPopupForm",
  "title": "",
  "type": "DocumentFormPopup",
  "bc": "meetingEdit",
  "fields": [
    {
      "label": "",
      "key": "agenda",
      "type": "documentPreview",
      "fieldKeyForContentType": "responsibleName"
    },
    {
      "label": "Start Date",
      "key": "startDateTime",
      "type": "dateTime"
    },
    {
      "label": "Client Name",
      "key": "clientName",
      "type": "pickList",
      "popupBcName": "clientPickListPopup",
      "pickMap": {
        "clientName": "fullName",
        "clientId": "id"
      }
    },
    {
      "label": "Contact",
      "key": "contactName",
      "type": "pickList",
      "popupBcName": "contactPickListPopup",
      "pickMap": {
        "contactName": "fullName",
        "contactId": "id"
      }
    }
  ],
  "options": {
    "actionGroups": {
      "include": [
        "save",
        "cancel-create"
      ]
    },
    "layout": {
      "rows": [
        {
          "cols": [
            {
              "fieldKey": "agenda",
              "span": 24
            }
          ]
        },
        {
          "cols": [
            {
              "fieldKey": "startDateTime",
              "span": 24
            }
          ]
        },
        {
          "cols": [
            {
              "fieldKey": "clientName",
              "span": 24
            }
          ]
        },
        {
          "cols": [
            {
              "fieldKey": "contactName",
              "span": 24
            }
          ]
        }
      ]
    }
  }
}
```

# Meta Description
## Example options.documentPreview for a widget:
```text
{
    type: "base64" | "dataUrl" | "fileUrl" | "generatedFileUrl"
    fieldKeyForBase64: string - field containing a file in the format base64 (type === base64)
    fieldKeyForContentType: string - field containing the mime type for the file (type === base64 | type === generatedFileUrl)
    fieldKeyForUrl: string - field containing file url or data url (type !== base64)
    fieldKeyForImageTitle?: string - optional field, the value of which will be used as a signature
    edit:{
      widget: string - the name of the popup widget that will open when you click on a file from the list
    }
    imageSizeOnList?: number - file size when displayed, default 200
}
```
## Example of a meta field with type documentPreview
```text
{
  "type": "documentPreview",
  "previewType": "base64" | "dataUrl" | "fileUrl" | "generatedFileUrl" - content type for the field
  "kye": string, - key fields containing the file in base64 format or url
  "fieldKeyForContentType": string, - key fields containing the mime type for the file
  "fieldKeyForFileName": string - key of the field containing the file name, which will be indicated when loading
}
```
