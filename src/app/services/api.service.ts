import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiServer = environment.apiServer;
  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(
      this.apiServer + environment.loginApi, 
      { "user_name":email, "password":password, "first_name":"", "last_name":"", "about":"" },
    );
  }

  chatList(): Observable<any>{
    return this.http.get('/sample-data/chat-list-sample.json');
  }

  chatData(): Observable<any>{
    return this.http.get('/sample-data/chat-data-sample.json');
  }

  allUsers(): Observable<any>{
    return this.http.get(this.apiServer + environment.allUsers);
  }

}


