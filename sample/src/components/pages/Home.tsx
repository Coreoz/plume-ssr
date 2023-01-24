import React from 'react';
import { getGlobalInstance } from 'plume-ts-di';
import { useParams } from 'react-router-dom';
import useMessages from '../../i18n/hooks/messagesHook';
import SampleService from '../../services/sample/SampleService';
import { useObservableLoader } from '../../lib/plume-http-react-hook-loader/observableLoaderHook';
import WithLoadingData from '../theme/WithLoadingData';
import ShowSample from './ShowSample';

export const routeNameOrDefault = (routeName?: string) => routeName ?? 'Default name';

export default function Home() {
  const nameParam = routeNameOrDefault(useParams()?.name);
  const { messages } = useMessages();
  const sampleService = getGlobalInstance(SampleService);
  const sampleObservable = sampleService.currentSample();
  const pageLoader = useObservableLoader([{
    dataObservable: sampleObservable,
    loader: () => sampleService.sayHello(nameParam),
    isLoadedPredicate: (sample) => sample && sample.name === nameParam,
  }], [nameParam]);

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
