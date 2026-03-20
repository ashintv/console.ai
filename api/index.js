import app from '../apps/api/dist/src/index.js';

export const config = {
  runtime: 'nodejs20.x',
};

export default async (request) => {
  return app.fetch(request);
};
