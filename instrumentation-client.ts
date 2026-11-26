import { initBotId } from 'botid/client/core';

initBotId({
  protect: [
    { path: '/api/submit-referral', method: 'POST' },
    { path: '/api/client/login/request', method: 'POST' },
    { path: '/api/review-request', method: 'POST' },
  ],
});
