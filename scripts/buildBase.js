const path = require("path");

const { build } = require("esbuild");

const BASE_CONFIG = {
  bundle: true,
  entryPoints: ["src/index.ts"],
  entryNames: "[name]",
  assetNames: "[dir]/[name]",
  alias: {
    "ex-excalidraw-utils": path.resolve(__dirname, "../packages/utils/src"),
  },
  external: ["ex-excalidraw-common", "ex-excalidraw-element", "ex-excalidraw-math"],
};

function buildDev(outdir) {
  return build({
    ...BASE_CONFIG,
    format: "esm",
    outdir,
    sourcemap: true,
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
