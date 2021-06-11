export interface GetEventsRequest {
    auth_token: boolean,
    events: IEvents[]
}

/**
 * @description `type_ev` 1= one, 2= group
 */
interface IEvents {
    id: number,
    title: string,
    hour: string,
    day: number,
    month: number,
    year: number,
    description: string,
    check: boolean,
    type_ev: number,
    icon: string,
    owner: boolean
}