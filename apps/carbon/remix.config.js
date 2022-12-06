const { flatRoutes } = require("remix-flat-routes");

module.exports = {
  serverBuildTarget: "vercel",
  // When running locally in development mode, we use the built in remix
  // server. This does not understand the vercel lambda module format,
  // so we default back to the standard build output.
  server: process.env.NODE_ENV === "development" ? undefined : "./server.js",
  ignoredRouteFiles: ["**/*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "api/index.js",
  // publicPath: "/build/",
  routes: async (defineRoutes) => {
    return flatRoutes("routes", defineRoutes, {
      basePath: "/", // optional base path (defaults to /)
      paramPrefixChar: "$", // optional specify param prefix
      ignoredRouteFiles: [], // same as remix config
    });
  },
  serverDependenciesToBundle: [
    "@carbon/database",
    "@carbon/logger",
    "@carbon/react",
    "@carbon/utils",
  ],
  watchPaths: async () => {
    return [
      "../../packages/carbon-react/src/**/*",
      "../../packages/carbon-database/src/**/*",
      "../../packages/carbon-logger/src/**/*",
      "../../packages/carbon-utils/src/**/*",
    ];
  },
};
