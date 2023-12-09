import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'unity',
  templateUrl: './unity.component.html',
  styleUrls: ['./unity.component.scss']
})
export class UnityComponent implements OnInit {
  gameInstance: any;
  progress = 0;
  isReady = false;
  buildURL = "assets/ProyectoFinal/Build"
  @Output() onUnityLoaded = new EventEmitter<any>();
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get(environment.BACK_END+"/rooms/searchByUser/"+localStorage.getItem("RoomEditUser")).subscribe(
      a=> {
        console.log(a)
        let b = ()=>{
          console.log("unity loaded")
          this.onUnityLoaded.emit();}
        window.onmessage = function(e:any) {
          if(e.data == "getUrl"){
            document.querySelector("iframe")?.contentWindow?.postMessage(environment.BACK_END+"|"+a,"*");
            b()
          }
        }
      }
    );
  }
}
