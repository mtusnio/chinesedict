import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

export default [
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.jest,
                ...globals.jquery,
                "chrome": "readonly"
            }
        }
    },
    pluginJs.configs.recommended,
    eslintConfigPrettier
];
