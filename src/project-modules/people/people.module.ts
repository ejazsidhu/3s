import { NgModule } from '@angular/core';

// import { CommonModule } from '@angular/common';
// // import { SharedModule } from './child-components/shared/shared.module';
// import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';
// import { BsDropdownModule, TooltipModule, CollapseModule } from 'ngx-bootstrap';
// import { ToastrModule } from 'ngx-toastr';

// import { RootComponent } from './components/root/root.component';

import { __IMPORTS, __DECLARATIONS, __PROVIDERS } from "./components.barrel";
import { PeopleRoutes } from './people-routes';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [__IMPORTS, PeopleRoutes,SharedModule
    // CommonModule,
    // PeopleRoutes,
    // // SharedModule,
    // LoadingBarHttpClientModule,
    // BsDropdownModule.forRoot(),
    // ToastrModule.forRoot({
    //   enableHtml:true
    // }),
    // TooltipModule.forRoot(),
    // CollapseModule.forRoot(),
  ],
  declarations: [__DECLARATIONS],
  providers: [__PROVIDERS]
})
export class PeopleModule { }
