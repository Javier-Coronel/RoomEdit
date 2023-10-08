import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-moderator-menu',
  templateUrl: './moderator-menu.component.html',
  styleUrls: ['./moderator-menu.component.scss']
})
export class ModeratorMenuComponent {
  constructor(private http: HttpClient) {

  }
  Users: Array<{ name: any, banned: boolean, id: any }> = [];
  Comments: Array<{ _id: any, user: any, dateOfCreation: any, content: any }> = [];
  UserInViewId = "";
  UserInViewName = "";
  RoomImageOfUserInView: string = "";
  RoomOfUserInView: string = "";
  ngOnInit() {
    this.searchAllUsers();

  }
  // Esta funcion buscara todos los usuarios de la base de datos
  searchAllUsers() {
    this.http.get(environment.BACK_END + "/users/").subscribe(
      a => {
        this.commitToUsersArray(a);
      }
    )
  }
  commitToUsersArray(a: Object) {
    console.log(a);
    let b = JSON.parse(JSON.stringify(a));
    b.forEach((element: { name: any; banned: boolean; _id: any; }) => {
      this.Users.push({ 'name': element.name, 'banned': element.banned, 'id': element._id });
      console.log(this.Users);
    });
  }
  updateUser(user: string, banned: any, id: string) {

    console.log(user, banned, id);
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
      console.log(userLogged)
      try {
        this.http.put(environment.BACK_END + "/users/changeBanningOfUser", { id: id, banned: banned }, { headers: headers }).subscribe({
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
          }
        });
      } catch (e) {
        console.log(e)
      }
      finally {
        setTimeout(() => {
          if (verificationOfUserChangeDiv != null) {
            verificationOfUserChangeDiv.style.backgroundColor = "";
            verificationOfUserChangeDiv.innerText = ""
          }
        }, 5000);
      }
    }
  }
  dataFromUser(id: string, name: string) {
    console.log(id);
    this.UserInViewId = id;
    this.UserInViewName = name;
    this.http.get(environment.BACK_END + "/rooms/getAllDataByUser/" + name).subscribe({
      next: a => {
        let b = JSON.parse(JSON.stringify(a));

        this.RoomImageOfUserInView = (b.roomAsImage)?(environment.BACK_END + "/rooms/" + b.roomAsImage):"assets/images/DefaultRoomImage.png";
        this.RoomOfUserInView = b._id;
      },
      error:error=>{
        this.RoomImageOfUserInView = "assets/images/DefaultRoomImage.png"
      }
    })
    this.Comments = []
    this.http.get(environment.BACK_END + "/comments/userid/" + id).subscribe(
      a => {
        console.log(a);
        let b = JSON.parse(JSON.stringify(a));
        console.log(b);
        b.forEach((element: { _id: any, dateOfCreation: string; user: { name: any; }; content: any; }) => {
          let date: any = element.dateOfCreation.split('-');
          date = date[2].split('T')[0] + '/' + date[1] + '/' + date[0]
          this.Comments.push({ '_id': element._id, 'user': element.user.name, 'dateOfCreation': date, 'content': element.content });
          console.log(this.Comments)
        });
      }
    );
  }
  deleteRoom(RoomToDelete:string){
    this.http.delete(environment.BACK_END + "/rooms/", {body:{id:RoomToDelete}}).subscribe()
  }
  deleteComment(id: string) {
    console.log(id)
    this.http.delete(environment.BACK_END + "/comments/", { body: { id: id } }).subscribe(a => {
      if (a) this.dataFromUser(this.UserInViewId, this.UserInViewName);
    })

  }
}
