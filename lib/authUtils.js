import axios from "axios";
import Cookies from "js-cookie";

/**
 * Creates an axios instance with authentication headers
 * @returns {Object} Axios instance with Authorization header
 */
export function createAuthenticatedRequest() {
  const token = Cookies.get("token");
  
  if (!token) {
    throw new Error("No authentication token found. Please log in.");
  }

  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Makes an authenticated GET request
 * @param {string} url - The API endpoint URL
 * @returns {Promise} Axios response promise
 */
export async function authenticatedGet(url) {
  const authAxios = createAuthenticatedRequest();
  return authAxios.get(url);
}

/**
 * Makes an authenticated POST request
 * @param {string} url - The API endpoint URL
 * @param {Object} data - The request body data
 * @returns {Promise} Axios response promise
 */
export async function authenticatedPost(url, data) {
  const authAxios = createAuthenticatedRequest();
  return authAxios.post(url, data);
}

/**
 * Checks if user is authenticated
 * @returns {boolean} Whether user has a valid token
 */
export function isAuthenticated() {
  const token = Cookies.get("token");
  return !!token;
} 