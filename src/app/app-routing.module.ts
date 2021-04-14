import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateEventComponent } from './components/create-event/create-event.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'crearevento', component: CreateEventComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
