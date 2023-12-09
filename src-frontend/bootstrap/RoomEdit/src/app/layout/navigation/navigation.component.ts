import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

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
  rute=environment.rute
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

  /**
   * Comprueba si el usuario esta loggeado.
   */
  getLoggedUser() {
    this.http.get(environment.BACK_END + "/users/searchByCode/" + localStorage.getItem("RoomEditUser")).subscribe(
      a => {
        let b = JSON.parse(JSON.stringify(a));
        this.LoggedUser = { 'name': b.name, 'type': b.type, 'id': b._id };
        if (this.LoggedUser != null) {
          setTimeout(() => {
            let links = document.getElementById("logged")?.getElementsByClassName(this.classToSearch) ?? [];
            if (window.location.pathname == this.rute + "/") {
              links[0].setAttribute("class", "mdc-button mdc-button--outlined mat-mdc-outlined-button mat-unthemed mat-mdc-button-base");
            } else {
              this.searchActualLocation(links);
            }
          })
        }
      }
    )
  }

  /**
   * Busca en que pagina esta el usuario para cambiar el boton seleccionado.
   * @param links 
   */
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

  /**
   * Cierra la sesion del usuario.
   */
  logout() {
    localStorage.clear();
    window.location.href = 'http://' + window.location.host + this.rute;
  }

  /**
   * Accede a la pagina principal.
   */
  openRoom() {
    if (window.location.pathname == '/' && sessionStorage.getItem("roomID")) {
      sessionStorage.removeItem("roomID");
      window.location.href = window.location.href + this.rute;
    } else if (window.location.pathname != '/') {
      sessionStorage.removeItem("roomID");
      window.location.href = 'http://' + window.location.host + this.rute;
    }
  }
}


