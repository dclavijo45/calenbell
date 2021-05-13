export interface EventsRequest {
    id: number,
    title: string,
    day: number,
    month: number,
    year: number,
    hour: string,
    description: string,
    type_ev: string,
    icon: string,
    check: boolean
}

export interface EventsDeleteResponse {
    auth_token: boolean,
    deleted: boolean
}