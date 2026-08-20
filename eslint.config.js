import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import boundaries from "eslint-plugin-boundaries";
import globals from "globals";

const layers = [
  { type: "app", pattern: "src/app/**" },
  { type: "pages", pattern: "src/pages/**" },
  { type: "widgets", pattern: "src/widgets/**" },
  { type: "features", pattern: "src/features/**" },
  { type: "entities", pattern: "src/entities/**" },
  { type: "shared", pattern: "src/shared/**" },
];

const to = (type) => ({ to: { element: { type } } });

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["src/**/*.{js,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": layers,
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "app" } },
              allow: [
                to("app"),
                to("pages"),
                to("widgets"),
                to("features"),
                to("entities"),
                to("shared"),
              ],
            },
            {
              from: { element: { type: "pages" } },
              allow: [
                to("pages"),
                to("widgets"),
                to("features"),
                to("entities"),
                to("shared"),
              ],
            },
            {
              from: { element: { type: "widgets" } },
              allow: [to("widgets"), to("features"), to("entities"), to("shared")],
            },
            {
              from: { element: { type: "features" } },
              allow: [to("entities"), to("shared")],
            },
            {
              from: { element: { type: "entities" } },
              allow: [to("entities"), to("shared")],
            },
            {
              from: { element: { type: "shared" } },
              allow: [to("shared")],
            },
          ],
        },
      ],
    },
  },
];
