export interface ParticipantsResponse {
    auth_token: boolean,
    reason: number,
    participants: IParticipants[]
}

/**
 * @description `statusInvitation` 0=Waiting response invitation, 1=acepted invitation, 2=refused invitation, 3=Owner
 */
export interface IParticipants {
    id: number,
    photo: string,
    name: string,
    statusInvitation: number
}