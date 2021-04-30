import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
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
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatTableModule,
        SocialLoginModule
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
