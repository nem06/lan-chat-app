import { Component, HostListener } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { Router } from '@angular/router';
import { FormsModule  } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChatListComponent } from "../chat-list/chat-list.component";
import { ChatWindowComponent } from "../chat-window/chat-window.component";
import { ApiService } from '../services/api.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule, ChatListComponent, ChatWindowComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  private socketSubscription!: Subscription;
  messages: string = '';
  textMsg: string = '';
  liveUsers: number[] = [];
  // selectedUser: string = '';

  isMobile: boolean = false;
  visibleComponent: number = 1;

  allUsers: any;
  allUsersDict: any = {};
  chatList:any;
  chatListDict: { [key: string]: 
    { user_id: number,
      name:string,
      last_msg: string,
      last_msg_time: any, 
      unread_count: number
    } } = {};
  allChats: any = {};
  currentUser: any;
  scrollChat:any;

  constructor (private socketService: SocketService, private router: Router, private apiService: ApiService, private userService: UserService) {  }

  ngOnInit(): void{
    this.checkScreenSize();
    // this.fetchChatList();
    this.fetchAllUsers();
    this.socketSubscription = this.socketService.homeCompMsg.subscribe((message) => {
      if (message.Type === 'LiveUsers') {
        this.UpdateLiveUsers(message.Users);
      }
      else if(message.Type === "OneToOne"){
        this.onNewMessage(message.FromUser, message.Message)
      }
      else if(message.Type === 'SelfCopy'){
        if(!this.allChats.hasOwnProperty(message.ToUser))
          this.allChats[message.ToUser] = { user_id: message.ToUser, name: this.allUsersDict[message.ToUser].name, messages: [] }
        this.allChats[message.ToUser].messages.push(JSON.parse(message.Message));
        this.onSentMessage(message.ToUser)
      }
      // else if (message.Type === 'BroadcastMessage' || message.Type === 'PersonalMessage'){
      //   this.updateMsgs(message.Message)
      // }
    });
  }
  
  onChatSelected(user_id: any) {
    this.currentUser = user_id;
    if(this.allChats != undefined && this.allChats.hasOwnProperty(user_id)){
      this.chatListDict[user_id].unread_count = 0
    }
    else{
      this.allChats[user_id] = { user_id: user_id, name: this.allUsersDict[user_id].name, messages: [] }
      //this.currentChat = this.allChats[user_id];
    }

    if (this.isMobile) {
      this.visibleComponent = 2;
    }
  }

  onSentMessage(tmpUsr:number){
    var tempUser = tmpUsr;
    if(this.chatListDict != undefined && this.chatListDict.hasOwnProperty(tempUser)){
      this.chatListDict[tempUser].last_msg = this.allChats[tempUser].messages[this.allChats[tempUser].messages.length  - 1].msg_text.replaceAll('<br/>', '    ')
      this.chatListDict[tempUser].last_msg_time = this.allChats[tempUser].messages[this.allChats[tempUser].messages.length  - 1].time
      this.chatListDict[tempUser].unread_count = 0
    }
    else{
      this.chatListDict[tempUser] = { 
        user_id: tempUser, 
        name: this.allUsersDict[tempUser].name, 
        last_msg: this.allChats[tempUser].messages[this.allChats[tempUser].messages.length  - 1].msg_text.replaceAll('<br/>', '    '),
        last_msg_time: this.allChats[tempUser].messages[this.allChats[tempUser].messages.length  - 1].time,
        unread_count: 0
      }
    }
    this.chatList = []
    for(let key in this.chatListDict){
      this.chatList.push(this.chatListDict[key])
    }
    this.sortChatList()
  }

  onNewMessage(FromUser:any, Message:any){
    if(this.allChats != undefined && this.allChats.hasOwnProperty(FromUser)){
      this.allChats[FromUser].messages.push(JSON.parse(Message));
    }
    else{
      this.allChats[FromUser] = { user_id: FromUser, name: this.allUsersDict[FromUser].name, messages: [] }
      this.allChats[FromUser].messages.push(JSON.parse(Message))
    }
    if(this.chatListDict != undefined && this.chatListDict.hasOwnProperty(FromUser)){
      this.chatListDict[FromUser].last_msg = this.allChats[FromUser].messages[this.allChats[FromUser].messages.length  - 1].msg_text.replaceAll('<br/>', '    ')
      this.chatListDict[FromUser].last_msg_time = this.allChats[FromUser].messages[this.allChats[FromUser].messages.length  - 1].time
      this.chatListDict[FromUser].unread_count += 1
    }
    else{
      this.chatListDict[FromUser] = { 
        user_id: FromUser, 
        name: this.allUsersDict[FromUser].name, 
        last_msg: this.allChats[FromUser].messages[this.allChats[FromUser].messages.length  - 1].msg_text.replaceAll('<br/>', '    '),
        last_msg_time: this.allChats[FromUser].messages[this.allChats[FromUser].messages.length  - 1].time,
        unread_count: 1
      }
    }
    this.chatList = []
    for(let key in this.chatListDict){
      this.chatList.push(this.chatListDict[key])
    }
    this.sortChatList()
    if(this.currentUser == FromUser){
      this.chatListDict[FromUser].unread_count = 0
      this.scrollChat = Math.random()
    }
      
  }

  fetchAllUsers(){
    this.apiService.allUsers().subscribe(
      (response) => { 
        response.forEach((user:any) => {
          this.allUsersDict[user.user_id] = user;
        })
        this.allUsers = response.sort((a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name));
        this.allUsers.forEach((element:any)  => {
          element['status'] = 'offline';
        });
      }
    );
  }

  fetchChatList(){
    this.apiService.chatList().subscribe(
      (response) => { 
        this.chatList = this.sortChatList();
      }
    );
  }

  sortChatList(){
    return this.chatList.sort((a:any, b:any) => {
        return new Date(b.last_msg_time).getTime() - new Date(a.last_msg_time).getTime();
      }
   );
  }

  UpdateLiveUsers(lUsers: number[]):void{
    this.liveUsers = lUsers;
    // this.allUsers.forEach((user:any) => {
    //   user.
    // })
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768; // Define breakpoint
    if (!this.isMobile) {
      this.userService.setDeviceMode("window")
      this.visibleComponent = 1; // Reset on larger screens
    }
    else{
      this.userService.setDeviceMode("mobile")
    }
  }

  back(){
    this.currentUser = null
    this.toggleComponent(1);
  }

  toggleComponent(componentNumber: number) {
    if (this.isMobile) {
      this.visibleComponent = componentNumber;
    }
  }

  // onSelectionChange(value: string): void{
  //   this.selectedUser = value;
  // }

  // updateMsgs(msg: string): void{
  //   this.messages += "<br />" + '' + msg.replace(/\r?\n/g,'<br/>');
  // }

  // sendMsg(): void {
  //   if(this.textMsg != ''){
  //     if(this.selectedUser == "all")
  //       var msgType = "Broadcast"
  //     else
  //       var msgType = "OneToOne"
  //     var payLoad = { "Type":msgType, "ToUser": this.selectedUser, "Message" :this.textMsg }
  //     this.socketService.sendMessage(JSON.stringify(payLoad))
  //     this.messages +=  "<br />" + 'You ('+ this.selectedUser +'): ' + this.textMsg.replace(/\r?\n/g,'<br/>'); 
  //     this.textMsg = ''
  //   }
  // }

  // Logout():void{
  //   this.socketService.disconnect();
  //   localStorage.removeItem('authToken');
  //   this.router.navigate(['/login']);
  // }
}
