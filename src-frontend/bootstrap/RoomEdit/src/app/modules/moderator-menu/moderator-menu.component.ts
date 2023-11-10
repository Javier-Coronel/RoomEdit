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
  Rooms: Array<{ _id: any, user: any, name: any, image: any }> = [];
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
   * 
   */
  searchReportedRooms() {
    this.UserInViewId = "";
    this.Comments = [];
    this.http.get(environment.BACK_END + "/rooms/reportedRooms").subscribe(
      a => {
        console.log(a);
        this.Rooms = [];
        let b = JSON.parse(JSON.stringify(a));
        b.forEach((room: { _id: any, name: string, userId:{name:string}, roomAsImage: string }) => {
          this.Rooms.push({"_id":room._id,"user":room.userId.name,"name":room.name,"image":(room.roomAsImage) ? (environment.BACK_END + "/rooms/" + room.roomAsImage) : "assets/images/DefaultRoomImage.png"})
        })
      }
    )
  }

  /**
   * 
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
   * 
   * @param user 
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
   * 
   * @param a 
   */
  commitToUsersArray(a: Object) {
    let b = JSON.parse(JSON.stringify(a));
    b.forEach((element: { name: any; banned: boolean; _id: any; }) => {
      this.Users.push({ 'name': element.name, 'banned': element.banned, 'id': element._id });
    });
  }

  /**
   * 
   * @param user 
   * @param banned 
   * @param id 
   */
  updateUser(user: string, banned: any, id: string) {

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
 * 
 * @param id 
 * @param name 
 */
  dataFromUser(id: string, name: string) {
    
    let room:{ _id: any, user: any, name: any, image: any }={_id:"",user:"",name:"Esta sala no tienen nombre",image:""};
    this.UserInViewId = id;
    room.user=name;
    this.http.get(environment.BACK_END + "/rooms/getAllDataByUser/" + name).subscribe({
      next: a => {
        let b = JSON.parse(JSON.stringify(a));
        room._id=b._id;
        room.name=b.name;
        room.image=(b.roomAsImage) ? (environment.BACK_END + "/rooms/" + b.roomAsImage) : "assets/images/DefaultRoomImage.png";
      },
      error: error => {
        room.image="assets/images/DefaultRoomImage.png";
      },
      complete: ()=> {
        this.Rooms=[]
        this.Rooms.push(room);
      },
    })

    this.http.get(environment.BACK_END + "/comments/userid/" + id).subscribe(
      a => {
        this.pushComments(a)
      }
    );
  }


  pushComments(comments: any) {
    this.Comments = []
    let b = JSON.parse(JSON.stringify(comments));
    b.forEach((element: { _id: any, dateOfCreation: string; user: { name: any; }; content: any; }) => {
      let date: any = element.dateOfCreation.split('-');
      date = date[2].split('T')[0] + '/' + date[1] + '/' + date[0]
      this.Comments.push({ '_id': element._id, 'user': element.user.name, 'dateOfCreation': date, 'content': element.content });
    });
    console.log(this.Comments)
  }


  deleteRoom(RoomToDelete: string) {
    this.http.delete(environment.BACK_END + "/rooms/", { body: { id: RoomToDelete } }).subscribe()
  }
  unReportRoom(RoomToUnReport:string) {
    this.http.put(environment.BACK_END + "/rooms/unReportRoom", {id:RoomToUnReport}).subscribe()
  }

  deleteComment(id: string) {
    this.http.delete(environment.BACK_END + "/comments/", { body: { id: id } }).subscribe(a => {
      if (a) this.Comments.splice(this.Comments.findIndex(commentToDelete=>commentToDelete._id===id),1);
    })

  }
  unReportComment(id:string) {
    this.http.put(environment.BACK_END + "/comments/unReportComment", {id:id}).subscribe()
  }
}
