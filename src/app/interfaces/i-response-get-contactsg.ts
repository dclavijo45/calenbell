export interface IResponseGetContactsG {
    auth_token: boolean,
    contacts: IContactsG[]
}

/***
 * @TODO type: 1 = contact, 2 = group
 */

interface IContactsG {
    id: number,
    name: string,
    type: number,
    photo?: string
}