/***
 * @TODO type: 1 = one-one, 2 = group
 */

export interface IChats {
    type: number,
    subject: ISubject,
    messages: IMessagesList[]
}

export interface IMessagesList {
    text: string,
    // type?: number,
    read: boolean,
    subject: ISubject,
    by_me: boolean
}

/***
 * @TODO id_subject: -1 = i'm user
 */

interface ISubject {
    photo: string,
    name: string,
    online: boolean,
    id_subject: number
}