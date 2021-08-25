import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import axios from 'axios';
import { GATEWAYS_STORAGE } from './gateways.constants';

export interface CurrencyResponseItem {
  CHANGE24HOUR: string;
  CHANGEPCT24HOUR: string;
  OPEN24HOUR: string;
  VOLUME24HOUR: string;
  VOLUME24HOURTO: string;
  LOW24HOUR: string;
  HIGH24HOUR: string;
  PRICE: string;
  SUPPLY: string;
  MKTCAP: string;
}

export interface CurrencyResponse {
  [fsym: string]: {
    [tsym: string]: CurrencyResponseItem;
  };
}

/**
 * Performs currency field mapping.
 *
 * @param currency
 *   Input currency object.
 * @param keys
 *   Currency output keys.
 */
const mapCurrencies = (
  currency: any,
  keys: Array<string>,
): CurrencyResponse => {
  const result = {};

  Object.keys(currency).forEach((fsym) => {
    result[fsym] = {};

    Object.keys(currency[fsym]).forEach((tsym) => {
      result[fsym][tsym] = {};

      keys.forEach((key) => {
        result[fsym][tsym][key] = currency[fsym][tsym][key];
      });
    });
  });

  return result as CurrencyResponse;
};

@Injectable()
export class CryptocompareService {
  static currencyKeys = [
    'CHANGE24HOUR',
    'CHANGEPCT24HOUR',
    'OPEN24HOUR',
    'VOLUME24HOUR',
    'VOLUME24HOURTO',
    'LOW24HOUR',
    'HIGH24HOUR',
    'PRICE',
    'SUPPLY',
    'MKTCAP',
  ];

  constructor(
    @Inject(CACHE_MANAGER) protected readonly cacheManager: Cache,
    @Inject(GATEWAYS_STORAGE) protected readonly storage: any,
  ) {}

  /**
   * Performs price multifull request.
   *
   * @param fsyms
   * @param tsyms
   */
  async priceMultifull(
    fsyms: string | string[],
    tsyms: string | string[],
  ): Promise<{ [type: string]: CurrencyResponse }> {
    const response = await this.requestGet('pricemultifull', {
      fsyms,
      tsyms,
    });

    // Map the response.
    const currency: { [type: string]: CurrencyResponse } = {};
    Object.keys(response).forEach((type) => {
      currency[type] = mapCurrencies(
        response[type],
        CryptocompareService.currencyKeys,
      );
    });

    return currency;
  }

  /**
   * Performs api get request.
   *
   * @param endpoint
   *   Target endpoint.
   * @param params
   *   Endpoint query parameters.
   */
  async requestGet(
    endpoint: string,
    params: { [key: string]: any },
  ): Promise<any> {
    const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await this.performRequestGet(endpoint, params);
      await this.cacheManager.set(cacheKey, response.data);

      return response.data;
    } catch (e) {
      // In case of any connection error force storage reading.
      const lastResponse = await this.storage.get(cacheKey);
      if (lastResponse) {
        return JSON.parse(lastResponse.data.toString());
      }

      // Pass the error otherwise.
      throw e;
    }
  }

  /**
   * Performs the get request.
   *
   * @param endpoint
   * @param params
   */
  performRequestGet(
    endpoint: string,
    params: { [key: string]: any },
  ): Promise<any> {
    // Flatten parameters.
    const paramsFlattened = {};
    Object.keys(params).forEach((key) => {
      if (Array.isArray(params[key])) {
        paramsFlattened[key] = params[key].join(',');
      } else {
        paramsFlattened[key] = params[key];
      }
    });

    // Should be moved to a separate service.
    return axios.get(`https://min-api.cryptocompare.com/data/${endpoint}`, {
      params: paramsFlattened,
    });
  }
}
