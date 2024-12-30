import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports:[
    ReactiveFormsModule, CommonModule
  ]
})

export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private apiService: ApiService, private userService: UserService,private socketService: SocketService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {      
      this.apiService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe(
        (response) => {
          localStorage.setItem('authToken', response.token);
          this.userService.setUserData(response.user_id, response.user_name, response.first_name, response.last_name);
          this.socketService.connectToSocket(response.token);
          this.router.navigate(['/home']);
        },
        (error) => {
          console.error('Login failed:', error);
        }
      );
    }
  }
}
