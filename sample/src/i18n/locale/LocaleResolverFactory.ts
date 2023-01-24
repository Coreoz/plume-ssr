import { Provider } from 'plume-ts-di';
import { LocaleResolver } from '../../lib/locale-resolver/LocaleResolver';
import EnvironmentService from '../../services/environment/EnvironmentService';
import LocaleService from './LocaleService';

/**
 * Configure {@link LocaleResolver} pour la détection de la langue de l'application
 */
export default class LocaleResolverFactory implements Provider<LocaleResolver> {
  private readonly localeResolver: LocaleResolver;

  constructor(environmentService: EnvironmentService) {
    this.localeResolver = new LocaleResolver({
      fallbackLocale: LocaleService.LOCALE_FR,
      availableLocales: [
        LocaleService.LOCALE_FR,
        LocaleService.LOCALE_EN,
      ],
      resolvers: [
        (localeResolver: LocaleResolver) => LocaleResolver.tryResolveFromAcceptedLanguages(
          localeResolver, environmentService.acceptedLanguageCodes(),
        ),
      ],
    });
  }

  get(): LocaleResolver {
    return this.localeResolver;
  }
}
