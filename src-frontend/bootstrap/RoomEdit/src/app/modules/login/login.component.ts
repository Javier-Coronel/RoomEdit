import { Component } from '@angular/core';
import { User } from './login.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  constructor(private http: HttpClient){

  }
  model = new User("","");
  submitted = false;
  onSubmit(user:{name:string,password:string}){
    this.submitted=true;
    const headers = new HttpHeaders({
      'Content-Type':'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Origin': '*'
    });
    console.log(user);
    this.http.post("http://localhost:5000/users/signin", user, {headers:headers}).subscribe();
  }
}
