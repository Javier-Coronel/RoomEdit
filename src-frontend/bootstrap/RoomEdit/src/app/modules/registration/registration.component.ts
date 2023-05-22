import { Component } from '@angular/core';
import { UserInRegistration } from './registration.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  constructor(private http: HttpClient){

  }
  model = new UserInRegistration(1,"","","","");
  submitted = false;
  onSubmit(user:{name:string,email:string,password:string,confirmPassword:string}){
    this.submitted=true;
    const headers = new HttpHeaders({
      'Content-Type':'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Origin': '*'
    });
    console.log(user);
    this.http.post("http://localhost:5000/users", user, {headers:headers}).subscribe();
  }
}
