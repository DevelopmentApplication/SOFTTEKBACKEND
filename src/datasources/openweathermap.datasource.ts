import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'openweathermap',
  connector: 'rest',
  baseURL: 'https://api.openweathermap.org/data/2.5/',
  crud: false,
  // options: {
  //   headers: {
  //     accept: 'application/json',
  //     'content-type': 'application/json',
  //   },
  // },
  operations: [
    {
      template: {
        method: 'GET',
        url: 'https://api.openweathermap.org/data/2.5/weather?q={city_name}&appid=e534c5f0903d5295b50f63a16ff69019'
      },
      functions: {
        getCity: ['city_name'],
      },
    },
    {
      template: {
        method: 'GET',
        url: 'https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid=e534c5f0903d5295b50f63a16ff69019'
      },
      functions: {
        getCityLatLon: ['lat', 'lon'],
      },
    }
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class OpenweathermapDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'openweathermap';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.openweathermap', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
