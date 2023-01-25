import React from 'react';
import { getGlobalInstance } from 'plume-ts-di';
import { useObservable } from 'plume-ssr-browser';
import { Link } from 'react-router-dom';
import LocaleSelector from '../theme/LocaleSelector';
import LocaleService from '../../i18n/locale/LocaleService';

function LocaleSelectorContainer() {
  const localeService = getGlobalInstance(LocaleService);
  const currentLocale = useObservable(localeService.getCurrentLocale());

  return <LocaleSelector
    currentLocale={currentLocale}
    availableLocales={localeService.getAvailableLocales()}
    onLocaleSelected={(newLocale) => localeService.setCurrentLocale(newLocale)}
  />;
}

export default function Header() {
  return (
    <header id="main-header">
      <Link to={'/'}>Home</Link>
      <Link to={'/Other'}>Autre</Link>
      <LocaleSelectorContainer />
    </header>
  );
}
