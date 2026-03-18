import { Context } from 'hono';

export type AppContext = {
  Variables: {
    userId: string;
    apiKey: string;
  };
};

export type AppContextType = Context<AppContext>;

// Made with Bob
