// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {get, HttpErrors, param} from '@loopback/rest';
import {CountryCoord, Weather} from "../models/weather.model";
import {WeatherService} from '../services';
const util = require('util');
const redis = require("redis");
const client = redis.createClient();
client.get = util.promisify(client.get);
client.hget = util.promisify(client.hget);
client.hgetall = util.promisify(client.hgetall);

client.on('connect', function () {
  console.log('connect to redis...')
})

export class WeatherController {

  Coords: CountryCoord[] = [];
  Countries: string[] = ['Santiago', 'Zurich', 'Auckland', 'Sydney', 'London', 'Georgia'];

  constructor(@inject('services.WeatherService')
  protected weatherService: WeatherService) { }

  /**
   * Busca el clima por nombre de pais o por su latitud o longitud
   */
  @get('/weather/{city_name}')
  async getWeatherLatLon(
    @param.path.string('city_name') city_name: string,
  ): Promise<Weather> {
    //Preconditions
    var weather: Weather;
    //Validación
    if (Math.random() < 0.1) {

      const time = new Date().getTime().toString();

      //establece hash api.errors
      await client.hmset('api.errors', [time, `${new Date().toLocaleString()} a ocurrido un error al procesar la ciudad ${city_name}`]);
      const currentError = await client.hget('api.errors', time)
      console.error(currentError);
      throw new HttpErrors.BadRequest(currentError);
    } else {

      //checkea si existen coordenadas en memoria para el pais
      const currentKey = await client.get(`coord-${city_name}`);
      const currentCoord: CountryCoord = JSON.parse(currentKey);

      //obtiene clima desde API getCityLatLon con los parametros en memoria
      weather = await this.weatherService.getCityLatLon(currentCoord.coords.lat, currentCoord.coords.lon);

      //actualiza llaves de clima
      /**
       * (Esto solo lo actualizo por instrucción de la prueba,
       * pero en realidad nunca hago uso, por que me interesa tener los datos actualizados desde la API
       */
      await client.set(weather.name, JSON.stringify(weather));
    }
    return weather;
  }

  /**
   * Busca las coordenadas iniciales dadas por un arreglo de paises
   */
  @get('/initial/')
  async initialCord() {
    for await (const country of this.Countries) {
      //llamada api openweathermap
      const weather: Weather = await this.weatherService.getCity(country);
      const currentcoord: CountryCoord = {
        name: country,
        coords: weather.coord
      }
      this.Coords.push(currentcoord);
      //almacena altitud y longitud en redis
      await client.set(`coord-${country}`, JSON.stringify(currentcoord));
    }
    return this.Coords;
  }
}
