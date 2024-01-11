import * as fs from 'fs';
import { NoParamCallback } from 'fs';
import * as path from 'path';
import { SsrConfigProvider } from '../config/SsrConfigProvider';

/**
 * Service de gestions des fichiers utilisés par le serveur node
 */
export class Files {
  constructor(private readonly config: SsrConfigProvider) {
  }

  /**
   * Renvoie le chemin absolu du path demandé
   */
  absolutePath(relativePath: string) {
    return path.resolve(this.config.getSsrBaseConfig().rootFolder, relativePath);
  }

  /**
   * Retourne le fichier correspondant au path demandé sous forme de string
   */
  readFileAsString(relativePath: string): string {
    return fs.readFileSync(this.absolutePath(relativePath), 'utf-8');
  }

  /**
   * Permet de lister les fichiers présents dans un dossier avec un path relatif
   */
  listFiles(relativePath: string) {
    return fs.readdirSync(this.absolutePath(relativePath));
  }

  /**
   * Permet d'écrire dans un fichier en précisant un path relatif
   */
  writeFile(relativePath: string, obj: string | NodeJS.ArrayBufferView, callback: NoParamCallback) {
    return fs.writeFile(
      this.absolutePath(relativePath),
      obj,
      callback,
    );
  }

  /**
   * Permet de créer un dossier selon un relativePath
   */
  createFolder(relativePath: string): void {
    if (!fs.existsSync(relativePath)) {
      fs.mkdirSync(relativePath);
    }
  }
}
