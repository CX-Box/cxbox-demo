import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import { actions } from '@cxbox-ui/core'
import { allNotificationsClosed } from '@actions'
import { AddedFileInfo } from '@components/Operations/components/FileUpload/FileUpload.interfaces'

type FileDownloadUpdate = Pick<AddedFileInfo, 'uid'> & Partial<Pick<AddedFileInfo, 'name' | 'status' | 'percent' | 'errorMessage'>>

/**
 * Lines of the "Download progress" window: files that are downloading now or were downloaded a few seconds ago.
 * A line has the same form and statuses as a line of the "Upload progress" window: `init` until the answer starts,
 * `uploading` while the file comes, then `done` or `error`.
 */
const fileDownloadSlice = createSlice({
    name: 'fileDownload',
    initialState: [] as AddedFileInfo[],
    reducers: {
        addFile(state, action: PayloadAction<Pick<AddedFileInfo, 'uid' | 'name'>>) {
            state.push({ ...action.payload, id: null, status: 'init', percent: 0 })
        },
        updateFile(state, action: PayloadAction<FileDownloadUpdate>) {
            // the user may close the window while the file is downloading: then the line is gone
            const file = state.find(item => item.uid === action.payload.uid)

            if (file) {
                Object.assign(file, action.payload)
            }
        },
        removeFiles(state, action: PayloadAction<string[]>) {
            return state.filter(file => !action.payload.includes(file.uid))
        },
        clearFiles() {
            return []
        }
    },
    extraReducers: builder => {
        builder.addMatcher(isAnyOf(allNotificationsClosed, actions.logout, actions.switchRole), () => [])
    }
})

export const fileDownloadActions = fileDownloadSlice.actions
export const fileDownloadReducer = fileDownloadSlice.reducer
