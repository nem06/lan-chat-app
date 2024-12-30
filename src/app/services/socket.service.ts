import { Injectable } from '@angular/core';
import { BehaviorSubject, raceWith, Subject } from 'rxjs';
import { environment } from '../../../environment'; 
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: WebSocket | null = null;
  private apiServer = environment.apiServer; 
  private socketUrl = this.apiServer.replace("https","wss") + environment.webSocketAPI;
  public homeCompMsg = new Subject<any>();

  // Subject to track if the socket is connected
  private socketStatus = new BehaviorSubject<boolean>(false);
  private reconnectInterval: any = null;

  constructor(private userService:UserService) { }

  connectToSocket(token: string) {
    const urlWithToken = `${this.socketUrl}?token=${token}`; 
    
    this.socket = new WebSocket(urlWithToken);

    this.socket.onopen = () => {
      console.log('Connected to WebSocket server');
      this.socketStatus.next(true); 

      if (this.reconnectInterval) {
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }

      setInterval(()=>{
        var payLoad = { "Type":"LivePing" };
        this.sendMessage(JSON.stringify(payLoad))
      }, 5000)

    };

    this.socket.onclose = () => {
      console.log('Disconnected from WebSocket server');
      this.socketStatus.next(false);  
      if(this.userService.loggedOut === true){
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = null;
      }

      if (!this.reconnectInterval && this.userService.loggedOut === false) {
        this.reconnectInterval = setInterval(() => {
            console.log('Attempting to reconnect...');
            this.connectToSocket(token);      
        }, 5000);
      }
    };

    this.socket.onerror = (error) => {
      //console.error('WebSocket error', error);
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.Type === 'LiveUsers' || data.Type === 'BroadcastMessage' || data.Type === 'OneToOne' || data.Type === 'SelfCopy') {
        this.homeCompMsg.next(data);
      }
    };
  }

  isSocketConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  sendMessage(message: string) {
    if (this.socket && this.isSocketConnected()) {
      this.socket.send(message);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}
