import { createApp } from './create-app.js';
import { loadConfig } from './config/env.js';
import express from 'express';

const config = loadConfig({
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: process.env.PORT || '5000'
});

const app = createApp(config);

export default app;