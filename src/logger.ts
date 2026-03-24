export const logger = {
  info: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.error(message, ...args);
    }
  },
};
