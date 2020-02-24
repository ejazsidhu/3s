import { Component, OnInit,Input } from '@angular/core';
@Component({
  selector: 'logo-area',
  templateUrl: './logo-area.component.html',
  styleUrls: ['./logo-area.component.css']
})
export class LogoAreaComponent implements OnInit {

	@Input() details;
  constructor() { }

  ngOnInit() {
  }

  public load_bg(details):string{

     if(details && details.base_url && !details.user_current_account.accounts.image_logo){
        return encodeURI(details.base_url+details.logo_image);
     }else{
       return encodeURI(details.logo_image); 
       
     }

 }

}
