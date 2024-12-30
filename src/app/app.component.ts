import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { SocketService } from './services/socket.service';
import { UserService } from './services/user.service';
import { FormsModule  } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'lan-chat-app';

  constructor( private socketService: SocketService, private router: Router, private userService: UserService) {  }

  ngOnInit() {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.socketService.connectToSocket(token);    
      this.userService.loggedOut = false
    }
    else 
      this.router.navigate(['/login']);
  }
}
