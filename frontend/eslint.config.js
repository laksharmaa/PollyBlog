import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
	{
		ignores: ["dist/**", "node_modules/**"],
	},
	{
		files: ["**/*.{js,jsx}"],
		languageOptions: {
			ecmaVersion: "latest",
			 globals: { ...globals.browser, ...globals.node },
			parserOptions: { ecmaFeatures: { jsx: true }, sourceType: "module" },
		},
		plugins: {
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
		},
		rules: {
			...js.configs.recommended.rules,
			"no-unused-vars": "off",
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": "warn",
		},
	},
];
