import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userId: string | null = null;
  userName: string | null = null;
  firstName: string | null = null;
  lastName: string | null = null;
  deviceMode:string | null = null;
  loggedOut:boolean | null = null;


  constructor() { }

  setUserData(id: string, userName: string, firstName: string, lastName: string): void {
    this.loggedOut = false;
    this.userId = id;
    localStorage.setItem('userId', id); 
    this.userName = userName;
    localStorage.setItem('userName', userName);
    this.firstName = firstName;
    localStorage.setItem('firstName', firstName);
    this.lastName = lastName;
    localStorage.setItem('lastName', lastName);
  }
  
  setDeviceMode(device:string): void {
    this.deviceMode = device
  }

  getDeviceMode(): string | null {
    return this.deviceMode 
  }
  
  getUserId(): string | null {
    if (!this.userId) {
      this.userId = localStorage.getItem('userId');
    }
    return this.userId;
  }
  
  getUsername(): string | null {
    if (!this.userName) {
      this.userName = localStorage.getItem('userName'); 
    }
    return this.userName;
  }

  getFirstName(): string | null {
    if (!this.firstName) {
      this.firstName = localStorage.getItem('firstName'); 
    }
    return this.firstName;
  }

  getLastName(): string | null {
    if (!this.lastName) {
      this.lastName = localStorage.getItem('lastName'); 
    }
    return this.lastName;
  }
  
  clearUserData(): void {
    this.loggedOut = true;
    this.userId = null;
    this.userName = null;
    this.firstName = null;
    this.lastName = null;
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
  }
  
}
