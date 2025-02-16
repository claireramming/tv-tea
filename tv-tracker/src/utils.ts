import { ProfileInfo, WatchListEntry } from "./types";
import { MovieDb, SimpleSeason, TvSeasonResponse } from "moviedb-promise";
import { toast } from 'react-toastify';

const moviedb = new MovieDb(process.env.TMDB_API_KEY || '');

export function fetchShowData(id: string | number) {
  return moviedb.tvInfo({ id, append_to_response: 'watch/providers,content_ratings' });
}

export function fetchSeasonData(
  series_id: string | number | undefined,
  seasons: SimpleSeason[] | undefined
): Promise<TvSeasonResponse>[] {
  if (!series_id || !seasons) return [];
  return seasons.map((season) => {
    return moviedb.seasonInfo({ id: series_id, season_number: season.season_number || 1 });
  });
}

/**
 * Fetches the user profile
 * @param {string} token access token
 * @returns user profile if one exists
 */
export async function getUserProfile(user: string, token: string): Promise<ProfileInfo> {
  try {
    return await SimpleFetch.get(`profile/${getUserId(user)}/`, {}, token);
  } catch (e) {
    console.error(e);
    return null
  }
}

/**
 * Fetches the user profile
 * @param {string} token access token
 * @returns user profile if one exists
 */
export async function getUserWatchList(token: string): Promise<WatchListEntry[] | []> {
  try {
    return await SimpleFetch.get('watchlist/', {}, token);
  } catch (e) {
    console.error(e)
  }
  return [];
}

export async function getUserStats(token: string): Promise<StatsInfo> {
  try {
    return await SimpleFetch.get('watchstats/', {}, token);
  } catch (e) {
    console.error(e);
    return null
  }
}

export async function getSeasonsFinishedSince(startDate: Date, token: string): Promise<WatchListEntry[] | []> {
  try {
    return await SimpleFetch.get('watchlist/', { datetime_finished_at__gte: startDate }, token);
  } catch (e) {
    console.error(e)
  }
  return [];
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
  } catch (e) {
    console.error(e);
  }
}

export async function addSeasonToWatchList(
  showId: number,
  seasonNumber: number,
  showStatus: string,
  token: string
): Promise<boolean> {
  try {
    await SimpleFetch.post(
      'watchlist/',
      { show_id: showId, season: seasonNumber, status: showStatus },
      token
    );
    toast.success('Added season to watchlist!', {
      autoClose: 3000,
      theme: "colored",
    });
    return true
  } catch (e) {
    const error = await e.json()
    if (error?.non_field_errors && error.non_field_errors?.[0].includes('unique set')) {
      toast.info('Season already in watchlist', {
        autoClose: 3000,
        theme: "colored",
      });
    } else {
      console.error(e)
      toast.error('Error adding season to watchlist', {
        autoClose: 3000,
        theme: "colored",
      });
    }
    return false
  }
}

export async function removeSeasonFromWatchList(watchlistId: number| undefined, token: string | undefined) {
  if (!watchlistId || !token) {
    console.error('No id or token provided')
    toast.error('Error removing season from watchlist', {
      autoClose: 3000,
      theme: "colored",
    });
    return false;
  }
  try {
    await SimpleFetch.delete(`watchlist/${watchlistId}/`, token);
    toast.info('Season removed from watchlist', {
      autoClose: 3000,
      theme: "colored",
    });
    return true
  } catch (e) {
    console.error(e)
    toast.error('Error removing season from watchlist', {
      autoClose: 3000,
      theme: "colored",
    });
    return false
  }
}

export async function startWatchingSeason(watchlistId: number | undefined, prewatchedEpisodes: number, token: string | undefined) {
  try {
    const startDate = new Date().toISOString()
    await SimpleFetch.patch(`watchlist/${watchlistId}/`, { num_episodes_watched: prewatchedEpisodes || 0, datetime_started_at: startDate }, token);
    toast.success('Season moved to In Progress!', {
      theme: "colored",
    });
    return startDate

  } catch (e) {
    console.error(e)
    toast.error('Error starting season', {
      theme: "colored",
    })
    return false
  }
}

export async function finishWatchingSeason(watchlistId: number | undefined, token: string | undefined) {
  try {
    const endDate = new Date().toISOString()
    await SimpleFetch.patch(`watchlist/${watchlistId}/`, { datetime_finished_at: endDate }, token);
    toast.success('Season marked as completed!', {
      theme: "colored",
    });
    return endDate
  } catch (e) {
    console.error(e)
    toast.error('Error finishing season', {
      theme: "colored",
    })
    return false
  }
}

export async function updateWatchListEntry(
  watchlistId: number | undefined,
  data: Record<string, unknown>,
  token: string | undefined,
) {
  try {
    await SimpleFetch.patch(`watchlist/${watchlistId}/`, data, token);
    return true
  } catch (e) {
    console.error(e)
    toast.error('Error updating watchlist', {
      theme: "colored",
    });
    return false
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
  if (!params || !Object.keys(params).length) {
    return '';
  }

  return `?${new URLSearchParams(params)}`;
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
    body: Record<string, unknown>,
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
    body: Record<string, unknown>,
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
    body: Record<string, unknown>,
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
    formData: FormData,
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
    body: Record<string, unknown> | undefined,
    otherOptions: RequestInit = {},
    contentType = 'application/json',
    responseNotJson = false,
    formDataRequest = false
  ): Promise<unknown> => {
    const url = `${process.env.API_URL}/${endPoint}`;
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
