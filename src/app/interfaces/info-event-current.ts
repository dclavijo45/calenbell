export interface InfoEventCurrent {
    title: string,
    hour: string,
    date: IDate,
    description: string,
    typeEvent: number,
    id: number,
    icon: string,
    participants: IParticipants[],
    owner: boolean
}

interface IDate {
    day: number,
    month: number,
    year: number
}

/**
 * @description `statusInvitation` 0=Waiting response invitation, 1=acepted invitation, 2=refused invitation, null=Not invited
 */
interface IParticipants {
    id: number,
    photo: string,
    name: string,
    statusInvitation: number
}