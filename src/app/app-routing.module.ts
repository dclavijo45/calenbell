import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { HomeGuard } from './guardians/home.guard';
import { LoginGuard } from './guardians/login-guard';

const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [HomeGuard] },
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    { path: 'crearevento', component: CreateEventComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
