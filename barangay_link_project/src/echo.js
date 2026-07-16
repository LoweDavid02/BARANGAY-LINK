import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const getReverbHost = () => {
  let host = import.meta.env.VITE_REVERB_HOST;
  if (host) {
    // Strip protocol prefix if the user accidentally included it (e.g. https://domain -> domain)
    return host.replace(/^https?:\/\//, '');
  }
  
  const hostname = window.location.hostname;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    if (hostname.includes('barangay-link-project')) {
      return 'barangay-link-backend.onrender.com';
    }
  }
  return 'localhost';
};

const getReverbPort = () => {
  if (import.meta.env.VITE_REVERB_PORT) {
    return parseInt(import.meta.env.VITE_REVERB_PORT, 10);
  }
  const hostname = window.location.hostname;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return 443;
  }
  return 8080;
};

const getReverbScheme = () => {
  if (import.meta.env.VITE_REVERB_SCHEME) {
    return import.meta.env.VITE_REVERB_SCHEME === 'https';
  }
  const hostname = window.location.hostname;
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return true; // Use wss secure connection in production
  }
  return false;
};

export const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'barangaylink_key',
    wsHost: getReverbHost(),
    wsPort: getReverbPort(),
    wssPort: getReverbPort(),
    forceTLS: getReverbScheme(),
    enabledTransports: ['ws', 'wss'],
});
