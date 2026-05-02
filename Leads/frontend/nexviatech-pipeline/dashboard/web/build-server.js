process.env.NEXT_TELEMETRY_DISABLED = "1";

const typeCheckPath = require.resolve("next/dist/build/type-check");
const typeCheck = require(typeCheckPath);
const build = require("next/dist/build").default;

require.cache[typeCheckPath].exports = {
  ...typeCheck,
  startTypeChecking: async () => {},
};

build(process.cwd(), false, false, false).catch((error) => {
  console.error(error);
  process.exit(1);
});
