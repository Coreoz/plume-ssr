import React, { useMemo } from 'react';
import {
  Outlet, RouteObject, RouterProvider,
} from 'react-router-dom';
import { Logger } from 'simple-logging-system';
import { Navigate, useNavigate } from '@plume-ssr/browser';
import Home from './pages/Home';
import Layout from './layout/Layout';
import ErrorPage from './pages/ErrorPage';

const logger = new Logger('App');

type AppProps = {
  // Return type Router that is not exported by react-router-dom
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  createRouter: (routes: RouteObject[]) => any
};

export default function App({ createRouter }: AppProps) {
  // test CSS import
  const importScss = import('/assets/scss/app.scss');
  importScss
    .then((content) => console.log('Content SCSS loaded', content))
    .catch((e) => console.log('Could not load SCSS', e));
  console.log('Import SCSS statement', importScss);

  const TestUseNavigate = () => {
    useNavigate()('/');

    return <div>test-use-navigate</div>;
  };
  const router = useMemo(() => createRouter([
    {
      path: '/',
      element: <Layout><Outlet /></Layout>,
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/test-navigate',
          element: <Navigate to="/test" />,
        },
        {
          path: '/test-use-navigate',
          element: <TestUseNavigate/>,
        },
        {
          index: true,
          element: <Home />,
        },
        {
          path: ':name',
          element: <Home />,
        },
      ],
    },
  ]), []);

  logger.info('Render App');
  return <RouterProvider router={router} />;
}
