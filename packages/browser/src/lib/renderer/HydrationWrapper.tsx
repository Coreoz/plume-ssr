import React, { useEffect } from 'react';

type Props = {
  onAppMounted: () => void,
  app: JSX.Element,
};

/**
 * Wrapper used to execute a callback once the application is mounted.
 * Mainly used to wait for the promises triggered by the application
 * and check if the application is ready to be used for hydration.
 *
 * @param onAppMounted callback executed once the application is mounted
 * @param app application to wrap
 */
function HydrationWrapper({ onAppMounted, app }: Props) {
  useEffect(() => {
    onAppMounted();
  }, []);
  return <>{app}</>;
}

/**
 * Wrap the application with the HydrationWrapper that executes the onAppMounted called,
 * once the application is mounted.
 *
 * @param onAppMounted callback executed once the application is mounted
 * @param app application to wrap
 */
export const hydrationWrapper = (onAppMounted: () => void, app: JSX.Element) => (
  <HydrationWrapper onAppMounted={onAppMounted} app={app} />
);
