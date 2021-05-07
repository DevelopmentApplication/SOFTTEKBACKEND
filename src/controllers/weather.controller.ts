// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {get, HttpErrors, param} from '@loopback/rest';
import {CountryCoord, Weather} from "../models/weather.model";
import {WeatherService} from '../services';
const util = require('util');
const redis = require("redis");
const client = redis.createClient();
client.get = util.promisify(client.get);
client.hgetall = util.promisify(client.hgetall);

client.on('connect', function () {
  console.log('connect to redis...')
})

export class WeatherController {

  Coords: CountryCoord[] = [];
  Countries: string[] = ['Santiago', 'Zurich', 'Auckland', 'Sydney', 'London', 'Georgia'];

  constructor(@inject('services.WeatherService')
  protected peopleService: WeatherService) { }

  @get('/weather/{city_name}')
  async getWeather(
    @param.path.string('city_name') city_name: string,
  ): Promise<Weather> {
    //Preconditions

    if (Math.random() < 0.1) {
      throw new HttpErrors.BadRequest('How unfortunate! The API Request Failed')
    } else {
      const weather: Weather = await this.peopleService.getCity(city_name);
      return weather;
    }
  }

  @get('/weather/{city_name}/{lat}/{lon}')
  async getWeatherLatLon(
    @param.path.string('city_name') city_name: string,
    @param.path.string('lat') lat: number,
    @param.path.string('lon') lon: number,
  ): Promise<Weather> {
    //Preconditions
    var weather: Weather;
    //Validation
    if (Math.random() < 0.1) {
      const time = new Date().getTime().toString();
      //save hash error
      await client.hmset('api.errors', [time, 'How unfortunate! The API Request Failed']);
      console.log(await client.hgetall('api.errors'));
      throw new HttpErrors.BadRequest('How unfortunate! The API Request Failed');
    } else {
      //check any key
      const currentWeather = await client.get(city_name);
      if (currentWeather) {
        weather = JSON.parse(currentWeather);
      } else {
        //check coord any key
        const currentKey = await client.get(`coord-${city_name}`);
        const currentCoord: CountryCoord = JSON.parse(currentKey);
        if (currentCoord) {
          //get API request with key
          weather = await this.peopleService.getCityLatLon(currentCoord.coords.lat, currentCoord.coords.lon);
        } else {
          //get API request with param
          weather = await this.peopleService.getCityLatLon(lat, lon);
        }
        //save data weather in redis
        await client.set(weather.name, JSON.stringify(weather));
      }
    }
    return weather;
  }

  @get('/initial/')
  async initialCord() {
    for await (const element of this.Countries) {
      //call api openweathermap
      const weather: Weather = await this.peopleService.getCity(element);
      //fill object CountryCoord
      const currentcoord: CountryCoord = {
        name: element,
        coords: weather.coord
      }
      this.Coords.push(currentcoord);
      //set hash coord
      await client.set(`coord-${element}`, JSON.stringify(currentcoord));
    }
    return this.Coords;
  }

  // @get('/allweathers')
  // async allWeathers(): Promise<Weather[]> {
  //   const weathers: Weather[] = [];

  //   for await (const country of this.Countries) {
  //     //get redis hash
  //     const coord: CountryCoord = JSON.parse(await client.get(country));
  //     //get API request
  //     if (Math.random() < 0.1) {
  //       const time = new Date().getTime().toString();
  //       await client.hmset('api.errors', [time, 'How unfortunate! The API Request Failed']);
  //       console.log(await client.hgetall('api.errors'));
  //       //throw new HttpErrors.BadRequest('How unfortunate! The API Request Failed');
  //       continue
  //     }
  //     const weather: Weather = await this.peopleService.getCityLatLon(coord.lat, coord.lon);
  //     weathers.push(weather);
  //   }
  //   return weathers;
  // }
}
