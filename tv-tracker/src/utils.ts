import { ProfileInfo } from "./types";

/**
 * Fetches the user profile
 * @param {string} token access token
 * @returns user profile if one exists
 */
export async function getUserProfile(user: string, token: string): Promise<ProfileInfo | null> {
  try {
    return await SimpleFetch.get(`profile/${getUserId(user)}/`, {}, token);
  } catch (e: Error | any) {
    if (e.status == 404) {
      return null;
    }
  }
  return null;
}

/**
 * Fetches the user profile
 * @param {string} token access token
 * @returns user profile if one exists
 */
export async function getUserWatchList(token: string): Promise<any | null> {
  try {
    return await SimpleFetch.get('watchlist/', {}, token);
  } catch (e: Error | any) {
    if (e.status == 404) {
      return null;
    }
  }
  return null;
}

/**
 * Creates a user profile
 * @param user id of the user
 * @param token access token
 */
export async function createUserProfile(user: string, token: string) {
  if (!user) return;
  try {
    await SimpleFetch.post('profile/', { id: getUserId(user) }, token);
  } catch (e: Error | any) {
    console.error(e);
  }
}

export async function addSeasonToWatchList(
  showId: number,
  seasonNumber: number,
  showStatus: string,
  token: string
) {
  try {
    await SimpleFetch.post(
      'watchlist/',
      { show_id: showId, season: seasonNumber, status: showStatus },
      token
    );
  } catch (e: Error | any) {
    console.error(e);
    return e.message;
  }
}

function getUserId(user: string) {
  return user.split('|')[1];
}

/**
 * Transform an Object into a query string
 *
 * @param {Object} params Query params as an Object or an Array of key-value pairs
 * @returns a query string
 */
function toQueryParams(params = {}) {
  if (!params) {
    return '';
  }

  // supports edge cases where params is an array
  const queryParams = Array.isArray(params)
    ? params.filter(([, value]) => value !== undefined && value !== null)
    : Object.entries(params).filter(([, value]) => value !== undefined && value !== null);

  const formattedQueryParams = queryParams.map(([key, value]) => {
    // JSON Stringify Object query params
    if (typeof value === 'object' && !Array.isArray(value)) {
      return [key, JSON.stringify(value)];
    }

    return [key, value];
  });

  if (!formattedQueryParams.length) {
    return '';
  }

  return `?${new URLSearchParams(formattedQueryParams)}`;
}

/**
 * Utility for performing basic fetch options for JSON with
 * auth defaults, param/body handling, and some basic error handling.
 *  */
export class SimpleFetch {
  /**
   * POST method that returns the created object
   * @param {String} endPoint
   * @param {BodyInit} body - will be stringified by this utility
   * @param {HeadersInit} additionalHeaders - will append or
   * override to default headers.
   * @param {Object} otherOptions - will be appended to options object
   * @param {String} contentType If not application/json
   * @param {boolean} responseNotJson If the response should not be parsed as JSON
   * @returns {Promise<Object>}
   */
  static post = async (
    endPoint: string,
    body: any,
    token: string | undefined = undefined,
    additionalHeaders = {},
    otherOptions = {},
    responseNotJson = false
  ) => {
    return await this.baseFetch(
      endPoint,
      'POST',
      token,
      additionalHeaders,
      body,
      otherOptions,
      undefined,
      responseNotJson
    );
  };

  /**
   * PUT method that returns the updated object
   * @param {String} endPoint
   * @param {BodyInit} body - will be stringified by this utility
   * @param {HeadersInit} additionalHeaders - will append or
   * override to default headers.
   * @param {Object} otherOptions - will be appended to options object
   * @returns {Promise<Object>}
   */
  static put = async (
    endPoint: string,
    body: BodyInit,
    token: string | undefined = undefined,
    additionalHeaders = {},
    otherOptions = {}
  ) => {
    return await this.baseFetch(endPoint, 'PUT', token, additionalHeaders, body, otherOptions);
  };

  /**
   * GET method
   * @param {String} endPoint
   * @param {Object} params - will be converted to search parameters
   * @param {HeadersInit} additionalHeaders - will append or
   * override to default headers.
   * @param {Object} otherOptions - will be appended to options object
   * @param {String} contentType If not application/json
   * @returns {Promise<Object>}
   */
  static get = async (
    endPoint: string,
    params = {},
    token: string | undefined = undefined,
    additionalHeaders = {},
    otherOptions = {},
    contentType = 'application/json',
    responseNotJson = false
  ) => {
    return await this.baseFetch(
      `${endPoint}${toQueryParams(params)}`,
      'GET',
      token,
      additionalHeaders,
      undefined,
      otherOptions,
      contentType,
      responseNotJson
    );
  };

  /** DELETE method */
  static delete = async (
    endPoint: string,
    token: string | undefined = undefined,
    additionalHeaders = {},
    otherOptions = {}
  ) => {
    return await this.baseFetch(
      endPoint,
      'DELETE',
      token,
      additionalHeaders,
      undefined,
      otherOptions
    );
  };

  /**
   * PATCH method that returns the updated object
   * @param {String} endPoint
   * @param {BodyInit} body - will be stringified by this utility
   * @param {HeadersInit} additionalHeaders - will append or
   * override to default headers.
   * @param {Object} otherOptions - will be appended to options object
   * @returns {Promise<Object>}
   */
  static patch = async (
    endPoint: string,
    body: BodyInit,
    token: string | undefined = undefined,
    additionalHeaders = {},
    otherOptions = {}
  ) => {
    return await this.baseFetch(endPoint, 'PATCH', token, additionalHeaders, body, otherOptions);
  };

  /**
   * POST Form Data method
   * @param {String} endPoint
   * @param {BodyInit} formData - will NOT be stringified by this utility
   * @returns {Promise<Object>}
   */
  static postFormData = async (
    endPoint: string,
    formData: any,
    token: string | undefined = undefined
  ) => {
    return await this.baseFetch(
      endPoint,
      'POST',
      token,
      undefined,
      undefined,
      { body: formData },
      undefined,
      undefined,
      true
    );
  };

  /**
   * @param {String} endPoint
   * @param {String} method
   * @param {HeadersInit} additionalHeaders
   * @param {*} body - for some request types
   * @param {Object} otherOptions - will be appended to options object
   * @param {String} contentType If not application/json
   * @param {boolean} responseNotJson If the response should not be parsed as JSON
   * @returns {Promise<Object>|Error}
   */
  static baseFetch = async (
    endPoint: string,
    method: string,
    token: string | undefined = undefined,
    additionalHeaders = {},
    body: BodyInit | undefined,
    otherOptions: RequestInit = {},
    contentType = 'application/json',
    responseNotJson = false,
    formDataRequest = false
  ) => {
    const url = `http://localhost:3000/${endPoint}`;
    //await refreshTokensIfNeeded();
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${token || ''}`,
        ...(!formDataRequest && { Accept: contentType }),
        ...(!formDataRequest && { 'Content-Type': contentType }),
        ...additionalHeaders
      },
      ...otherOptions
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    if (!response.ok) {
      throw response;
    }

    if (
      ['DELETE'].includes(method) ||
      contentType != 'application/json' ||
      response.status == 204 ||
      responseNotJson
    ) {
      return response;
    }
    const json = await response.json();
    return json;
  };
}
