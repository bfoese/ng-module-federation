const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = {
  output: {
    uniqueName: "micro-frontend",
    // Without this, webpack would load the remote content from the domain &
    // port of the host app, instead of using the declared remote domain & port
    publicPath: "auto"
  },
  optimization: {
    // Only needed to bypass a temporary bug
    runtimeChunk: false,
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "micro_frontend",
      filename: "remoteEntry.js",
      exposes: {
        // The name for the module can be chosen arbitrary. When loading the module at runtime, you need to provide the name that you defined here.
        './FancyMap': './projects/micro-frontend/src/app/feature/map/map.component.ts',
        "./Module": "./projects/micro-frontend/src/app/feature/profile/profile.module.ts",
      },
      shared: {
        "@angular/core": { singleton: true, strictVersion: true, eager: true },
        "@angular/common": {
          singleton: true,
          strictVersion: true,
          eager: true,
        },
        "@angular/router": {
          singleton: true,
          strictVersion: true,
          eager: true,
        },
      },
    }),
  ],
};
