export interface ISocketSentMessage {
    message: string,
    token: string,
    info_profile_group?: IInfoProfileGroup
}


interface IInfoProfileGroup {
    photo: string,
    online: boolean,
    name: string
}