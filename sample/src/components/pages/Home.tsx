import React from 'react';
import { getGlobalInstance } from 'plume-ts-di';
import { useParams } from 'react-router-dom';
import useMessages from '../../i18n/hooks/messagesHook';
import SampleService from '../../services/sample/SampleService';
import WithLoadingData from '../theme/WithLoadingData';
import ShowSample from './ShowSample';
import { useSsrObservableLoader } from '../../lib/plume-ssr-loader/useSsrObservableLoader';

export const routeNameOrDefault = (routeName?: string) => (routeName && routeName !== '' ? routeName : 'Default name');

export default function Home() {
  const nameParam = routeNameOrDefault(useParams()?.name);
  const { messages } = useMessages();
  const sampleService = getGlobalInstance(SampleService);
  const sampleObservable = sampleService.currentSample();
  const pageLoader = useSsrObservableLoader([{
    dataObservable: sampleObservable,
    loader: () => sampleService.sayHello(nameParam),
  }], { pageName: nameParam });

  return <div id="home-layout">
    <h1>{messages['home.title']}</h1>
    <div>
      <h2>API call test</h2>
      <WithLoadingData dataLoader={pageLoader}>
        <ShowSample />
      </WithLoadingData>
    </div>
  </div>;
}
