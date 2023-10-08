import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  
  fd = new FormData();
  images: string[] = []
  constructor(private http: HttpClient) {}
  ngOnInit(){
    this.fd.append("user",localStorage.getItem("RoomEditUser") ?? "");
    this.http.get(environment.BACK_END+"/images/names").subscribe(a=>{
      let b = JSON.parse(JSON.stringify(a));
      b.forEach((element:{name:string}) => {
        this.images.push(environment.BACK_END+"/images/"+element.name);
      });
    })
  }
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

  upload() {
    this.http.post(environment.BACK_END + "/images", this.fd)
    .subscribe( result => {
      console.log(result)
    });
  }
}
