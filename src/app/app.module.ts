import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import {
    NgxAwesomePopupModule,
    ToastNotificationConfigModule
} from '@costlydeveloper/ngx-awesome-popup';


import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { ManageEventComponent } from './components/events/manage-event/manage-event.component';
import { AsideInfoComponent } from './components/aside-info/aside-info.component';

// Client API Google
import { SocialLoginModule, SocialAuthServiceConfig } from 'angularx-social-login';
import {
    GoogleLoginProvider,
    FacebookLoginProvider
} from 'angularx-social-login';
import { AsideInfoEventComponent } from './components/aside-info-event/aside-info-event.component';
import { GetSizeScrollDirective } from './directives/get-size-scroll.directive';
import { ChatComponent } from './components/chat/chat.component';
import { UserConfigComponent } from './components/user-config/user-config.component';
import { RootHomeComponent } from './components/root-home/root-home.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { SetLocationScrollDirective } from './directives/set-location-scroll.directive';
import { GetMsgWithoutReadPipe } from './pipes/get-msg-without-read.pipe';
import { ValidateUsernameConfigPipe } from './pipes/validate-username-config.pipe';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        NavComponent,
        FooterComponent,
        HomeComponent,
        ManageEventComponent,
        AsideInfoComponent,
        AsideInfoEventComponent,
        GetSizeScrollDirective,
        ChatComponent,
        UserConfigComponent,
        RootHomeComponent,
        DocumentationComponent,
        ContactUsComponent,
        SetLocationScrollDirective,
        GetMsgWithoutReadPipe,
        ValidateUsernameConfigPipe
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatTableModule,
        SocialLoginModule,
        PdfViewerModule,
        NgxAwesomePopupModule.forRoot(),
        ToastNotificationConfigModule.forRoot({
            GlobalSettings: {
                AllowedNotificationsAtOnce: 3
            }
        })

    ],
    providers: [
        {
            provide: 'SocialAuthServiceConfig',
            useValue: {
                autoLogin: false,
                providers: [
                    {
                        id: GoogleLoginProvider.PROVIDER_ID,
                        provider: new GoogleLoginProvider(
                            '168438402105-f7om5vulo404bcpg8evq0h67f876rn4h.apps.googleusercontent.com'
                        )
                    },
                    // {
                    //     id: FacebookLoginProvider.PROVIDER_ID,
                    //     provider: new FacebookLoginProvider('clientId')
                    // }
                ]
            } as SocialAuthServiceConfig,
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
