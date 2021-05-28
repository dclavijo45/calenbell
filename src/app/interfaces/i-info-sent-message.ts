/***
 * @TODO typeMessage: 1 = one_one, 2 = group
 */

export interface IInfoSentMessage {
    subject: ISubject,
    typeMessage: number,
    token: string
}

interface ISubject {
    name: string,
    photo: string,
    online?: boolean,
    id_subject: number
}
