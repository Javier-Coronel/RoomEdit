import { HttpClient, HttpHeaders } from '@angular/common/http';
import { verifyHostBindings } from '@angular/compiler';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.scss']
})
export class AdminMenuComponent {
  constructor(private http: HttpClient) {

  }
  /** */
  userModel = { user: "" };
  /** */
  Users: Array<{ name: any, type: any, id: any }> = [];
  /** */
  userTypes = ["User", "Mod", "Admin"];

  ngOnInit() {
    this.searchAllUsers();
    document.getElementById("verificationOfChanges")!.style.zIndex="-1"
  }
  /**Esta funcion buscara todos los usuarios de la base de datos. */
  searchAllUsers() {
    this.http.get(environment.BACK_END + "/users/").subscribe(
      a => {
        this.commitToUsersArray(a);
      }
    )
  }
  /**Esta funcion buscara uno o varios usuarios. */
  onSearch(user: { user: string } | any) {
    this.Users = [];
    if (typeof (user) === typeof (this.userModel) && user.user != "") {
      console.log(user.user);
      this.http.get(environment.BACK_END + "/users/searchByName/" + user.user).subscribe(
        a => {
          this.commitToUsersArray(a);
        }
      )
    }
    else {
      this.searchAllUsers();
    }
  }
  /**
   * 
   * @param a 
   */
  commitToUsersArray(a: Object) {
    console.log(a);
    JSON.parse(JSON.stringify(a)).forEach((element: { name: any; type: any; _id: any; }) => {
      this.Users.push({ 'name': element.name, 'type': element.type, 'id': element._id });
      console.log(this.Users);
    });
  }
  /**
   * Esta funcion actualizara el tipo de usuario que es un usuario.
   * @param user 
   * @param type 
   * @param id 
   */
  updateUser(user: string, type: any, id: string) {

    console.log(user, type.value, id);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'PUT',
      'Access-Control-Allow-Origin': '*'
    });
    console.log(user);
    let userLogged = localStorage.getItem("RoomEditUser");
    if (userLogged) {
      let verificationOfUserChangeDiv = document.getElementById("verificationOfChanges");
      if (verificationOfUserChangeDiv != null) verificationOfUserChangeDiv.style.zIndex="2"
      console.log(userLogged)
      try {
        this.http.put(environment.BACK_END + "/users/changeTypeOfUser", { id: id, type: type.value }, { headers: headers }).subscribe({
          next(a) {
            console.log(a);
            if (verificationOfUserChangeDiv != null) {
              verificationOfUserChangeDiv.style.backgroundColor = "greenyellow";
              verificationOfUserChangeDiv.innerText = "Actualizacion completa."
            }
          },
          error(error) {
            console.log(error);
            if (verificationOfUserChangeDiv != null) {
              verificationOfUserChangeDiv.style.backgroundColor = "red";
              verificationOfUserChangeDiv.innerText = "Ha ocurrido un error a la hora de actualizar los datos, pruebe mas tarde."
            }
          }});
      }catch(e){
        console.log(e)
      }
      finally{
        setTimeout(() => {
          if (verificationOfUserChangeDiv != null) {
            verificationOfUserChangeDiv.style.backgroundColor = "";
            verificationOfUserChangeDiv.style.zIndex="-1"
            verificationOfUserChangeDiv.innerText = ""
          }
        }, 5000)
      }
    }
  }
}
