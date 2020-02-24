import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpResponse,
    HttpErrorResponse
} from "@angular/common/http";
import { Observable } from "rxjs";
import { HeaderService } from "@projectModules/app/services";

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
    constructor(private headerService: HeaderService) { }
    //function which will be called for all http calls
    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        //how to update the request Parameters
        let sessionData = this.headerService.getStaticHeaderData();
        let lang = "en";
        if(sessionData && sessionData.language_translation && sessionData.language_translation.current_lang)
        {
            lang = sessionData.language_translation.current_lang;
        }
        let updatedRequest = request.clone({
            headers: request.headers.set("current-lang", lang)
        });
        //logging the updated Parameters to browser's console
        // console.log("Before making api call : ", updatedRequest);
        return next.handle(updatedRequest).pipe(
            tap(
                event => {
                    //logging the http response to browser's console in case of a success
                    if (event instanceof HttpResponse) {
                        // console.log("api call success :", event);
                    }
                },
                error => {
                    //logging the http response to browser's console in case of a failuer
                    if (event instanceof HttpResponse) {
                        console.log("api call error :", event);
                    }
                }
            )
        );
    }
}