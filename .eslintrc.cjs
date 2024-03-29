module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
    'standard-with-typescript'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    project: './tsconfig.json'
  },
	env: {
		browser: true,
		es2017: true,
		node: true
	},
  overrides: [
  ],
  rules: {
    "@typescript-eslint/ban-ts-comment": "off"
  }
};
