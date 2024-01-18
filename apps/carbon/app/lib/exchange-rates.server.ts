import axios from "axios";
import type { CurrencyCode } from "~/modules/accounting";

type ExchangeClientOptions = {
  apiKey?: string;
  apiUrl?: string;
  baseCurrency: CurrencyCode;
};

type Rates = { [key in CurrencyCode]?: number };

type ExchangeRatesSuccessResponse = {
  success: boolean;
  timestamp: number;
  base: CurrencyCode;
  date: string;
  rates: Rates;
};

type ExchangeRatesErrorResponse = {
  error: {
    code: string;
    message: string;
  };
};

type ExchangeRatesResponse =
  | ExchangeRatesErrorResponse
  | ExchangeRatesSuccessResponse;

export class ExchangeRatesClient {
  #apiKey: string;
  #apiUrl: string;
  #baseCurrency: CurrencyCode;

  constructor(options: ExchangeClientOptions) {
    if (!options.apiKey) throw new Error("EXCHANGE_RATES_API_KEY not set");
    if (!options.apiUrl) throw new Error("EXCHANGE_RATES_API_URL not set");
    this.#apiKey = options.apiKey;
    this.#apiUrl = options.apiUrl;
    this.#baseCurrency = options.baseCurrency ?? "USD";
  }

  getMetaData() {
    return {
      apiUrl: this.#apiUrl,
      baseCurrency: this.#baseCurrency,
    };
  }

  async getExchangeRates(base?: CurrencyCode): Promise<Rates> {
    const { data } = await axios.get<ExchangeRatesResponse>(
      `${this.#apiUrl}?access_key=${this.#apiKey}`
    );

    if ("success" in data && data.success === true) {
      const baseRate = data.rates[base ?? this.#baseCurrency];
      if (!baseRate) throw new Error("Base rate not found in response");

      const convertedRates = Object.entries(data.rates).reduce<Rates>(
        (acc, [currency, value]) => {
          return {
            ...acc,
            [currency]: value / baseRate,
          };
        },
        {
          [data.base]: 1,
        }
      );

      return convertedRates;
    }

    throw new Error("Unrecognized response from exchange rates server");
  }
}

const apiKey = process.env.EXCHANGE_RATES_API_KEY;
const apiUrl = process.env.EXCHANGE_RATES_API_URL;

export const exchangeRatesClient = new ExchangeRatesClient({
  apiKey,
  apiUrl,
  baseCurrency: "USD",
});
