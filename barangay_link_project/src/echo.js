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

// Check if we're in local development without Reverb running
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const reverbDisabled = import.meta.env.VITE_REVERB_DISABLED === 'true';

// Only initialize Echo if not explicitly disabled or if in production
let echo = null;

if (!reverbDisabled || !isLocalDev) {
  try {
    echo = new Echo({
      broadcaster: 'reverb',
      key: import.meta.env.VITE_REVERB_APP_KEY,
      wsHost: getReverbHost(),
      wsPort: getReverbPort(),
      wssPort: getReverbPort(),
      forceTLS: getReverbScheme(),
      enabledTransports: ['ws', 'wss'],
    });
  } catch (err) {
    console.warn('Laravel Echo initialization failed (WebSocket unavailable in local dev):', err.message);
    // Create a mock Echo object with noop methods for local development
    echo = {
      channel: () => ({
        listen: () => ({ listen: () => {} }),
      }),
      leaveChannel: () => {},
      private: () => ({
        listen: () => ({ listen: () => {} }),
      }),
    };
  }
} else {
  // Mock Echo for local development without Reverb
  console.info('Laravel Echo disabled for local development (set VITE_REVERB_DISABLED=false to enable)');
  echo = {
    channel: () => ({
      listen: () => ({ listen: () => {} }),
    }),
    leaveChannel: () => {},
    private: () => ({
      listen: () => ({ listen: () => {} }),
    }),
  };
}

export { echo };