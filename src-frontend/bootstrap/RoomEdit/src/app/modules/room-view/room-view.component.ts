import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-room-view',
  templateUrl: './room-view.component.html',
  styleUrls: ['./room-view.component.scss']
})
export class RoomViewComponent {
  @Input() RoomImage: string = environment.BACK_END + "/rooms/" + sessionStorage.getItem("roomID") + ".png";
  @Input() RoomName: string = sessionStorage.getItem("roomName")!;
  @Input() UserValoration: boolean = sessionStorage.getItem("UserValoration") !== null;
  RegisteredUser: boolean = false;
  constructor(private http: HttpClient) {

  }

  ngOnInit() {
    if (localStorage.getItem("RoomEditUser")) {
      this.RegisteredUser = true
    }
    console.log("Prueba 1 " + (sessionStorage.getItem("UserValoration") !== null))
    console.log(this.UserValoration)
    
  }

  ValorationOfRoom() {
    if (localStorage.getItem("RoomEditUser") !== null && sessionStorage.getItem("roomID") !== null) {
      this.http.get(environment.BACK_END + `/valorations/findValoration/${localStorage.getItem("RoomEditUser")}/${sessionStorage.getItem("roomID")}`).subscribe(
        a => {
          if (a == null) {
            this.http.post(environment.BACK_END + "/valorations/", { name: localStorage.getItem("RoomEditUser"), room: sessionStorage.getItem("roomID"), password: localStorage.getItem("RoomEditPassword") }).subscribe(
              a => {
                this.UserValoration = true
                sessionStorage.setItem("UserValoration", "");
                console.log("Prueba 2 " + (sessionStorage.getItem("UserValoration") !== null))
                console.log(this.UserValoration)
              }
            )
          } else {
            let quitValoration = () => {
              this.UserValoration = false
              sessionStorage.removeItem("UserValoration")
              console.log("Prueba 3 " + (sessionStorage.getItem("UserValoration") !== null))
              console.log(this.UserValoration)
            }
            this.http.delete(environment.BACK_END + "/valorations/", { body: { name: localStorage.getItem("RoomEditUser"), room: sessionStorage.getItem("roomID"), password: localStorage.getItem("RoomEditPassword") } }).subscribe({
              next(a) { },
              error(error) {
                quitValoration()
              }
            }
            )
          }
        }
      )
    }
  }

  CopyRoom() {
    this.http.put(environment.BACK_END + "/rooms/copyRoom", {
      "copiedRoom": sessionStorage.getItem("roomID")?.toString(), "name": localStorage.getItem("RoomEditUser")?.toString()
    }).subscribe()
  }

  reportRoom() {
    this.http.put(environment.BACK_END + "/rooms/reportRoom", { "id": sessionStorage.getItem("roomID")?.toString() }).subscribe()
  }
}
