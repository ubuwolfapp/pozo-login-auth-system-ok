
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1c4a859f2aa14a7abb036f58543e2115',
  appName: 'pozo-login-auth-system-ok',
  webDir: 'dist',
  server: {
    url: 'https://1c4a859f-2aa1-4a7a-bb03-6f58543e2115.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      keystorePath: 'release-key.keystore',
      keystoreAlias: 'key0',
      keystorePassword: 'password',
      keyPassword: 'password',
    }
  }
};

export default config;
