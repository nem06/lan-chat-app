import { Component , EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css'
})
export class ChatListComponent {
  @Input() chatList: any
  @Input() allUsers: any;
  @Input() liveUsers: any;
  @Input() selectedUser: any;


  @Output() chatSelected = new EventEmitter<any>();
  @Output() refreshUsers = new EventEmitter<any>();

  firstName : string | null = null;;
  showAllUsers = false;
  searhMode = false;
  searchKeyword = '';
  deviceMode:string | null = null;

  constructor(private socketService: SocketService, private router: Router, private userService: UserService) { }

  ngOnInit(){
    this.firstName = this.userService.getFirstName();
    this.deviceMode = this.userService.getDeviceMode();
  }

  ngOnChanges(changes: SimpleChanges): void {
      if (changes['selectedUser'] && changes['selectedUser'].currentValue) {
        this.showAllUsers = false;
        this.searhMode = false;
      }
    }

  searchList(){
    this.searhMode = true;
  }

  seachCancel(){
    this.searhMode = false;
    this.searchKeyword = ''
  }

  OnNewChat(){
    this.showAllUsers === false ? this.showAllUsers = true : this.showAllUsers = false
    if(this.showAllUsers)
      this.refreshUsers.emit();
  }

  OpenChat(user_id: string){
    // this.chatList.forEach((element: {
    //   rec_name: string; active_chat: number; 
    // }) => {
    //   if(element.rec_name === name)
    //     element.active_chat = 1;
    //   else
    //     element.active_chat = 0;
    // });
    // console.log(user_id)
    this.chatSelected.emit(user_id);
  }

  isToday(dateString: string): boolean {
    const inputDate = new Date(dateString);
    const today = new Date();
  
    return (
      inputDate.getFullYear() === today.getFullYear() &&
      inputDate.getMonth() === today.getMonth() &&
      inputDate.getDate() === today.getDate()
    );
  }

  Logout():void{
    this.socketService.disconnect();
    localStorage.removeItem('authToken');
    this.userService.clearUserData();
    this.router.navigate(['/login']);
  }
}
