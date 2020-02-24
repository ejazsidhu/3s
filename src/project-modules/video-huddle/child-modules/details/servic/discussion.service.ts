import { Injectable, EventEmitter } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "@environments/environment";
import { HeaderService } from "@projectModules/app/services";
@Injectable({
  providedIn: "root"
})
export class DiscussionService {
  public exportDiscussionEmitter = new EventEmitter<any>();
  public dDemit = new EventEmitter<any>()
  private __editorOptions: any = {};
  private __headers: HttpHeaders;
  private __breadcrumbs: any = [];
  localgetter: any;
  __editorOptionsCom: any = {};
  constructor(private http: HttpClient, private headerService: HeaderService) {
    this.localgetter = localStorage.getItem('flag')
    this.__editorOptions = {
      theme: "snow",
      modules: {
        toolbar: {
          container: [
            // [{ font: [] }],
            ["bold", "italic", "underline"],

            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            // ["video"],
            // ["image"],

            [{ color: [] }],
            ["upload-custom"]
          ],
          handlers: {
            "upload-custom": function () {
              document.getElementById("uploader").click();
            }
          }
        }
      }
    };



  }

  public EditDiscussion(obj) {
    let path = environment.APIbaseUrl + "/edit_discussion";
    return this.http.post(path, obj);
  }

  public SetBreadcrumbs(brc) {
    this.__breadcrumbs = brc;
  }

  public GetBreadcrumbs() {
    return this.__breadcrumbs;
  }

  public parseFile(file: any) {
    // let file = event.target.files[0];
    const name = file.name; //file.name.substring(0, file.name.lastIndexOf(".")) + file.type;
    //file.name + file.name.substring(file.name.lastIndexOf("."));
    return new File([file], name, { type: file.type });
  }

  public GetEditorOptions(customProp?) {
    return this.__editorOptions;

    // if(customProp){
    //   let copy = JSON.parse(JSON.stringify(this.__editorOptions));
    //   copy.modules.toolbar.container.push([customProp]);
    //   return copy;
    // }else{
    //   return this.__editorOptions;
    // }
  }
  public GetEditorOptionsAdd(customProp?) {
    let add = {
      theme: "snow",
      modules: {
        toolbar: {
          container: [
            // [{ font: [] }],
            ["bold", "italic", "underline"],

            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            // ["video"],
            // ["image"],

            [{ color: [] }],
            ["upload-custom"]
          ],
          handlers: {
            "upload-custom": function () {
              document.getElementById("uploaderadd").click();
            }
          }
        }
      }
    };
    return add;
    // if(customProp){
    //   let copy = JSON.parse(JSON.stringify(this.__editorOptions));
    //   copy.modules.toolbar.container.push([customProp]);
    //   return copy;
    // }else{
    //   return this.__editorOptions;
    // }
  }
  public GetEditorOptionsCom(customProp?) {
    let y = {
      theme: "snow",
      modules: {
        toolbar: {
          container: [
            // [{ font: [] }],
            ["bold", "italic", "underline"],

            [{ header: 1 }, { header: 2 }],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            // ["video"],
            // ["image"],

            [{ color: [] }],
            ["upload-custom"]
          ],
          handlers: {
            "upload-custom": function () {
              // console.log(this)
              // document.querySelector('form.ng-touched > #uploaderx')[0].click();
              // $('form.ng-touched > #uploaderx').click();
              document.getElementById("uploaderx_" + customProp).click();
            }
          }
        }
      }
    };
    return y;

    // if(customProp){
    //   let copy = JSON.parse(JSON.stringify(this.__editorOptions));
    //   copy.modules.toolbar.container.push([customProp]);
    //   return copy;
    // }else{
    //   return this.__editorOptions;
    // }
  }
  public AddDiscussion(obj) {
    let path = environment.APIbaseUrl + "/add_discussion";

    return this.http.post(path, obj);
  }

  public ToFormData(obj) {
    let formData = new FormData();

    let keys = Object.keys(obj);

    keys.forEach(k => {
      if (typeof obj[k] == "string") {
        formData.append(k, obj[k]);
      } else {
        formData.append(k, JSON.stringify(obj[k]));
      }
    });

    return formData;
  }

  public GetDiscussionDetails(obj: any) {
    let path = environment.APIbaseUrl + "/discussion/discussion-detail";
    let sessoionData: any = this.headerService.getStaticHeaderData();

    this.__headers = new HttpHeaders({
      site_id: sessoionData.site_id
    });
    return this.http.post(path, obj, { headers: this.__headers });
  }

  public exportDiscussionTrigger() {
    this.exportDiscussionEmitter.emit();
  }

  public GetAvatar(user) {
    return (
      (user &&
        user.image &&
        `https://s3.amazonaws.com/sibme.com/static/users/${user.user_id}/${
        user.image
        }`) ||
      `${environment.baseUrl}/img/home/photo-default.png`
    );
  }

  public exportDiscussion(obj) {
    //from download resource
    let path;

    path = environment.APIbaseUrl + "/discussion/discussion-download";

    let form = document.createElement("form");

    form.setAttribute("action", path);

    form.setAttribute("method", "post");

    document.body.appendChild(form);

    this.appendInputToForm(form, obj);

    form.submit();

    document.body.removeChild(form);
  }

  private appendInputToForm(form, obj) {
    //from download resource
    Object.keys(obj).forEach(key => {
      let input = document.createElement("input");

      input.setAttribute("value", obj[key]);

      input.setAttribute("name", key);

      form.appendChild(input);
    });
  }

  public email_discussion(obj) {
    let path;

    path = environment.APIbaseUrl + "/exportEmail";
    return this.http.post(path, obj);
  }

  public Demit(data) {
    this.dDemit.emit(data)
  }
}
