/// <reference types="node" />

// Mock for react-dom hooks must be at the top
// The useFormState and useFormStatus hooks are not available in the test environment (JSDOM), so we mock them.
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  useFormState: (action: Function, initialState: any) => {
    // We must use `require` here because jest.mock is hoisted
    const React = require('react'); 
    const [state, setState] = React.useState(initialState);
    const dispatch = async (formData: FormData) => {
      const newState = await action(state, formData);
      setState(newState);
    };
    return [state, dispatch];
  },
  useFormStatus: () => ({
    pending: false,
    data: null,
    method: null,
    action: null,
  }),
}));

import '@testing-library/jest-dom';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { TextEncoder, TextDecoder } from 'util';
import React from 'react';

// Polyfills for Jest's Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

import fetch, { Request, Response, Headers } from 'node-fetch';

if (!global.fetch) {
  (global as any).fetch = fetch;
  (global as any).Request = Request;
  (global as any).Response = Response;
  (global as any).Headers = Headers;
}

// Polyfill for form.requestSubmit in JSDOM, which is used by user-event for form submissions.
if (typeof HTMLFormElement !== 'undefined' && !HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function (this: HTMLFormElement) {
    this.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };
}

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

// Mock window.matchMedia for Jest
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false, // Default to light mode
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock HTMLCanvasElement.getContext for Chart.js
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = () => null;
}

// Mock for ResizeObserver, used by Headless UI
if (typeof window.ResizeObserver === 'undefined') {
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
    }));
}