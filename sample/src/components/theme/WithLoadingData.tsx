import React, { ReactNode } from 'react';
import { DataLoader } from '../../lib/plume-http-react-hook-loader/observableLoaderHook';
import useMessages from '../../i18n/hooks/messagesHook';
import { ActionButton } from './action/Actions';

export type WithLoadingDataProps = {
  dataLoader: DataLoader<unknown>,
  children: ReactNode,
  messages?: {
    errorMessage?: string,
    actionRetry?: string,
  }
};

/**
 * Affiche les composants fils dès que les données du {@link WithLoadingDataProps.dataLoader} sont disponibles.
 * Doit être utilisé uniquement pour du chargement de données.
 * Les appels API de mise à jour de données, etc. doivent utiliser de préférence le loader des boutons d'action.
 *
 * En cas d'erreur, affiche un message d'erreur avec un bouton pour relancer le chargement des données.
 */
export default function WithLoadingData({
  dataLoader, messages, children,
}: WithLoadingDataProps) {
  const { httpError } = useMessages();

  if (dataLoader.isLoaded) {
    return <>{children}</>;
  }

  if (dataLoader.error) {
    return (
      <div>
        <div className="loading-error-message">
          {messages?.errorMessage
            ?? httpError(dataLoader.error)}
        </div>
        <ActionButton onClick={dataLoader.loader} isLoading={dataLoader.isLoading}>
          {messages?.actionRetry ?? 'Retry'}
        </ActionButton>
      </div>
    );
  }

  return <div>Loading...</div>;
}
