import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
    let component: ChatComponent;
    let fixture: ComponentFixture<ChatComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatComponent]
        })
            .compileComponents();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('attr isChatting should be false', () => {
        let isChatting: boolean = component.isChatting;

        expect(isChatting).toBeFalse();
    })
});
