import React from 'react';
import { Observable } from 'micro-observables';
import { Navigate, useObservable } from 'plume-ssr-browser';

type Props = {
  shouldDisplayRoute: Observable<unknown>;
  defaultRoute: string;
  children?: React.ReactNode;
};

export default function ConditionalRoute({
  shouldDisplayRoute, defaultRoute, children,
}: Props) {
  const shouldDisplayRouteValue = useObservable(shouldDisplayRoute);
  if (!shouldDisplayRouteValue) {
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
}
