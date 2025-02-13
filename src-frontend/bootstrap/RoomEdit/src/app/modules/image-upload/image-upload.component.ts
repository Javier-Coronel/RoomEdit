import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent {
  /**La informacion que se va a mandar al backend (el nombre del usuario y las imagenes que manda). */
  fd = new FormData();
  /**Las imagenes que estan en el servidor. */
  images: Array<{ name: any, access: boolean, id: any, url: string }> = []
  /**Los lugares donde estan las imagenes que va a enviar el usuario al servidor. */
  previewImages: string[] = [];

  constructor(private http: HttpClient) { }
  ngOnInit() {
    this.fd.append("user", localStorage.getItem("RoomEditUser") ?? "");
    this.http.get(environment.BACK_END + "/images/").subscribe(a => {
      console.log(a)
      JSON.parse(JSON.stringify(a)).forEach((element: { name: string, access: boolean, _id: any }) => {
        this.images.push({ name: element.name, access: !element.access, id: element._id, url: environment.BACK_END + "/images/" + element.name });
      });
    })
  }

  /**
   * Añade las imagenes a la informacion que se va a mandar.
   * @param event 
   */
  createFormData(event: any) {
    this.fd.delete('files')
    this.previewImages = [];
    for (let i = 0; i < event.target.files.length; i++) {
      this.fd.append('files', <File>event.target.files.item(i))
      console.log(<File>event.target.files[i])
      const reader = new FileReader();
      reader.onload = e => this.previewImages[i] = reader.result?.toString() ? reader.result?.toString() : "";
      reader.readAsDataURL(event.target.files[i]);
    }
    console.log(event.target.files)
    console.log(this.fd.getAll('files'))
  }

  /**
   * Envia la imagenes al backend para ser guardadas y añadidas a la base de datos.
   */
  upload() {
    this.http.post(environment.BACK_END + "/images", this.fd)
      .subscribe(result => {
        console.log(result)
        this.fd.delete('files')
      });
  }

  /**
   * Cambia el acceso a una imagen.
   */
  updateImage(access: boolean, id: any) {
    console.log(access + " " + id)
    this.http.put(environment.BACK_END + "/images/changeAccess", { id: id, access: access })
      .subscribe(result => {
        console.log(result)
      });
  }
}
