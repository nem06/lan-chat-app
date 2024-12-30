import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { UserService } from '../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import moment from 'moment-timezone';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent {

  @Input() sharedChats: any;

  @Output() sharedChatsChange = new EventEmitter<any>();

  @Input() selectedUser: any;
  @Input() scrollChat: any;

  @Output() back = new EventEmitter<any>();
  inputMsg = ''
  selfUserID:any ;
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  constructor(private socketService: SocketService, private userService: UserService) { }

  ngOnInit(){
    this.selfUserID = this.userService.getUserId()
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scrollChat']) {
      if(this.selectedUser != null)
          this.scrollToEnd();
    }
    if (changes['selectedUser']) {
        if(this.selectedUser != null)
          this.jumpToEnd()
    }
  }

  sortMessages(chatData1: any){
    return chatData1.sort((a:any, b:any) => {
        return new Date(a.time).getTime() - new Date(b.time).getTime();
      }
   );
  }

  backToList(){
    this.back.emit();
  }

  handleKeydown(event: KeyboardEvent){
    if(this.isMobileDevice() && event.key === 'Enter'){

    }
    else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent adding a new line
      if(this.inputMsg.trim())
        this.sendMsg(); // Call the send method
    } else if (event.key === 'Enter' && event.shiftKey) {
      // Allow default behavior (new line)
    }
  }

  isMobileDevice(): boolean {
    return /Mobi|Android/i.test(navigator.userAgent);
  }

  sendMsg(){
    var msg = { 
      temp_msgid: Math.floor(Math.random())*1000,
      sender: this.userService.getUserId(),
      time: moment().format("YYYY-MM-DDTHH:mm:ssZ"),
      msg_text: this.inputMsg.trim().replace(/\r?\n/g,'<br/>')
    }
    var payLoad = {
      "Type": "OneToOne",
      "ToUser": this.selectedUser,
      "Message": JSON.stringify(msg)
    }
    this.socketService.sendMessage(JSON.stringify(payLoad))
    this.sharedChats[this.selectedUser].messages.push(msg);
    this.sharedChatsChange.emit(this.selectedUser);
    this.inputMsg = ""
    this.scrollToEnd()
  }

  jumpToEnd(){
    setTimeout(() =>{
      const container = this.messageContainer.nativeElement;
      container.style.scrollBehavior = 'auto';
      container.scrollTop = container.scrollHeight;
      container.style.scrollBehavior = '';
    },10)
  }

  scrollToEnd(){
    setTimeout(() =>{
      const container = this.messageContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    },10)
  }
}
