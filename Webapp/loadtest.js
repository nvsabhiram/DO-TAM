import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Stay at 50 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% requests should be <500ms
  },
};

export default function () {
  let res = http.get('http://159.89.254.19/');
  check(res, {
    'status was 200': (r) => r.status === 200,
  });
  sleep(1);
}

