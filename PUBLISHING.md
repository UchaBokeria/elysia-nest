# Publishing to npm

This guide will help you publish the elysia-nest package to npm.

## Prerequisites

1. Create an npm account if you don't have one already at [npmjs.com](https://www.npmjs.com/signup)
2. Log in to npm from your terminal:

```bash
npm login
```

## Before Publishing

1. Make sure all your code is ready and tested
2. Update the version number in `package.json`
3. Build the package:

```bash
bun run build
```

## Publishing

To publish the package to npm, run:

```bash
npm publish
```

If this is the first time publishing this package, and you want to make it public:

```bash
npm publish --access public
```

## Publishing a Scoped Package

If you want to publish under a scope (like @yourname/elysia-nest), update your package.json:

```json
{
  "name": "@yourname/elysia-nest",
  // other fields...
}
```

Then publish with:

```bash
npm publish --access public
```

## After Publishing

1. Create a git tag for the version:

```bash
git tag -a v0.1.0 -m "First release"
git push origin v0.1.0
```

2. Update the README.md with the latest version information

## Publishing Updates

1. Make your changes
2. Update the version in package.json (follow [semantic versioning](https://semver.org/))
3. Build the package:

```bash
bun run build
```

4. Publish:

```bash
npm publish
```

5. Create and push a new git tag for the new version 