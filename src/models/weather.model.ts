import {Model, model} from '@loopback/repository';

@model()
export class Weather extends Model {

  coord: {
    lon: number;
    lat: number
  };
  weather: [
    {
      id: number;
      main: string;
      description: string;
      icon: string
    }
  ];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number
  };
  clouds: {
    all: number
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    message: number;
    country: string;
    sunrise: number;
    sunset: number
  };
  timezone: number;
  id: number;
  name: string;
  cod: number

  constructor(data?: Partial<Weather>) {
    super(data);
  }
}

export interface CountryCoord {
  name: string;
  coords: {
    lon: number;
    lat: number
  }
}

