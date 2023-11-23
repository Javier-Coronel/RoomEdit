import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  /**
   * 
   */
  fd = new FormData();
  /**
   * 
   */
  images: Array<{ name: any, access: boolean, id: any }> = []
  
  constructor(private http: HttpClient) {}
  ngOnInit(){
    this.fd.append("user",localStorage.getItem("RoomEditUser") ?? "");
    this.http.get(environment.BACK_END+"/images/").subscribe(a=>{
      console.log(a)
      JSON.parse(JSON.stringify(a)).forEach((element:{name:string,access:boolean,_id:any}) => {
        this.images.push({name:environment.BACK_END+"/images/"+element.name,access:!element.access,id:element._id});
      });
    })
  }

  /**
   * 
   * @param event 
   */
  createFormData(event:any) {
    let i = 0
    while (i < event.target.files.length){
      this.fd.append('files', <File>event.target.files.item(i))
      console.log(<File>event.target.files[i])
      i++
    }
    console.log(event.target.files)
    console.log(this.fd)
    
  }

  /**
   * 
   */
  upload() {
    this.http.post(environment.BACK_END + "/images", this.fd)
    .subscribe( result => {
      console.log(result)
    });
  }

  /**
   * 
   */
  updateImage(access:boolean, id:any){
    console.log(access + " " + id)
    this.http.put(environment.BACK_END + "/images/changeAccess", {id:id,access:access})
    .subscribe( result => {
      console.log(result)
    });
  }
}
