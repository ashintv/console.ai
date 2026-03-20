import app from '../apps/api/dist/index.js';

export const config = {
  runtime: 'nodejs18.x',
};

export default async (request) => {
  return app.fetch(request);
};
