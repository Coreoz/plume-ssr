/**
 * Gère la récupération des informations sur l'environnement d'exécution.
 * Il y a une implémentation pour le navigateur et une implémentation pour le SSR.
 */
export default abstract class EnvironmentService {
  abstract backendBaseApiUrl(): string;

  abstract fetchUrlPath(): string;

  abstract acceptedLanguageCodes(): string[];
}
