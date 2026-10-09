import { initBotId } from 'botid/client/core';

initBotId({
  protect: [
    { path: '/api/submit-referral', method: 'POST' },
    { path: '/api/submit-survey', method: 'POST' },
    { path: '/api/submit-hosting-prebooking', method: 'POST' },
    { path: '/api/client/login/request', method: 'POST' },
  ],
});
