import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  constructor(private http: HttpClient) {

  }
  LoggedUser: { name: any, type: any, id: any } | null = null;
  ngOnInit() {
    if (localStorage.getItem("RoomEditUser")) {
      this.getLoggedUser();
    }
  }
  getLoggedUser() {
    this.http.get(environment.BACK_END + "/users/searchByCode/" + localStorage.getItem("RoomEditUser")).subscribe(
      a => {
        let b = JSON.parse(JSON.stringify(a));
        this.LoggedUser = { 'name': b.name, 'type': b.type, 'id': b._id };
        console.log(this.LoggedUser)
      }
    )
  }
  logout(){
    localStorage.clear();
    window.location.href = 'http://' + window.location.host;
  }
  openRoom(){
    console.log(window.location.pathname)
    if(window.location.pathname=='/' && sessionStorage.getItem("roomID")){
      sessionStorage.removeItem("roomID");
      window.location.href = window.location.href;
    }else if(window.location.pathname!='/'){
      sessionStorage.removeItem("roomID");
      window.location.href = 'http://' + window.location.host;
    }
  }
}


