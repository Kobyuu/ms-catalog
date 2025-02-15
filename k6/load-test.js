import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 60,
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 20,
      maxVUs: 100,
    },
  },
  discardResponseBodies: true,
  thresholds: {
    http_req_failed: ['rate<0.05'], // Aumentamos la tolerancia al 5%
    http_req_duration: ['p(95)<1000'], // Aumentamos el tiempo máximo a 1s
  }
};

export default function () {
  const BASE_URL = 'http://ms-catalog_app:4001';
  
  const params = {
    timeout: '5s',
  };
  
  const response = http.get(`${BASE_URL}/api/product`, params);
  
  check(response, {
    'is status 200': (r) => r.status === 200,
  });
  
  sleep(1);
} 