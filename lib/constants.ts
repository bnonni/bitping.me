export const API_HEADERS = {
  accept         : 'application/json',
  'content-type' : 'application/json'
};

export const SPEED_API_HEADERS = {
  ...API_HEADERS,
  authorization   : '',
  'speed-version' : '2022-10-15',
};

export const APP_API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : process.env.APP_API_URL;