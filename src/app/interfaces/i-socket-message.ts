/***
 * @TODO type: 1 = one-one, 2 = group
 */

export interface ISocketMessage {
    transmitter: number,
    message: string,
    type: number,
    info_profile_group?: IInfoProfileGroup,
    id_group?: number
}

interface IInfoProfileGroup {
    photo: string,
    online: boolean,
    name: string
}
