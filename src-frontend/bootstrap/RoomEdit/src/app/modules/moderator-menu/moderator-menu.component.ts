import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-moderator-menu',
  templateUrl: './moderator-menu.component.html',
  styleUrls: ['./moderator-menu.component.scss']
})
export class ModeratorMenuComponent {
  constructor(private http: HttpClient) {

  }
  /**El array con los usuarios que se estan mostrando. */
  Users: Array<{ name: any, banned: boolean, id: any }> = [];
  /**El array con los comentarios que se estan mostrando. */
  Comments: Array<{ _id: any, user: any, dateOfCreation: any, content: any }> = [];
  /**El array con las salas que se estan mostrando. */
  Rooms: Array<{ _id: any, user: any, name: any, image: any }> = [];
  /**El id del usuario que se esta viendo. */
  UserInViewId = "";
  userModel = { user: "" };
  ngOnInit() {
    this.searchAllUsers();
    document.getElementById("verificationOfChanges")!.style.zIndex = "-1"
  }

  /**
   * Busca a todos los usuarios de la base de datos.
   */
  searchAllUsers() {
    this.http.get(environment.BACK_END + "/users/").subscribe(
      a => {
        this.commitToUsersArray(a);
      }
    )
  }

  /**
   * Busca todas las salas reportadas.
   */
  searchReportedRooms() {
    this.UserInViewId = "";
    this.Comments = [];
    this.http.get(environment.BACK_END + "/rooms/reportedRooms").subscribe(
      a => {
        console.log(a);
        this.Rooms = [];
        JSON.parse(JSON.stringify(a)).forEach((room: { _id: any, name: string, userId: { name: string }, roomAsImage: string }) => {
          this.Rooms.push({ "_id": room._id, "user": room.userId.name, "name": room.name, "image": (room.roomAsImage) ? (environment.BACK_END + "/rooms/" + room.roomAsImage) : "assets/images/DefaultRoomImage.png" })
        })
      }
    )
  }

  /**
   * Busca todos los comentarios reportados.
   */
  searchReportedComments() {
    this.UserInViewId = "";
    this.Rooms = [];
    this.http.get(environment.BACK_END + "/comments/reportedComments").subscribe(
      a => {
        this.pushComments(a)
      }
    )
  }

  /**
   * Esta funcion buscara uno o varios usuarios. 
   */
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
   * Modifica el array de usuarios mostrados añadiendo un array de usuarios.
   * @param a El array de usuarios a añadir.
   */
  commitToUsersArray(a: Object) {
    JSON.parse(JSON.stringify(a)).forEach((element: { name: any; banned: boolean; _id: any; }) => {
      this.Users.push({ 'name': element.name, 'banned': element.banned, 'id': element._id });
    });
  }

  /**
   * Actualiza el estado de un usuario.
   * @param banned El nuevo estado del usuario.
   * @param id El id del usuario.
   */
  updateUser(banned: any, id: string) {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'PUT',
      'Access-Control-Allow-Origin': '*'
    });
    let userLogged = localStorage.getItem("RoomEditUser");
    if (userLogged) {
      let verificationOfUserChangeDiv = document.getElementById("verificationOfChanges");
      if (verificationOfUserChangeDiv != null) verificationOfUserChangeDiv.style.zIndex = "2"

      try {
        this.http.put(environment.BACK_END + "/users/changeBanningOfUser", { id: id, banned: banned }, { headers: headers }).subscribe({
          next(a) {

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
            verificationOfUserChangeDiv.style.zIndex = "-1"
            verificationOfUserChangeDiv.innerText = ""
          }
        }, 5000);
      }
    }
  }

  /**
   * Obtiene la informacion de un usuario.
   * @param id El id del usuario.
   * @param name El nombre del usuario.
   */
  dataFromUser(id: string, name: string) {

    let room: { _id: any, user: any, name: any, image: any } = { _id: "", user: "", name: "Esta sala no tienen nombre", image: "" };
    this.UserInViewId = id;
    room.user = name;
    this.http.get(environment.BACK_END + "/rooms/getAllDataByUser/" + name).subscribe({
      next: a => {
        let b = JSON.parse(JSON.stringify(a));
        room._id = b._id;
        room.name = b.name;
        room.image = (b.roomAsImage) ? (environment.BACK_END + "/rooms/" + b.roomAsImage) : "";
      },
      error: error => {
        room.image = "";
      },
      complete: () => {
        this.Rooms = []
        if (room.image != "") this.Rooms.push(room);
      },
    })

    this.http.get(environment.BACK_END + "/comments/userid/" + id).subscribe(
      a => {
        this.pushComments(a)
      }
    );
  }

  /**
   * Cambia los comentarios mostrados.
   * @param comments Los nuevos comentarios a mostrar.
   */
  pushComments(comments: any) {
    this.Comments = []
    JSON.parse(JSON.stringify(comments)).forEach((element: { _id: any, dateOfCreation: string; user: { name: any; }; content: any; }) => {
      let date: any = element.dateOfCreation.split('-');
      date = date[2].split('T')[0] + '/' + date[1] + '/' + date[0]
      this.Comments.push({ '_id': element._id, 'user': element.user.name, 'dateOfCreation': date, 'content': element.content });
    });
    console.log(this.Comments)
  }

  /**
   * Elimina una sala.
   * @param RoomToDelete El id de la sala.
   */
  deleteRoom(RoomToDelete: string) {
    this.http.delete(environment.BACK_END + "/rooms/", { body: { id: RoomToDelete } }).subscribe({
      error: error => {
        console.log(error)
        if(error.status ==200){
          this.Rooms.splice(this.Rooms.findIndex(roomToDelete => roomToDelete._id === RoomToDelete), 1);
        }
      }
    }
    )
  }

  /**
   * Elimina los reportes a una sala.
   * @param RoomToUnReport El id de la sala.
   */
  unReportRoom(RoomToUnReport: string) {
    this.http.put(environment.BACK_END + "/rooms/unReportRoom", { id: RoomToUnReport }).subscribe()
  }

  /**
   * Elimina un comentario.
   * @param id El id del comentario.
   */
  deleteComment(id: string) {
    this.http.delete(environment.BACK_END + "/comments/", { body: { id: id } }).subscribe(a => {
      if (a) this.Comments.splice(this.Comments.findIndex(commentToDelete => commentToDelete._id === id), 1);
    })
  }

  /**
   * Elimina los reportes a un comentario.
   * @param id El id del comentario.
   */
  unReportComment(id: string) {
    this.http.put(environment.BACK_END + "/comments/unReportComment", { id: id }).subscribe()
  }
}
