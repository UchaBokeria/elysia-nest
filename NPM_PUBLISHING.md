# Publishing elysia-nest to npm

This guide provides detailed instructions for publishing your elysia-nest library to npm.

## Publication Options

### 1. Standard Publication

If you want to publish directly to npm under the name `elysia-nest`:

```bash
cd elysia-nest
./scripts/publish.sh
```

### 2. Scoped Publication

If you want to publish under your npm username scope (recommended for new packages):

1. Edit `package.json` and change the name:

```json
{
  "name": "@your-username/elysia-nest",
  // other fields...
}
```

2. Then run the publish script:

```bash
cd elysia-nest
./scripts/publish.sh
```

When prompted if this is your first time publishing, answer "yes" to ensure it's published with public access.

### 3. Custom Name

If `elysia-nest` is already taken on npm, you can choose a different name:

1. Edit `package.json` and modify the name:

```json
{
  "name": "your-custom-name",
  // other fields...
}
```

2. Then run the publish script as usual.

## Before Publishing

1. Make sure you have an npm account and are logged in:

```bash
npm login
```

2. Update your author information in `package.json`:

```json
"author": "Your Name <your.email@example.com>",
```

3. Verify your package version in `package.json`. For new packages, start with `0.1.0` and follow semantic versioning for updates:
   - Patch version (`0.1.1`): Bug fixes
   - Minor version (`0.2.0`): New features, backward compatible
   - Major version (`1.0.0`): Breaking changes

## After Publishing

1. Update your project to use the published version:

```json
"dependencies": {
  "elysia-nest": "^0.1.0"
}
```

2. Consider setting up continuous integration for automatic version publishing when tags are pushed to your repository.

## Troubleshooting

### "Package name already exists"

If npm reports that the package name already exists, you have several options:
- Use a scoped package name with your username: `@your-username/elysia-nest`
- Choose a different name entirely
- Contact the owner of the package if it appears to be abandoned

### "No auth token found"

If you get an authentication error:
```
npm login
```

### "Version already exists"

Make sure to update the version number in package.json before publishing a new version. 