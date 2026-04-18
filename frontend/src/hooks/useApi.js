import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axiosConfig';

/**
 * @typedef {Object} UseApiOptions
 * @property {string} [options.method='GET'] - HTTP method
 * @property {*} [options.body] - Request body
 * @property {boolean} [options.immediate=true] - Execute request on mount
 */

/**
 * Generic API fetch hook factory.
 * Provides a reusable interface for API calls with loading, error, and data states.
 *
 * @param {string} url - API endpoint relative to /api/v1
 * @param {UseApiOptions} [options] - Configuration options
 * @returns {{ data: *, loading: boolean, error: string|null, refetch: Function, execute: Function }}
 */
export function useApi(url, options = {}) {
  const { method = 'GET', body, immediate = true } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute the API request.
   * @param {Object} [overrideOptions] - Optional overrides for method and body
   * @returns {Promise<*>}
   */
  const execute = useCallback(async (overrideOptions = {}) => {
    const requestMethod = overrideOptions.method || method;
    const requestBody = overrideOptions.body !== undefined ? overrideOptions.body : body;

    setLoading(true);
    setError(null);

    try {
      const config = {
        method: requestMethod,
        url,
      };

      if (requestBody && ['POST', 'PUT', 'PATCH'].includes(requestMethod)) {
        config.data = requestBody;
      }

      const response = await api(config);
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, method, body]);

  /**
   * Refetch with the same parameters.
   * @returns {Promise<*>}
   */
  const refetch = useCallback(() => execute(), [execute]);

  useEffect(() => {
    if (immediate) {
      setLoading(true);
      execute().finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]);

  return { data, loading, error, refetch, execute };
}
