const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      ".webpack/**",
      "dist/**",
      "out/**",
      "release/**",
      "coverage/**",
    ],
  },
  ...compat.config(require("./.eslintrc.json")),
];
