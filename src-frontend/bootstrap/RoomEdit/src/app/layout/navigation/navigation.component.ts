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
  classToSearch = "mdc-button mat-mdc-button mat-unthemed mat-mdc-button-base"
  ngOnInit() {
    if (localStorage.getItem("RoomEditUser")) {
      this.getLoggedUser();
    }else{
      setTimeout(()=>{
        let links = document.getElementById("notLogged")?.getElementsByClassName(this.classToSearch) ?? [];
        this.searchActualLocation(links);
      })
      
    }
  }
  getLoggedUser() {
    this.http.get(environment.BACK_END + "/users/searchByCode/" + localStorage.getItem("RoomEditUser")).subscribe(
      a => {
        let b = JSON.parse(JSON.stringify(a));
        this.LoggedUser = { 'name': b.name, 'type': b.type, 'id': b._id };
        if (this.LoggedUser != null) {
          setTimeout(() => {
            let links = document.getElementById("logged")?.getElementsByClassName(this.classToSearch) ?? [];
            if (window.location.pathname == "/") {
              links[0].setAttribute("class", "mdc-button mdc-button--outlined mat-mdc-outlined-button mat-unthemed mat-mdc-button-base");
            } else {
              this.searchActualLocation(links);
            }
          })
        }
      }
    )
  }
  searchActualLocation(links: any) {
    let a = links?.length
    for (let index = 0; index < (a ?? 0); index++) {
      const element = links[index];
      if (element.getAttribute("href") == window.location.pathname) {
        element.setAttribute("class", "mdc-button mdc-button--outlined mat-mdc-outlined-button mat-unthemed mat-mdc-button-base")
        break;
      }
    }
  }
  logout() {
    localStorage.clear();
    window.location.href = 'http://' + window.location.host;
  }
  openRoom() {
    if (window.location.pathname == '/' && sessionStorage.getItem("roomID")) {
      sessionStorage.removeItem("roomID");
      window.location.href = window.location.href;
    } else if (window.location.pathname != '/') {
      sessionStorage.removeItem("roomID");
      window.location.href = 'http://' + window.location.host;
    }
  }
}


