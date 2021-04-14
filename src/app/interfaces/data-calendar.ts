export interface DataCalendar {
    data: [
        {
            'event': boolean,
            'day': number,
            'isLast': boolean,
            'today': boolean
        }
    ],
    month: string,
    year: number
}
