const fetch = require('node-fetch');
global.fetch = fetch;
global.Request = fetch.Request;
global.Response = fetch.Response;
global.Headers = fetch.Headers;
require('@testing-library/jest-dom');
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://mock-url.com';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-key-valid-format';