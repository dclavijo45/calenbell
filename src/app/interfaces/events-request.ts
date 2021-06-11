export interface EventsRequest {
    id: number,
    title: string,
    day: number,
    month: number,
    year: number,
    hour: string,
    description: string,
    type_ev: number,
    icon: string,
    check: boolean,
    owner: boolean
}

/**
 * @description `reason` 1=Have users in event
 */
export interface EventsDeleteResponse {
    auth_token: boolean,
    deleted: boolean,
    reason: number
}