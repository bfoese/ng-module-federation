import {
  loadRemoteModule,
  LoadRemoteModuleOptions,
} from '@angular-architects/module-federation';
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export class AppRouting {
  public static readonly STATIC_APP_ROUTES: Routes = [
    {
      path: '',
      component: HomeComponent,
      pathMatch: 'full',
    },

    // {
    //   path: 'profile',
    //   loadChildren: () => loadRemoteModule({
    //       remoteEntry: 'https://localhost:4201/remoteEntry.js',
    //       remoteName: 'micro_frontend',
    //       exposedModule: './Module'
    //     })
    //     .then(m => m.ProfileModule)
    // },
  ];

  /**
   * This could be loaded by a service. Here the remote URLs are defined
   * dynamically at runtime instead of being hardcoded in the webpack config
   * file, which is being resolved at build time.
   */
  public static readonly DYNAMIC_APP_ROUTES: Array<
    LoadRemoteModuleOptions & {
      displayName: string;
      routePath: string;
      ngModuleName: string;
    }
  > = [
    // Remote entries can come from multiple remote URLs. Here we have only one remote URL that exposes a feature module and a component
    {
      remoteEntry: 'https://localhost:4201/remoteEntry.js',
      remoteName: 'micro_frontend',
      exposedModule: './Module',
      displayName: 'Remote Profile Module',
      routePath: 'remote-profile-module',
      ngModuleName: 'ProfileModule',
    },
  ];

  public static buildRoutes(
    dynamicRouteConfig: Array<
      LoadRemoteModuleOptions & {
        routePath: string;
        ngModuleName: string;
      }
    >
  ): Routes {
    const lazyRoutes: Routes = dynamicRouteConfig.map((o) => ({
      path: o.routePath,
      loadChildren: () => loadRemoteModule(o).then((m) => m[o.ngModuleName]),
    }));

    return [...this.STATIC_APP_ROUTES, ...lazyRoutes];
  }
}
