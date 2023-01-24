export type SsrBaseConfig = {
  isDevelopment: boolean,
  httpPort: number,
  /**
   * The path containing the `index.html` file and the `statics` folder
   */
  rootFolder: string,
  /**
   * The assets folder name inside the frontend build folder. It should generally be juste "assets'
   */
  assetsFolderName: string,
};

export const defaultSsrConfig: SsrBaseConfig = {
  isDevelopment: true,
  httpPort: 3000,
  rootFolder: '/',
  assetsFolderName: 'assets',
};

export abstract class SsrConfigProvider {
  abstract getSsrBaseConfig(): SsrBaseConfig;
}
