// eslint.config.js
import eslintPluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslintPluginJs.configs.recommended,
    tseslint.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "@typescript-eslint/no-this-alias": "off",
            "@typescript-eslint/ban-ts-comment":"off"
        },
    }
);