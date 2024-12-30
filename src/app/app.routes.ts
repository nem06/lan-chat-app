import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // Default route
  { path: 'login', component: LoginComponent, canActivate: [AuthGuard] },         // Login route
  { path: 'home', component: HomeComponent },
  { path: '**', redirectTo: 'home' }, 
];


