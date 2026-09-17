import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.teletv.player',
  appName: 'TeleTV Player',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
