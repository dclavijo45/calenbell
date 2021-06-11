import { Injectable } from '@angular/core';
import { ThemeColorMode } from '../interfaces/theme-color-mode';

@Injectable({
    providedIn: 'root'
})
export class ThemeColorService {
    /**
    * @usageNotes
    * `Themes:` 
    * * 0 = ligth mode
    * * 1 = dark mode
    * ### Service for set theme color
    */
    THEME_ACTIVE: number = parseInt(localStorage.getItem('theme_color')) || 0;

    // modes - styles
    MODE: ThemeColorMode = {
        bg_general: [
            { 'bg-body-default': true },
            { 'grey darken-2': true }
        ],

        nav_footer: [
            { 'blue darken-4': true },
            { 'grey darken-4': true }
        ]

    }

    changeThemeColor(theme: number): void {
        localStorage.setItem('theme_color', theme.toString());

        this.THEME_ACTIVE = theme;
    }

}
