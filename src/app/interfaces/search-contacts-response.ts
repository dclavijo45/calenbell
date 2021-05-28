export interface SearchContactsResponse {
    auth_token: boolean,
    users: IUsers[]
}

interface IUsers {
    id: number,
    name: string,
    photo: string
}
