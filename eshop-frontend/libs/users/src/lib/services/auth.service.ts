import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { LocalstorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiURL = environment.apiUrl;
  constructor(private http: HttpClient, private localStorage: LocalstorageService, private router: Router) { }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiURL}users/login`, { email: email, password: password })
  }
  logout() {
    this.localStorage.removeToken();
    this.router.navigate(['/login'])
  }
}
