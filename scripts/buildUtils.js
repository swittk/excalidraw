const path = require("path");

const { build } = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");

const { woff2ServerPlugin } = require("./woff2/woff2-esbuild-plugins");

const BASE_CONFIG = {
  bundle: true,
  entryPoints: ["src/index.ts"],
  entryNames: "[name]",
  assetNames: "[dir]/[name]",
  alias: {
    "ex-excalidraw-common": path.resolve(__dirname, "../packages/common/src"),
    "ex-excalidraw-element": path.resolve(__dirname, "../packages/element/src"),
    "ex-excalidraw": path.resolve(__dirname, "../packages/excalidraw"),
    "ex-excalidraw-math": path.resolve(__dirname, "../packages/math/src"),
    "ex-excalidraw-utils": path.resolve(__dirname, "../packages/utils/src"),
  },
  loader: {
    ".woff2": "file",
  },
};

function buildDev(outdir) {
  return build({
    ...BASE_CONFIG,
    format: "esm",
    outdir,
    sourcemap: true,
    plugins: [sassPlugin(), woff2ServerPlugin()],
    define: {
      "import.meta.env": JSON.stringify({ DEV: true }),
    },
  });
}

function buildProd(outdir) {
  return build({
    ...BASE_CONFIG,
    format: "esm",
    outdir,
    minify: true,
    plugins: [
      sassPlugin(),
      woff2ServerPlugin({
        outdir: `${outdir}/assets`,
      }),
    ],
    define: {
      "import.meta.env": JSON.stringify({ PROD: true }),
    },
  });
}

function buildCJS(outdir) {
  return build({
    ...BASE_CONFIG,
    format: "cjs",
    outdir,
    minify: true,
    plugins: [
      sassPlugin(),
      woff2ServerPlugin({
        outdir: `${outdir}/assets`,
      }),
    ],
    define: {
      "import.meta.env": JSON.stringify({ PROD: true }),
    },
    outExtension: { ".js": ".cjs" },
  });
}

const createESMRawBuild = async () => {
  // development unminified build with source maps
  await buildDev("dist/dev");

  // production minified build without sourcemaps
  await buildProd("dist/prod");
};

const createCJSBuild = async () => {
  await buildCJS("dist/cjs");
};

(async () => {
  await createESMRawBuild();
  await createCJSBuild();
})();
