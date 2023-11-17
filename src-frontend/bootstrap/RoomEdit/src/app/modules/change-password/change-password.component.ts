import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  constructor(private http: HttpClient) {

  }
  model = { id: "", password: "", confirmPassword: "" };

  submitted = false;

  rute=environment.rute;

  onSubmit(user: { password: string, confirmPassword: string }) {
    if (user.password == user.confirmPassword) {
      this.submitted = true;
      
      const changePassword = {code:localStorage.getItem("RoomEditUser"), actualPassword:localStorage.getItem("RoomEditPassword"), password:user.password, confirmPassword:user.confirmPassword}
      console.log(changePassword)
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'PUT',
        'Access-Control-Allow-Origin': '*'
      });
      console.log(user);
      this.http.put(environment.BACK_END + "/users/changePassword", changePassword, { headers: headers }).subscribe(a => {
        if (JSON.stringify(a) === '{"message":"Ok"}') {
          console.log(a);
          localStorage.setItem("RoomEditPassword", changePassword.password);
          window.location.href = 'http://' + window.location.host + this.rute;
        }
      });
    }
  }
}
