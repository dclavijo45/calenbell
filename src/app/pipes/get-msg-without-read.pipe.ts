import { Pipe, PipeTransform } from '@angular/core';
import { IChats } from '../interfaces/i-chats';
import { SocketWebService } from '../services/socket-web.service';

@Pipe({
    name: 'getMsgWithoutRead'
})
export class GetMsgWithoutReadPipe implements PipeTransform {

    constructor(private socketWebSvc: SocketWebService) { }

    transform(value: IChats[], idContact: number, typeContact: number): string {
        let msgNotRead: number = 0;
        console.log("get from pipe");

        value.forEach((chat) => chat.subject.id_subject == idContact && chat.type == typeContact ? chat.messages.forEach((msg) => !msg.read ? msgNotRead++ : true) : true);

        return msgNotRead >= 99 ? '99+' : msgNotRead.toString();
    }

}
