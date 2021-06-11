import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { ManageEventComponent } from './components/events/manage-event/manage-event.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RootHomeComponent } from './components/root-home/root-home.component';
import { UserConfigComponent } from './components/user-config/user-config.component';
import { HomeGuard } from './guardians/home.guard';
import { LoginGuard } from './guardians/login-guard.guard';

const routes: Routes = [
    { path: '', component: RootHomeComponent },
    { path: 'home', component: HomeComponent, canActivate: [HomeGuard] },
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    { path: 'controlevento', component: ManageEventComponent, canActivate: [HomeGuard] },
    { path: 'chat', component: ChatComponent, canActivate: [HomeGuard] },
    { path: 'documentation', component: DocumentationComponent },
    { path: 'contact', component: ContactUsComponent },
    { path: 'settings', component: UserConfigComponent, canActivate: [HomeGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
