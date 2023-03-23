Plume SSR
=========
A toolkit to facilitate setting up SSR in a frontend project.

Getting started
---------------
1. Add dependencies:
   1. `yarn add plume-ssr-server`
   2. `yarn add -D express @types/express esbuild esbuild-runner`
2. Create a `building` folder to put `di-transformer-adapter.ts` and `ssr-compiler.ts`
3. Modify `tsconfig.json` to change:
   1. the `di-transformer-adapter.ts` path: `{"transform": "./building/di-transformer-adapter.ts" },`
   2. Add `"server-ssr/index.ts",` in the `include` section
4. Create source folder for ssr server: `mkdir server-ssr`
5. Change eslint ts config: add include `"server-ssr"`
6. Create the SSR module: `server-module.ts`
   1. Register the config module: `injector.registerSingleton(ConfigProvider, SsrConfigProvider);`
7. Optionally, if the SSR module will need to read specific file configuration to start, create a folder `config` and a file `Config.ts`
8. Modify `scripts` in the `package.json` file:
   1. Add `"run-ssr": "ttsc --incremental && yarn build-server && node build/server/index.js",`
   2. Add `"start-server": "concurrently \"yarn watch-ts\" \"yarn run-ssr\"",`
   3. Delete `"build": "rm -rf build && yarn build-client && yarn build-server",`
   4. Add `"build-client": "vite build --outDir build/client",`
   5. Add `"build-server": "esr building/ssr-compiler.ts",`
   6. Add `"build": "rm -rf build && ttsc && yarn build-client && run build-server",`
9. Create a `conf-ssr.json` file
10. Update `vite.config.ts` config to add `viteInlineCss` plugin
11. Change `index.html` file, import module `/ts-built/src/index.js` instead of `/ts-built/index.js`
12. Add rule in `.eslintrc.js` in the `rules` node :
```js
'import/no-restricted-paths':[2,
  { "zones": [
      // Files from './server-ssr' must never be accessed in './src' to avoid having node code running in the browser
      {"target": "./src", "from": "./server-ssr"},
  ]},
]
```
12. To handle correctly the router redirections during SSR :
    1. Use the `SsrLocationContextProvider` from the `plume-ssr-browser` lib to wrap your application, And use a `memoryRouter` in your `ApplicationHtmlRenderer` :
    ```
    const appRenderer: ApplicationHtmlRenderer<RenderedApplication> = (request: express.Request) => {
        const context: SsrLocationContext = {};
        
        const appHtml = ReactDOMServer.renderToString(
            <SsrLocationContextProvider context={context}>
                <App createRouter={(routes) => createMemoryRouter(routes, {
                    initialEntries: [request.originalUrl],
                    initialIndex: 0,
                })} />
            </SsrLocationContextProvider>,
        );
        
        return { appHtml, redirectUrl: context.url ?? '' };
    };
    ```
    2. Use the `Redirect` component from the `plume-ssr-browser` lib instead of `Navigate` from `react-router`. This component updates the `SsrLocationContext` when a redirection is triggered.
13. Add the following eslint rules :
```
'no-restricted-imports': ['error', {
  'paths': [
    {
      'name': 'react-router-dom',
      'importNames': ['Navigate', 'useNavigate', 'redirect'],
      'message': 'Please use the plume-ssr-browser version instead.',
    },
    {
      name: 'micro-observables',
      importNames: ['useObservable'],
      message: 'Please use the plume-ssr-browser version instead.'
    }
  ],
}],
```

## React router
@TODO


 Wrapper providing the location context to the SSR application.

 When using React Router v6, it allows to reproduce the context provided
 by the {@link StaticRouter} of React Router v5, a feature that no longer exists in React Router v6.

 SsrLocationContextProvider is primarily used to detect redirects during SSR rendering of the application
 by updating the {@link SsrLocationContext} when a redirect is triggered.

 When a redirect is detected, a 304 response containing the new URL should be sent to the user's browser.

Observable data management
--------------------------
Observable data for SSR enables to:
- Serve cached page in SSR without having to make further API calls for each incoming request
- Parametrize this cache, for example by lang, by site, by page, etc.

When defining observable data, it is **very important** to correctly identity all the parameters that may change the data value. For example:
- Configuration: Does it depend on the current site (i.e. hostname)? The lang?
- PageData: Does it depend on the current site? The lang? The current page id? Some kind of category?

TODO details more
- Configure the project global `SsrObservableManager`
- Defines observable in the project using `SsrWritableObservable`
- Set observable values using `SsrObservableContent`
- Use the `SsrWritableObservable.data()` method to access the observable data
- Use the hook `useSsrObservableLoader` to access data in components in conjunction with the loading component `WithLoadingData`
- Configure the SSR observable manager using `SsrServerObservableManager`

Examples in the sample project: `SsrBrowserObservableManager`, `SampleService`, `Home.tsx`, `ShowSample.tsx`, `ServerSsrObservableManager.ts`

TODO how to debug this? It would be good to be able in `ServerSsrObservableManager` to wrap returned observable, so each time the method `Observable.get()` is called, the current observable config is logged with the current observable value (with a limit of one per request). This would enable to detect:
- If an observable is configured using the ssr one: it would not be logged whereas it should
- If the configuration is wrongly computed: if for instance the lang `en` is detected instead of `fr`
- If the observable value is wrong for the configuration: it can either show an error in the observable value fetching or if a configuration parameter is missing

TODO show an example with how the hostname configuration should be used

Contributing
------------
Yarn workspaces is used. This means that:
- To start working first `yarn install` and `yarn build` must be run
- To use any command on a specific workspace, the `yarn workspace` command must be used (from the root directory). For example: `yarn workspace plume-ssr-browser build` or `yarn workspace plume-ssr-browser add -D react`
- The sample project should be used to test changes. So when some changes happen, `yarn build` or `yarn workspace plume-ssr-server build` (with the correct project name) must be executed to build the library project

Release process
---------------
- Check: `git pull`
- Check: `git status`
- Build: `yarn prepare-release`
- Prepare version: `yarn versions [version to release]`
- Publish version on NPM: `yarn workspaces foreach --from 'plume-ssr-**' npm publish --access public --tag [version to release] --otp [otp code]`
- Create git tag: `git tag [version to release]`
- Push tag: `git push --tags`
- Prepare next version: `yarn versions [next version]`
- Commit & push: `git add . && git commit -m "Prepare new version" && git push`
