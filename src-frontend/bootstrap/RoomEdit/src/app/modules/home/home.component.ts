import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  RegisteredUser: boolean = false;
  Rooms: Array<{ imageOfRoom: string, nameOfRoom: string, id: string }> = [];
  Comments: Array<{ user: any, dateOfCreation: any, content: any }> = [];
  ActualRoom: string = (sessionStorage.getItem("roomID") ?? "").toString();
  RoomImage: string = environment.BACK_END + "/rooms/" + (sessionStorage.getItem("roomID") ?? "").toString() + ".png";
  constructor(private http: HttpClient) {

  }
  ngOnInit() {
    if (localStorage.getItem("RoomEditUser")) {
      console.log(this.ActualRoom)
      this.getComments();
      this.RegisteredUser = true;
    }
    this.getRooms();
    console.log(this.Rooms)
  }

  /**
   * Obtiene todas las salas.
   */
  getRooms(type?: string) {
    this.Rooms = [];
    if (!type || type=="sortByModificaction") {
      this.http.get(environment.BACK_END + "/rooms/").subscribe(
        a => {
          console.log(a);
          let b = JSON.parse(JSON.stringify(a));
          b.forEach((element: { roomAsImage: string; name: string; _id: string; userId: { name: string; }; }) => {
            try {
              this.Rooms.push({ 'imageOfRoom': environment.BACK_END + "/rooms/" + element.roomAsImage, 'nameOfRoom': (element.name) ? element.name : "Sala de " + element.userId.name, 'id': element._id });
            } catch (error) { }
          });
        }
      );
    }
    else if(type == "sortByValorations" || type=="sortByComments"){
      this.http.get(environment.BACK_END + "/rooms/" + type).subscribe(a=>{
        let b = JSON.parse(JSON.stringify(a));
        console.log(b)
          b.forEach((element:{ room:{ roomAsImage: string; name: string; _id: string; userId: { name: string; }; }}) => {
            try {
              this.Rooms.push({ 'imageOfRoom': environment.BACK_END + "/rooms/" + element.room.roomAsImage, 'nameOfRoom': (element.room.name) ? element.room.name : "Sala de " + element.room.userId.name, 'id': element.room._id });
            } catch (error) { }
          });
      })
    }
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
        let b = JSON.parse(JSON.stringify(a));
        b.forEach((element: { dateOfCreation: string; user: { name: any; }; content: any; }) => {
          let date: any = element.dateOfCreation.split('-');
          date = date[2].split('T')[0] + '/' + date[1] + '/' + date[0]
          try {
            this.Comments.push({ 'user': element.user.name, 'dateOfCreation': date, 'content': element.content });
          } catch (error) { }
          console.log(this.Comments)
        });
      }
    );
  }

  commentModel = { comment: "" };

  changeToRoomView(id: string) {
    this.ActualRoom = id;
    sessionStorage.setItem("roomID", id);
    this.RoomImage = environment.BACK_END + "/rooms/" + id + ".png"
    this.getComments();
  }

  /**
   * Envia un comentario al servidor para ser posteado.
   * @param comment El contenido del comentario
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
}

