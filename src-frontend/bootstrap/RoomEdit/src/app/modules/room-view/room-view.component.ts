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
  RoomName: string = sessionStorage.getItem("roomName")!

  constructor(private http: HttpClient) {

  }

  ValorationOfRoom() {
    let body = new HttpParams();
    if (sessionStorage.getItem("RoomEditUser") != null) {
      body = body.append("name", (localStorage.getItem("RoomEditUser") ?? "").toString())
    }
    if (sessionStorage.getItem("roomID")!=null) {
      body = body.append("room",(sessionStorage.getItem("roomID") ?? "").toString())
    }
    this.http.get(environment.BACK_END + `/valorations/findValoration/${localStorage.getItem("RoomEditUser")}/${sessionStorage.getItem("roomID")}`).subscribe(
      a=>{
        if (a==null) {
          this.http.post(environment.BACK_END + "/valorations/", {name:localStorage.getItem("RoomEditUser"), room:sessionStorage.getItem("roomID"), password:localStorage.getItem("RoomEditPassword")}).subscribe()
        } else {
          this.http.delete(environment.BACK_END + "/valorations/", {body:{name:localStorage.getItem("RoomEditUser"), room:sessionStorage.getItem("roomID"), password:localStorage.getItem("RoomEditPassword")}}).subscribe()
        }
      }
    )
  }

  CopyRoom() {
    this.http.put(environment.BACK_END + "/rooms/copyRoom", {
      "copiedRoom": sessionStorage.getItem("roomID")?.toString(), "name": localStorage.getItem("RoomEditUser")?.toString()
    }).subscribe()
  }
}
