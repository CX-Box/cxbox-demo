import React, { ComponentType } from 'react'

export const CustomizationContext: React.Context<{
    customFields: Record<string, ComponentType<any>>
}> = React.createContext({
    customFields: {}
})
