import { LoginResponse as CoreLoginResponse } from '@cxbox-ui/core/interfaces/session'

export interface LoginResponse extends CoreLoginResponse {
    userId: string
}
