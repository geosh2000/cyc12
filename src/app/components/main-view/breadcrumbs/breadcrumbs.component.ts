import { Component, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivationEnd, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.css']
})
export class BreadcrumbsComponent implements OnDestroy {

  title: string = ''
  tituloSubs$: Subscription;

  constructor( 
    private router: Router, 
    private titleService: Title,
    ) { 

        this.tituloSubs$ = this.getRoute()

  }

  ngOnDestroy(): void {
    this.tituloSubs$.unsubscribe()
  }

  getRoute(){

    return this.router.events
      .pipe(
        filter( event => event instanceof ActivationEnd ),
        filter( (event: ActivationEnd) => event.snapshot.firstChild === null ),
        map( (event: ActivationEnd) => event.snapshot.data ),
      )
      .subscribe( data => {

        // SET TITLE
        if( data.title ){
          this.titleService.setTitle( data.title );
          this.title =  data.title;
        }else{
          this.titleService.setTitle( 'CyC' );
          this.title = 'ComeyCome';
        }
      })
  }

  goHome(){
    this.router.navigateByUrl('')
  }

}
