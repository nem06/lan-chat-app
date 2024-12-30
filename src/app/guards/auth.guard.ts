import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.router.navigate(['/home']); // Redirect to home if logged in
      return false; // Block navigation to the login page
    }
    return true; // Allow access to the login page
  }
}
