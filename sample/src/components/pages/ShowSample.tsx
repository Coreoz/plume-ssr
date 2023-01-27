import { getGlobalInstance } from 'plume-ts-di';
import { useObservable } from 'plume-ssr-browser';
import React from 'react';
import SampleService from '../../services/sample/SampleService';

export default function ShowSample() {
  // data cannot be undefined here, it is "being" the component WithLoadingData
  const sample = useObservable(getGlobalInstance(SampleService).currentSample());
  return <div>
    <p>API call success!</p>
    <p>Received data:</p>
    <p>{sample!.data}</p>
  </div>;
}
