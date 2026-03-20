import { Context } from 'hono';

export type AppContext = {
  Variables: {
    userId: string;
    apiKey: string;
    rateLimit?: {
      limit: number;
      current: number;
      remaining: number;
    };
  };
};

export type AppContextType = Context<AppContext>;

// Made with Bob
