// Uncomment these imports to begin using these cool features!

import {inject} from '@loopback/core';
import {get, HttpErrors, param} from '@loopback/rest';
import {WeatherService} from '../services';


export class WeatherController {
  constructor(@inject('services.WeatherService')
  protected peopleService: WeatherService) { }

  @get('/weather/{city_name}')
  async getWeather(
    @param.path.string('city_name') city_name: string,
  ): Promise<object> {
    //Preconditions

    if (Math.random() < 0.1) {
      throw new HttpErrors.BadRequest('How unfortunate! The API Request Failed')
    } else {
      return this.peopleService.getCity(city_name);
    }
  }
}
