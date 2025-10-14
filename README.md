# Samurai04 API

This is the API for Samurai04. Started from TypeScriptExpressJsAPI02starter.

## Set up

1. mkdir TypeScriptExpressJsAPI02starter and `npm init -y`
2. Install Express and tooling

```bash
npm install express
npm install --save-dev typescript ts-node nodemon @types/node @types/express
```

3. Create a `tsconfig.json` file (run `npx tsc --init` or manually make the file in root directory)

Modify tsconfig.json

```json
{
	"compilerOptions": {
		"module": "CommonJS",
		"moduleResolution": "node",
		"esModuleInterop": true,
		"verbatimModuleSyntax": false,
		"outDir": "./dist",
		"rootDir": "./src"
	}
}
```

4. Make src/ and app.ts

```bash
mkdir src
touch src/app.ts
```

5. package.json scripts

```json
  "dev": "nodemon --watch src --exec ts-node src/app.ts",
  "build": "tsc",
  "start": "node dist/app.js"
```

6. Run

- `npm run dev` to start the development server
- `npm run build` to build the project, then `npm start` to start the production server
