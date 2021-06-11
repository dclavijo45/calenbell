import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'validateUsernameConfig'
})
export class ValidateUsernameConfigPipe implements PipeTransform {

    transform(value: string, response: string, type: string): string {
        const msgError: string = 'No disponible en sesión con Google';

        if (type == 'tel') {
            if (!response) return 'Sin asignar';
        };

        if (type == 'username') {
            if (value === "GoogleUser") return msgError;

            if (!response) return 'Sin asignar';
        };

        if (type == 'email') {
            if (value === "GoogleUser") return msgError;

            if (!response) return 'Sin asignar';
        };

        if (type == 'password') {
            if (value === "GoogleUser") return msgError;

            if (!response) return '***********';
        };

        return response;
    }

}
