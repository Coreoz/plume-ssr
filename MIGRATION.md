# Guide de migration — plume-ssr v2

`plume-ssr` passe en **version majeure (v2)** pour s'aligner sur les projets générés par
`create-plume-react-project` (React 19, Vite 8, Vitest, ESLint 9). Ce guide décrit les
changements à appliquer chez les projets consommateurs de `plume-ssr-browser` et
`plume-ssr-server`.

## 1. `peerDependencies` (changements cassants)

### React 18 → 19

`plume-ssr-browser` requiert désormais React **19** :

```diff
  "peerDependencies": {
-   "react": "^18.2.0",
-   "react-dom": "^18.2.0",
+   "react": "^19.0.0",
+   "react-dom": "^19.0.0",
  }
```

À faire dans le projet consommateur :

- Mettre à jour `react`, `react-dom`, `@types/react`, `@types/react-dom` en version 19.
- Les types React 19 ne déclarent plus le namespace global `JSX`. Remplacer les usages
  `JSX.Element` par `React.ReactElement` (ou `React.ReactNode`).

### Vite 4 → 8

`plume-ssr-server` requiert désormais Vite **8** :

```diff
  "peerDependencies": {
-   "vite": "^4.0.3",
+   "vite": "^8.3.0",
  }
```

Impacts côté projet :

- Remplacer `@vitejs/plugin-react-refresh` (incompatible avec Vite 8) par
  `@vitejs/plugin-react-swc`, en activant le plugin DI (voir §3).
- Le plugin `viteInlineCss` fourni par `plume-ssr-server` utilise désormais l'API
  `transformIndexHtml` sous forme d'objet `{ order: 'post', handler }` (l'ancienne forme
  `{ enforce, transform }` n'est plus supportée).

### Corrections de `peerDependencies` erronées

```diff
  "peerDependencies": {
-   "express": "^1.0.0",
+   "express": "^4.18.2",
-   "path": "^0.4.9",
  }
```

- `express` pointait vers une version inexistante (`^1.0.0`) : corrigé en `^4.18.2`.
- `path` est un module natif de Node : la dépendance npm `path` est supprimée.

## 2. Tests : Jest → Vitest

- Les tests s'exécutent désormais avec **Vitest** (`vitest.config.mts`), plus avec Jest.
- Les tests qui simulent des appels HTTP doivent utiliser **`msw`** (et non `fetch-mock`).

## 3. Build et injection de dépendances

Le build s'appuie désormais sur **SWC** au lieu de `ttypescript` / `ts-transformer-classname` :

- `@swc/core` + `@swc/cli` transpilent `cjs` et `esm` ;
- `swc-class-decorator-plugin` ajoute les métadonnées DI (`___CTOR_NAME___`, `___CTOR_ARGS___`) ;
- `tsc --emitDeclarationOnly` génère les `.d.ts`.

Voir le standard [Build des librairies TypeScript](https://github.com/Coreoz/github-coreoz/blob/main/docs/development/typescript-library-build.md).

Pour un projet Vite, activer le plugin DI dans `vite.config.ts` :

```typescript
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [
    react({
      plugins: [['swc-class-decorator-plugin', {}]],
      useAtYourOwnRisk_mutateSwcOptions: (options) => {
        options.jsc!.experimental!.runPluginFirst = true;
      },
    }),
  ],
});
```

## 4. Checklist de migration

1. `react` / `react-dom` / `@types/react` / `@types/react-dom` → v19.
2. `vite` → v8 ; `@vitejs/plugin-react-refresh` → `@vitejs/plugin-react-swc` (+ plugin DI).
3. Remplacer `JSX.Element` par `React.ReactElement`.
4. Retirer la dépendance npm `path` ; vérifier `express` en `^4.18.2`.
5. Basculer les tests sur Vitest et les simulations HTTP sur `msw`.
6. Adopter le build SWC (retrait de `ttypescript` / `ts-transformer-classname`).
