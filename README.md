# NgModuleFederation

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.0.3.

Angular Demo for loading feature modules and components from remote
applications dynamically by utilizing Module Federation which was introduced with
Webpack 5.

More details in this article series: https://www.angulararchitects.io/aktuelles/the-microfrontend-revolution-module-federation-in-webpack-5/

## Run the Demo

Open two terminals and start the host application and the microfontend. Both
applications run under different ports:

```bash
# run host and remote app concurrently
npm run start

# or run them seperately
npm run start:host
npm run start:mfe
```

Both applications can be opened in the Browser in standalone mode. To see the
module federation in action, open the host app in the browser:

http://localhost:4200

The host app provides links to lazy load a module and a component from the
remote micro frontend.

## About Module Federation

### Problems being solved

- One application "shell" (the host) can dynamically load several "remote"
  frontend applications or only parts (modules/ components) of them
- This approach allows to create seperately compiled and seperately deployed
  Microfrontends. The frontends can expose some or all of their
  modules/components for other apps to consume.
- The remote app URLs to consume exposed modules/components can be provided
  dynamically at runtime of the host application.

### Technical Requirements

- Module Federation was introduced in Webpack 5.0.0.
- Angular CLI 11 still uses Webpack 4.x.x per default. Using this version of
  Angular, you must provide an override to enforce using Webpack 5.0.0. This is
  being accomplished by switching to Yarn, setting `resolution` property in
  `package.json` to use Webpack 5.
- Since Angular 12, Webpack 5.x.x is being used per default and the override is
  no longer needed. This means you can also use npm instead of yarn again, if
  preferred and setting `resolution` property in `package.json` is omitted.
- No matter what version of Angular you use, you must adapt the `angular.json`
  to use a custom webpack config by defining `extraWebpackConfig`, replacing the
  builders by `ngx-build-plus` (installing that package is required) and
  creating the referenced webpack config files. These adaptions can be applied
  automatically with the schematic `@angular-architects/module-federation`.
  However, the webpack configs which are created by this schematic can be
  simplified (as shown in this project).

### Required project adaptions


- Starting the remote app standalone would throw an error in the browser
  console, indicating that shared modules must be loaded eager. This can be
  resolved by either setting the shared modules in the remote app webpack config
  to be `eager: true` or by loading the whole remote app dynamically by renaming
  the remotes `main.ts` to `bootstrap.ts` and creating a new `main.ts` which
  imports the `bootstrap.ts` file
- The remote apps which expose modules/components, need to declare what they want
  to expose within their custom webpack config.
- The host app has two options to declare the remote import URLs. First option
  is to declare the remote URLs in the custom webpack config of the host and map
  them to a name which will be used in the routing modules. The second option is
  to not declare the URLs in the webpack config but use a dynamic loader within
  the routing modules. The disadvantage of the first option is, that you need to
  know the remote URLs at compile time of the host app, whereas with the second
  option you could dynamically load the remote URLs at runtime.
- In case the remote URLs are hardcoded in the routing files of the Host app,
  the Host needs a Typescript declaration file in which the remote modules are
  being declared, otherwise the TS compiler will cry on the paths in hosts
  routing modules.


#### Adaptions for angular.json

- For host and nested application, switch the browser builder from
  `@angular-devkit/build-angular:browser` to `ngx-build-plus:browser`
- For host and nested application, switch the server builder from
  `@angular-devkit/build-angular:dev-server` to `ngx-build-plus:dev-server`
- Point host and nested application to the custom webpack config file within
  `build` and `serve` (and probably also `test`) configuration block

```json
"extraWebpackConfig": "projects/host-app/webpack.config.js"
```

Manfred Steyr provided a schematic for doing the angular.json adaptions and
creating the associated webpack config files (but the created webpack.config.js
file can also be much more simplified as shown in this repo):

```bash
ng add @angular-architects/module-federation --project host-app --port 4200
```

This schematic would additionally configure the project to NOT use a common chunk
file (https://juristr.com/blog/2021/02/common-chunk-lazy-loading-angular-cli/):

```json
"commonChunk": false
```

### Adaptions for Main.ts

 Rename the `main.ts` of the application to `bootstrap.ts` for example and then
 create a new `main.ts` with only an import for the bootstrap file:

````bash
# main.ts
import('./bootstrap');
````

This way, the bootstrap file will be loaded as a lazy chunk file.


````bash
Initial Chunk Files               | Names     |      Size
polyfills.js                      | polyfills |   2.42 MB
styles.css, styles.js             | styles    |   2.30 MB
main.js                           | main      |  27.76 kB

Lazy Chunk Files                  | Names     |      Size
projects_host_src_bootstrap_ts.js | -         | 105.36 kB
````

## Resolving problems/ errors

### Webpack uses location and port of the host/shell app to load the remote content instead of the defined remote URLs

Since Angular 12 the webpack config must explicitly contain `publicPath:
'auto'`.

```bash
#webpack.config.js
 output: {
    uniqueName: "micro-frontend",
    publicPath: "auto"
  },
```

If this property is being set, webpack will load the remote content from the
declared remote URLs. If the property is not explicitly set, Webpack will try to
load the remote content by using location and port of the host/shell app, even
when the remote URLs are configured correctly.

### Uncaught Error: Shared module is not available for eager consumption: 7023

This error would show up at runtime in the browser console.

Within the custom webpack config you can declare shared modules:

```javascript
# webpack.config.js
new ModuleFederationPlugin({
      remotes: {
      },
      shared: {
        "@angular/core": { singleton: true, strictVersion: true },
        "@angular/common": { singleton: true, strictVersion: true },
        "@angular/router": { singleton: true, strictVersion: true }
      }
    }),
```

The error can be resolved by declaring the shared modules to be loaded eagerly:

```javascript
# webpack.config.js
new ModuleFederationPlugin({
      remotes: {
      },
      shared: {
        "@angular/core": { singleton: true, strictVersion: true, eager: true },
        "@angular/common": { singleton: true, strictVersion: true, eager: true },
        "@angular/router": { singleton: true, strictVersion: true, eager: true }
      }
    }),
```

But the better solution would be to keep the modules lazy (therefore do not
apply `eager: true`) and load the whole application lazy instead. This can be
accomplished by making the above described adaptions to the `main.ts` file.
