import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'io.ionic.starter',
    appName: 'photo-gallery',
    webDir: 'www/browser',
    server: {
        androidScheme: 'https'
    }
};

export default config;
