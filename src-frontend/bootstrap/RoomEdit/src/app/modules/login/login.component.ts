import { Component } from '@angular/core';
import { User } from './login.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';

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
  rute=environment.rute;
  onSubmit(user:{name:string,password:string}){
    this.submitted=true;
    const headers = new HttpHeaders({
      'Content-Type':'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Origin': '*'
    });
    console.log(user);
    this.http.post(environment.BACK_END + "/users/signin", user, {headers:headers}).subscribe(a=>{
      if(JSON.stringify(a)==='{"message":"Ok"}'){
        console.log(a);
        localStorage.setItem("RoomEditUser",user.name);
        localStorage.setItem("RoomEditPassword",user.password);
        window.location.href = 'http://' + window.location.host + this.rute;
      }
    });
    
  }
}
