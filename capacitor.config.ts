
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.daf78ec4dabf4b91aca08bc95d6e3803',
  appName: 'credit-trail-ledger-flow',
  webDir: 'dist',
  server: {
    url: 'https://daf78ec4-dabf-4b91-aca0-8bc95d6e3803.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    backgroundColor: "#FFFFFF"
  },
  ios: {
    backgroundColor: "#FFFFFF"
  }
};

export default config;
