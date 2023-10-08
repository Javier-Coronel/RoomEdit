import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.development';

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
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.gameInstance = UnityLoader.instantiate(
      'gameContainer', 
      '/assets/ProyectoFinal/Build/ProyectoFinal.json',
      {onprogress:UnityProgress}
    )
    this.http.get(environment.BACK_END+"/rooms/searchByUser/"+localStorage.getItem("RoomEditUser")).subscribe(
      a=> {
        console.log(a)
        window.onmessage = function(e:any) {
          if(e.data == "getUrl"){
            document.querySelector("iframe")?.contentWindow?.postMessage(environment.BACK_END+"|"+a,"*");
            
          }
        }
      }
    );
    
  }
}
