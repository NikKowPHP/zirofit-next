import {getRequestConfig} from 'next-intl/server';
 
export const locales = ['en', 'pl'];

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));