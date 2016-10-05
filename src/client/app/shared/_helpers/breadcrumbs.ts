import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/filter';

@Component({
    selector: 'sd-breadcrumbs',
    template: `
  <div>
    breadcrumbs: 
    <span *ngFor="let breadcrumb of breadcrumbs; let last = last">
      <a [routerLink]="breadcrumb.url">{{breadcrumb.label}}</a>
      <span *ngIf="!last">></span>
    </span>
  </div>`
})
export class BreadcrumbsComponent {
    breadcrumbs: Array<Object>;
    constructor(private router: Router, private route: ActivatedRoute) { }
    ngOnInit() {
        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe(event => {  // note, we don't use event
                this.breadcrumbs = [];
                let currentRoute = this.route.root,
                    url = '';
                do {
                    let childrenRoutes = currentRoute.children;
                    console.log(childrenRoutes);
                    currentRoute = null;
                    childrenRoutes.forEach(route => {
                        if (route.outlet === 'primary') {
                            let routeSnapshot = route.snapshot;
                            console.log('snapshot:', routeSnapshot)
                            url += '/' + routeSnapshot.url.map(segment => segment.path).join('/');
                            this.breadcrumbs.push({
                                label: route.snapshot.data['breadcrumb'],
                                url: url
                            });
                            currentRoute = route;
                        }
                    })
                } while (currentRoute);
            })
    }
}