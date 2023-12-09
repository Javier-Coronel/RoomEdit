import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  /**Comprueba que el usuario esta logueado. */
  RegisteredUser: boolean = false;
  /**Las salas cargadas. */
  Rooms: Array<{ imageOfRoom: string, nameOfRoom: string, id: string }> = [];
  /**Los comentarios de la sala actual. */
  Comments: Array<{ _id: any, user: any, dateOfCreation: any, content: any }> = [];
  /**La sala que esta viendo el usuario si no se esta editando su sala. */
  ActualRoom: string = (sessionStorage.getItem("roomID") ?? "").toString();
  /**La ruta de la sala que esta viendo el usuario si no se esta editando su sala. */
  RoomImage: string = environment.BACK_END + "/rooms/" + (sessionStorage.getItem("roomID") ?? "").toString() + ".png";
  /**El nombre de la sala que esta viendo el usuario si no se esta editando su sala. */
  RoomName: string = sessionStorage.getItem("roomName")!
  userModel = "";
  /**Array con todos los usuarios que se estan mostrando en la pagina. */
  Users: Array<{ name: any, id: any }> = [];
  /**El modelo de comentario que puede hacer un usuario. */
  commentModel = { comment: "" };
  /**Objeto que contiene el nombre y el color de la sala del usuario */
  UserRoom = { name: "", backgroundColor: "#000000" }
  /**Comprueba si la parte de unity */
  UnityActive: boolean = false;
  /**La valoracion que le ha dado el usuario registrado a una sala. */
  UserValoration: boolean = sessionStorage.getItem("UserValoration") !== null;
  /**Detecta el cambio entre dos salas. */
  RoomLoading: boolean = true
  constructor(private http: HttpClient) {

  }

  ngOnInit() {
    this.getRooms('sortByValorations');
    if (localStorage.getItem("RoomEditUser")) {
      console.log(this.ActualRoom)
      this.getComments();
      this.RegisteredUser = true;
      this.getRoom();
    }
    console.log(this.Rooms)
  }

  /**
   * Obtiene todas las salas.
   * @param type El orden en el que se van a obtener las salas.
   */
  getRooms(type?: string) {
    this.Rooms = [];
    this.http.get(environment.BACK_END + "/rooms/" + ((typeof type === "undefined")? "": type)).subscribe(
      a => {
        console.log(a)
        let b = JSON.parse(JSON.stringify(a));
        b.forEach((element: { roomAsImage: string; name: string; _id: string; userId: { name: string; }; }) => {
          this.pushRoom(element);
        });
        b.forEach((element: { room: { roomAsImage: string; name: string; _id: string; userId: { name: string; }; } })=>{
          this.pushRoom(element.room);
        })
        if (!this.RegisteredUser && !sessionStorage.getItem("roomID")) this.changeToRoomView(this.Rooms[0].id, this.Rooms[0].nameOfRoom);
      }
    );
  }

  /**
   * Obtiene la sala de un usuario.
   * @param user El nombre del usuario del que se obtiene la sala, si no se da la sala se obtendra del usuario registrado.
   */
  getRoom(user?: string) {
    this.http.get(environment.BACK_END + "/rooms/getAllDataByUser/" + ((!user) ? localStorage.getItem("RoomEditUser") : user)).subscribe(
      a => {
        let b = JSON.parse(JSON.stringify(a));
        console.log(b)
        if (!user) {
          this.UserRoom.name = b.name
          this.UserRoom.backgroundColor = b.backgroundColor
          console.log(this.UserRoom)
        } else {
          console.log(user)
          this.changeToRoomView(b._id, (b.name) ? b.name : "Sala de " + user)
        }
      }
    )
  }

  /**
   * Añade una sala al array de salas.
   * @param room La sala a añadir.
   */
  pushRoom(room: { roomAsImage: string; name: string; _id: string; userId: { name: string; }; }) {
    try {
      this.Rooms.push({ 'imageOfRoom': environment.BACK_END + "/rooms/" + room.roomAsImage, 'nameOfRoom': (room.name) ? room.name : "Sala de " + room.userId.name, 'id': room._id });
    } catch (error) { }
  }

  /**
   * Obtiene los comentarios de sala en la que el usuario se encuentra.
   */
  getComments() {
    this.Comments = [];
    let commentsUrl = environment.BACK_END + (this.ActualRoom === "" ? "/comments/roomofuser/" + localStorage.getItem("RoomEditUser") : "/comments/roomid/" + this.ActualRoom);
    this.http.get(commentsUrl).subscribe(
      a => {
        console.log(a);
        JSON.parse(JSON.stringify(a)).forEach((element: { _id: any, dateOfCreation: string; user: { name: any; }; content: any; }) => {
          let date: any = element.dateOfCreation.split('-');
          date = date[2].split('T')[0] + '/' + date[1] + '/' + date[0]
          try {
            this.Comments.push({ '_id': element._id, 'user': element.user.name, 'dateOfCreation': date, 'content': element.content });
          } catch (error) { }
          console.log(this.Comments)
        });
      }
    );
  }

  /**
   * Cambia la sala que se esta viendo.
   * @param id El id de la sala.
   */
  changeToRoomView(id: string, name: string) {
    this.ActualRoom = id;
    sessionStorage.setItem("roomID", id);
    sessionStorage.setItem("roomName", name);
    this.RoomImage = environment.BACK_END + "/rooms/" + id + ".png";
    this.RoomName = name;
    if (this.RegisteredUser) {
      this.http.get(environment.BACK_END + `/valorations/findValoration/${localStorage.getItem("RoomEditUser")}/${id}`).subscribe(
        a => {
          console.log(a)
          if (a !== null) sessionStorage.setItem("UserValoration", "");
          else sessionStorage.removeItem("UserValoration")
          this.UserValoration = sessionStorage.getItem("UserValoration") !== null
          console.log("Prueba 4 " + (sessionStorage.getItem("UserValoration") !== null))
          console.log(this.UserValoration)

        }
      )
    }

    this.RoomLoading = false;
    setTimeout(() => {
      this.RoomLoading = true
    })
    this.getComments();
  }

  /**
   * Envia un comentario al servidor para ser posteado.
   * @param comment El contenido del comentario.
   */
  onCommentSubmit(comment: { comment: string }) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Origin': '*'
    });
    console.log(comment);
    let user = localStorage.getItem("RoomEditUser");
    if (user) {
      console.log(user)
      if (this.ActualRoom != '') {
        this.http.post(environment.BACK_END + "/comments", { user: user, room: this.ActualRoom, content: comment.comment }, { headers: headers }).subscribe(a => {
          this.getComments();
        });
      }
      else {
        this.http.get(environment.BACK_END + "/rooms/searchByUser/" + localStorage.getItem("RoomEditUser")).subscribe(
          a => {
            console.log(a)
            this.http.post(environment.BACK_END + "/comments", { user: user, room: a, content: comment.comment }, { headers: headers }).subscribe(a => {
              this.getComments();
            });
          }
        );
      }
    }
  }
  
  /**
   * Esta funcion buscara uno o varios usuarios. 
   */
  onSearch(user: string) {
    console.log(user)
    this.Users = [];
    this.http.get(environment.BACK_END + "/users/searchByName/" + user.toString()).subscribe(
      a => {
        JSON.parse(JSON.stringify(a)).forEach((element: { name: any; _id: any; }) => {
          this.Users.push({ 'name': element.name, 'id': element._id });
        });
      }
    )
  }

  /**
   * Reporta un comentario.
   * @param id El id del comentario.
   */
  reportComment(id: any) {
    this.http.put(environment.BACK_END + "/comments/reportComment", { "id": id }).subscribe()
  }

  /**
   * Actualiza la variable 
   */
  ActivateUnityOptions() {
    this.UnityActive = true
  }

  /**
   * Cambia el nombre de la sala.
   * @param e El evento que contiene el nuevo nombre a poner.
   */
  changeRoomName(e: any) {
    this.http.get(environment.BACK_END + "/rooms/searchByUser/" + localStorage.getItem("RoomEditUser")).subscribe(a => {
      console.log(a)
      this.http.put(environment.BACK_END + "/rooms/renameRoom", { id: a, name: e.target.value }).subscribe()
    })
  }

  /**
   * Cambia el color de la sala.
   * @param e El evento que contiene el codigo hexadecimal del color a poner.
   */
  setBackgroundColor(e: any) {
    console.log(e.target.value)
    document.querySelector("iframe")?.contentWindow?.postMessage(e.target.value, "*");
  }
}

