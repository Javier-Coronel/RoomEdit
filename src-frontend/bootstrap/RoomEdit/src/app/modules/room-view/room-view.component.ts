import { Component, Input } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-room-view',
  templateUrl: './room-view.component.html',
  styleUrls: ['./room-view.component.scss']
})
export class RoomViewComponent {
  @Input() RoomImage:string = environment.BACK_END+"/rooms/"+sessionStorage.getItem("roomID")+".png"; 
  RoomName:string = sessionStorage.getItem("roomName")!
}
