import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable()
export class InterceptorService implements HttpInterceptor {

  constructor( public _api: ApiService ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    this._api.isLoading.next(true);

    return next.handle(req).pipe(
      finalize(
        () => {
          this._api.isLoading.next(false);
        }
      )
    )
  }
}
