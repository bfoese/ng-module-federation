import {
  Component,
  ComponentFactoryResolver,
  Injector,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { AppRouting } from './app-routing';
import {
  loadRemoteModule,
  LoadRemoteModuleOptions,
} from '@angular-architects/module-federation';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'host';

  public dynamicRouteConfig = AppRouting.DYNAMIC_APP_ROUTES;

  public readonly dynamicAppComponents: Array<
    LoadRemoteModuleOptions & {
      displayName: string;
      id: string;
      ngComponentName: string;
    }
  > = [
    // Remote entries can come from multiple remote URLs. Here we have only one remote URL that exposes a feature module and a component
    {
      remoteEntry: 'https://localhost:4201/remoteEntry.js',
      remoteName: 'micro_frontend',
      exposedModule: './FancyMap',
      displayName: 'Remote Map Component',
      id: '1',
      ngComponentName: 'MapComponent',
    },
  ];

  @ViewChild('remoteCmp', { read: ViewContainerRef, static: true })
  private remoteCmpContainer!: ViewContainerRef;

  public constructor(
    private router: Router,
    private injector: Injector,
    private cmpFactoryResolver: ComponentFactoryResolver
  ) {}

  public async ngOnInit(): Promise<void> {
    const routes = AppRouting.buildRoutes(this.dynamicRouteConfig);
    this.router.resetConfig(routes);
  }

  public async onLoadRemoteComponent(id: string): Promise<void> {
    const matchingCmp = (this.dynamicAppComponents ?? []).find(
      (cmp) => cmp.id === id
    );

    if (!matchingCmp) {
      return;
    }

    const remoteCmp = await loadRemoteModule(matchingCmp).then(
      (m) => m[matchingCmp.ngComponentName]
    );

    if (remoteCmp) {
      this.remoteCmpContainer.clear();

      const factory =
        this.cmpFactoryResolver.resolveComponentFactory(remoteCmp);

      this.remoteCmpContainer.createComponent(
        factory,
        undefined,
        this.injector
      );
    }
  }
}
