import { Component } from '@angular/core';
import { UserInRegistration } from './registration.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
  constructor(private http: HttpClient){

  }
  model = new UserInRegistration(1,"","","");
  submitted = false;
  rute=environment.rute
  onSubmit(user:{name:string,password:string,confirmPassword:string}){
    this.submitted=true;
    const headers = new HttpHeaders({
      'Content-Type':'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Origin': '*'
    });
    console.log(user);
    this.http.post(environment.BACK_END + "/users", user, {headers:headers}).subscribe();
  }
}
