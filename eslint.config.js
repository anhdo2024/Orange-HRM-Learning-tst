// eslint.config.js — dự án JavaScript thuần (ESLint v10)
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default [
  // 1) Bỏ qua file/thư mục không lint
  {
    ignores: ["**/node_modules/**", "**/.github/**", "**/allure-report/**", "**/allure-results/**"],
  },

  // 2) Bộ rule JavaScript chuẩn của ESLint
  js.configs.recommended,

  // 3) Config chính — áp dụng cho file .js
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest", // cú pháp JS mới nhất
      sourceType: "module", // dùng import/export (ES module)
      globals: {
        ...globals.node, // biến toàn cục của Node (process...)
        ...globals.mocha, // biến của Mocha (describe, it, before...)
        browser: "readonly",
        driver: "readonly",
        multiremotebrowser: "readonly",
        $: "readonly",
        $$: "readonly",
        expect: "readonly",
      },
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
      "@stylistic": stylistic,
      "unused-imports": unusedImports,
    },
    rules: {
      // --- Sắp xếp import ---
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^@shared/.*"],
            ["^@.*/pageobjects", "^@.*/components", "^@.*/data"],
            ["^@utils/.*", "^@configs/.*"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",

      // --- Style ---
      "@stylistic/max-statements-per-line": ["error", { max: 1 }],
      "@stylistic/max-len": [
        "error",
        {
          tabWidth: 2,
          code: 120,
          ignoreStrings: true,
          ignoreComments: true,
          ignoreTrailingComments: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],

      // --- Dọn import & biến thừa ---
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // --- Tắt rule mặc định gây phiền trong automation ---
      "no-unused-vars": "off", // đã dùng unused-imports thay thế
      "no-loop-func": "off", // automation hay tạo function trong loop
      "no-invalid-this": "off",
      "max-statements": ["error", 50, { ignoreTopLevelFunctions: true }],
    },
  },

  // 4) ĐẶT CUỐI — tắt rule đá với Prettier + chạy Prettier như rule
  prettierRecommended,
];
