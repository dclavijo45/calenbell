import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import { ThemeColorMode } from '../interfaces/theme-color-mode';

@Injectable({
    providedIn: 'root'
})
export class ThemeColorService {

    detectChangeTheme: Subject<boolean> = new Subject();

    listenChangeTheme(): Observable<boolean> {
        return this.detectChangeTheme.asObservable();
    }

    emitChangeState(): void {
        this.detectChangeTheme.next(true);
    }

    /**
    * @usageNotes
    * `Themes:` 
    * * 0 = ligth mode
    * * 1 = dark mode
    * ### Service for set theme color
    */
    THEME_ACTIVE: number = parseInt(localStorage.getItem('theme_color')) || 0;

    // modes - styles
    MODE = {
        bg_general: [
            { 'bg-body-default': true },
            { 'grey darken-2': true }
        ],
        root_home: {
            bg: [
                { 'bg-color-cus-1': true },
                { 'grey darken-2': true }
            ]
        },
        login: {
            login_text: [
                { '': true },
                { 'grey-text text-lighten-4': true }
            ],
            btn_login: [
                { 'pink accent-1': true },
                { 'blue darken-4': true }
            ],
            btn_register: [
                { 'pink accent-1': true },
                { 'blue darken-4': true }
            ],
            register_text: [
                { '': true },
                { 'grey-text text-lighten-4': true }
            ],
            input: {
                text: [
                    { '': true },
                    { 'grey-text text-lighten-4': true }
                ]
            },
            remember_pwd: {
                text: [
                    { 'grey-text text-darken-3 hover-cus-1-l': true },
                    { 'grey-text text-lighten-2 hover-cus-1-d': true }
                ]
            },
            recovery_pwd: {
                title: [
                    { '': true },
                    { 'grey-text text-lighten-3': true }
                ],
                btn_return: [
                    { 'pink accent-1': true },
                    { 'red': true }
                ]
            }
        },
        nav_footer: [
            { 'blue darken-4': true },
            { 'grey darken-4': true }
        ],
        calendar: [
            { 'grey lighten-5': true },
            { 'grey darken-4': true }
        ],
        calendar_arrows: [
            { 'black-text hover-cus-1-l': true },
            { 'white-text hover-cus-1-d': true }
        ],
        calendar_month_year: [
            { '': true },
            { 'grey-text text-lighten-2': true }
        ],
        calendar_months: [
            { 'style-cus-1 text-color-cus-1': true },
            { 'grey-text text-lighten-5 font-weigth-500 opacity-0-6': true }
        ],
        calendar_normal_days: [
            { 'hover-cus-1-l': true },
            { 'grey-text text-lighten-1 hover-cus-1-d': true }
        ],
        calendar_days_last: [
            { 'calendar__last-days': true },
            { 'grey-text text-darken-1': true }
        ],
        calendar_day_today: [
            { 'teal lighten-1 hover-cus-2-l': true },
            { 'grey darken-2 hover-cus-2-d': true }
        ],
        calendar_day_event: [
            { 'b-color-4 hover-cus-1-l': true },
            { 'grey-text text-lighten-3 b-color-6 hover-cus-1-d': true }
        ],
        events_today: [
            { 'grey lighten-5': true },
            { 'grey darken-4 white-text': true }
        ],
        events_today_thead: [
            { '': true },
            { 'grey darken-3 white-text': true }
        ],
        events_today_no_events: [
            { '': true },
            { 'white-text font-weight-400': true }
        ],
        events_today_titles: [
            { '': true },
            { 'white-text font-weight-400': true }
        ],
        events_today_tbody: [
            { '': true },
            { 'grey darken-1 white-text font-weight-100': true }
        ],
        events_today_data: [
            { '': true },
            { 'white-text font-weight-400': true }
        ],
        input_search: {
            input: [
                { '': true },
                { 'grey-text text-lighten-3 dark-mode': true }
            ],
            prefix: [
                { '': true },
                { 'dark-mode grey-text text-lighten-1': true }
            ]
        },
        options_table: {
            btn_add: [
                { 'cyan darken-4': true },
                { 'grey darken-4': true }
            ]
        },
        table: {
            bg: [
                { 'white': true },
                { 'grey darken-4': true }
            ],
            titles: [
                { '': true },
                { 'grey-text text-lighten-2 font-weight-400': true }
            ],
            nthchild_events: [
                { 'nth-child-cus-1-l hover-cus-1-l': true },
                { 'nth-child-cus-1-d hover-cus-1-d grey-text text-lighten-3 ': true }
            ]
        },
        aside_info_e: {
            bg: [
                { 'grey lighten-5': true },
                { 'grey darken-4': true }
            ],
            title: [
                { '': true },
                { 'grey-text text-lighten-2': true }
            ],
            title_field: [
                { 'indigo-text text-lighten-1': true },
                { 'grey-text text-lighten-4': true }
            ],
            info_field: [
                { '': true },
                { 'grey-text text-lighten-3': true }
            ],
            name_participant: [
                { '': true },
                { 'grey-text text-lighten-3': true }
            ],
            bg_participant: [
                { '': true },
                { 'grey darken-3 grey-text text-lighten-3': true }
            ]
        },
        manage_event: {
            title: [
                { '': true },
                { 'grey-text text-lighten-5': true }
            ],
            text_field: [
                { '': true },
                { 'grey-text text-lighten-3': true }
            ],
            icon_color: [
                { '': true },
                { 'grey-text text-lighten-2': true }
            ],
            btn_edit_add: [
                { '': true },
                { 'grey darken-4': true }
            ]
        },
        chat: {
            info: {
                bg: [
                    { 'grey lighten-5': true },
                    { 'grey darken-4': true }
                ],
                profile: {
                    options: [
                        { 'hover-more-options-l': true },
                        { 'hover-more-options-d grey-text text-lighten-3': true }
                    ],
                    options_submenu: [
                        { 'indigo lighten-5': true },
                        { 'grey-text text-lighten-3 grey darken-3': true }
                    ],
                    text_status: [
                        { 'green-text text-accent-5': true },
                        { 'grey-text text-lighten-3': true }
                    ]
                },
                contact_list: [
                    { 'grey lighten-5': true },
                    { 'grey darken-4': true }
                ],
                search_contacts: [
                    { 'grey lighten-5': true },
                    { 'grey darken-4': true }
                ],
                input_search_contacts: [
                    { '': true },
                    { 'grey-text dark-mode': true }
                ],
                btn: {
                    bg: [
                        { 'blue lighten-2 waves-light': true },
                        { 'grey lighten-4 waves-dark': true }
                    ],
                    text_bg: [
                        { '': true },
                        { 'grey-text text-darken-2': true }
                    ],
                    text: [
                        { '': true },
                        { 'grey-text text-lighten-2': true }
                    ]
                },
                contact_list_friends: {
                    bg: [
                        { 'hover-contact-l': true },
                        { 'hover-contact-d': true }
                    ],
                    options_contact: [
                        { 'hover-more-options-l': true },
                        { 'hover-more-options-c-d grey-text text-lighten-3': true }
                    ],
                    more_options: [
                        { 'indigo lighten-5': true },
                        { 'grey grey-darken-3 grey-text text-darken-4': true }
                    ],
                    latest_msg: [
                        { '': true },
                        { 'grey-text text-lighten-5': true }
                    ],
                    not_contact_group: [
                        { '': true },
                        { 'grey-text text-lighten-3': true }
                    ],
                    not_found_search: [
                        { '': true },
                        { 'grey-text text-lighten-3': true }
                    ]
                }
            },
            messages: {
                bg_profile: [
                    { 'grey lighten-5': true },
                    { 'grey darken-4': true }
                ],
                name: [
                    { '': true },
                    { 'grey-text text-lighten-2': true }
                ],
                clean_chat: [
                    { 'hover-more-options-l': true },
                    { 'hover-more-options-d grey-text text-lighten-3': true }
                ],
                clean_chat_submenu: [
                    { 'indigo lighten-5': true },
                    { 'grey-text text-lighten-3 grey darken-3': true }
                ],
                input_field: [
                    { 'grey lighten-5': true },
                    { 'grey-text text-lighten-3 grey darken-4': true }
                ],
                input_field_entry: [
                    { '': true },
                    { 'grey-text text-lighten-3 dark-mode-msg': true }
                ],
                chat_one: {
                    bubble_left: [
                        { 'left-top-l bg-color-cus-2': true },
                        { 'grey darken-3 left-top-d': true }
                    ],
                    bubble_right: [
                        { 'right-top-l bg-color-cus-2': true },
                        { 'grey darken-3 right-top-d': true }
                    ],
                    msg: [
                        { '': true },
                        { 'grey-text text-lighten-3': true }
                    ]
                },
                chat_group: {
                    bubble_left: [
                        { 'left-top-l bg-color-cus-2': true },
                        { 'grey darken-3 left-top-d': true }
                    ],
                    bubble_right: [
                        { 'right-top-l bg-color-cus-2': true },
                        { 'grey darken-3 right-top-d': true }
                    ],
                    msg: [
                        { '': true },
                        { 'grey-text text-lighten-3': true }
                    ]
                }
            },
            view_init: {
                img_bg: [
                    { 'bg-img-1-l grey lighten-5': true },
                    { 'bg-img-1-d grey darken-4': true }
                ]
            },
            add_contacts: {
                bg: [
                    { 'grey lighten-5': true },
                    { 'grey darken-4': true }
                ],
                title: [
                    { '': true },
                    { 'grey-text text-lighten-3': true }
                ],
                input: {
                    field: [
                        { '': true },
                        { 'dark-mode grey-text text-lighten-3': true }
                    ],
                    prefix: [
                        { '': true },
                        { 'grey-text dark-mode': true }
                    ]
                },
                name: [
                    { '': true },
                    { 'grey-text text-lighten-2': true }
                ],
                btn: {
                    btn_add: [
                        { '': true },
                        { 'darken-4': true }
                    ],
                    btn_delete: [
                        { '': true },
                        { 'darken-4': true }
                    ]
                },
                not_found_search: [
                    { '': true },
                    { 'grey-text text-lighten-3': true }
                ]
            }
        },
        user_settings: {
            carrousel: {
                bg_border: [
                    { 'grey lighten-5': true },
                    { 'grey darken-4': true }
                ],
                bg_tabs: [
                    { 'grey lighten-5': true },
                    { 'grey darken-4': true }
                ],
                text_tabs: [
                    { '': true },
                    { 'grey-text text-lighten-3': true }
                ],
                profile: {
                    bg: [
                        { 'grey lighten-5': true },
                        { 'grey darken-4': true }
                    ]
                    ,
                    border: [
                        { 'border-cus-1-l': true },
                        { 'border-cus-1-d': true }
                    ],
                    logo_info: [
                        { '': true },
                        { 'grey-text text-lighten-1': true }
                    ],
                    arrow_indicator: [
                        { '': true },
                        { 'grey-text text-lighten-1': true }
                    ],
                    mode_edit: [
                        { 'hover-cus-1-l': true },
                        { 'grey-text text-lighten-1 hover-cus-1-d': true }
                    ],
                    mode_done: [
                        { 'hover-cus-1-l green-text': true },
                        { 'grey-text text-lighten-3 hover-cus-1-d': true }
                    ],
                    info_mode: [
                        { '': true },
                        { 'grey-text text-lighten-3': true }
                    ],
                    input: [
                        { '': true },
                        { 'grey-text text-lighten-3 dark-mode': true }
                    ]
                },
                security: {
                    bg: [
                        { 'grey lighten-5': true },
                        { 'grey darken-4': true }
                    ]
                    ,
                    border: [
                        { 'border-cus-1-l': true },
                        { 'border-cus-1-d': true }
                    ],
                    logo_info: [
                        { '': true },
                        { 'grey-text text-lighten-1': true }
                    ],
                    input: [
                        { '': true },
                        { 'grey-text text-lighten-3 dark-mode': true }
                    ], mode_edit: [
                        { 'hover-cus-1-l': true },
                        { 'grey-text text-lighten-1 hover-cus-1-d': true }
                    ]
                },
                customice: {
                    bg: [
                        { 'grey lighten-5': true },
                        { 'grey darken-4': true }
                    ]
                    ,
                    border: [
                        { 'border-cus-1-l': true },
                        { 'border-cus-1-d': true }
                    ],
                    logo_info: [
                        { '': true },
                        { 'grey-text text-lighten-1': true }
                    ],
                },
                notify: {
                    bg: [
                        { 'grey lighten-5': true },
                        { 'grey darken-4': true }
                    ]
                    ,
                    border: [
                        { 'border-cus-1-l': true },
                        { 'border-cus-1-d': true }
                    ],
                    logo_info: [
                        { '': true },
                        { 'grey-text text-lighten-1': true }
                    ],
                }
            }
        }

    }

    changeThemeColor(theme: number): void {
        localStorage.setItem('theme_color', theme.toString());

        this.THEME_ACTIVE = theme;
    }

}
