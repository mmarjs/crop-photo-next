const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const execSync = require("child_process").execSync;
/*
 *
 */
const withPlugins = require("next-compose-plugins");

// Tell webpack to compile the "bar" package, necessary if you're using the export statement for example
// https://www.npmjs.com/package/next-transpile-modules
const withTM = require("next-transpile-modules")(["antd", "@ant-design/icons"]);

module.exports = withPlugins([[withTM]], {
  reactStrictMode: true,
  async rewrites() {
    if (process.env["IS_CLOUD_BUILD"] === "true") {
      return `https://app.${process.env["BUILD_ENV"]}.crop.photo/api/:path`;
    }
    return [
      {
        source: "/api/:path(.*)",
        //destination: "http://localhost:8080/api/:path"
        destination: "https://app.dev.crop.photo/api/:path" //Java web - server
      }
    ];
  },

  webpack: config => {
    // Alias
    config.resolve.alias["~"] = path.resolve(__dirname + "/src");

    // Svgr
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"]
    });

    return config;
  },
  generateBuildId: async () => {
    let version;
    let error;
    if (process.env.AWS_CODEBUILD_VERSION) {
      version = process.env.AWS_CODEBUILD_VERSION;
    } else {
      const { stdout, stderr } = await exec("git describe --tags --dirty --broken --match v*");
      version = stdout;
      error = stderr;
    }
    if (error) {
      console.error("Error ", error);
      process.exit(1);
    }
    console.info("Version detection:", version);
    return version;
  },
  experimental: {
    outputStandalone: true
  },
  env: {
    BUILD_VERSION:
      process.env.AWS_CODEBUILD_VERSION || execSync("git describe --tags --dirty --broken --match v*").toString("utf8")
  }
});
