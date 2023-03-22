import React from 'react';
import {
  Navigate as ReactRouterNavigate,
  NavigateProps,
  RelativeRoutingType,
  To,
  useNavigate as useReactRouterNavigate,
} from 'react-router-dom';
import { useUpdateLocationContext } from '../hook';

/**
 * Replacement for {@link Navigate} from React router v6.
 *
 * Allow to redirect to a specific page of the application meanwhile updating the SsrLocationContext.
 * The update of the SsrLocationContext allows to manage the redirection on the SSR side.
 */
export function Navigate({
  to, replace, state, relative,
}: NavigateProps) {
  const { setContextRedirectUrl } = useUpdateLocationContext();
  setContextRedirectUrl(to);
  return <ReactRouterNavigate
    to={to}
    replace={replace}
    state={state}
    relative={relative}
  />;
}

/**
 * Replacement for {@link useNavigate} from React router v6.
 *
 * Allow to redirect to a specific page of the application meanwhile updating the SsrLocationContext.
 * The update of the SsrLocationContext allows to manage the redirection on the SSR side.
 */
export function useNavigate() {
  const navigate = useReactRouterNavigate();
  const { setContextRedirectUrl } = useUpdateLocationContext();

  return (
    to: string | To,
    options?: {
      replace?: boolean,
      state?: unknown,
      relative?: RelativeRoutingType,
    },
  ) => {
    setContextRedirectUrl(to);
    navigate(to, options);
  };
}
