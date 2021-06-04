const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");

module.exports = {
  output: {
    uniqueName: "host",
    // Without this, webpack would load the remote content from the domain &
    // port of the host app, instead of using the declared remote domain & port
    publicPath: "auto"
  },
  optimization: {
    // Only needed to bypass a temporary bug
    runtimeChunk: false
  },
  plugins: [
    new ModuleFederationPlugin({
      // It is also possible to declare the remote modules/components that the
      // host wants to consume over here. But this would mean to hardcode the
      // remote URLs at build time. More flexible approach is to dynamically
      // load the remote URLs at runtime, as shown in this repo.
      remotes: {
      },
      shared: {
        "@angular/core": { singleton: true, strictVersion: true, eager: true },
        "@angular/common": { singleton: true, strictVersion: true, eager: true },
        "@angular/router": { singleton: true, strictVersion: true, eager: true }
      }
    }),
  ],
};
