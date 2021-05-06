import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import {OpenweathermapDataSource} from '../datasources';

export interface WeatherService {
  // this is where you define the Node.js methods that will be
  // mapped to REST/SOAP/gRPC operations as stated in the datasource
  // json file.
  getCity(city_name: string): Promise<object>;
}

export class WeatherServiceProvider implements Provider<WeatherService> {
  constructor(
    // openweathermap must match the name property in the datasource json file
    @inject('datasources.openweathermap')
    protected dataSource: OpenweathermapDataSource = new OpenweathermapDataSource(),
  ) { }

  value(): Promise<WeatherService> {
    return getService(this.dataSource);
  }
}
