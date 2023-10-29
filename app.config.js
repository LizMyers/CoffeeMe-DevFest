import 'dotenv/config';

export default {
  expo: {
    name: 'CoffeeMe-DevFest',
    slug: 'coffee-me-devfest',
    privacy: 'public',
    platforms: ['ios', 'android'],
    version: '0.15.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'cover',
      backgroundColor: '#F57C00'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.sanddollarapps.coffeeme',
    },
    extra: {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      roboflowApiKey: process.env.ROBOFLOW_API_KEY,
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
      expo: {
        expoProjectId: process.env.EXPO_PROJECT_ID,
      }
      
    },
    
    }
  }

