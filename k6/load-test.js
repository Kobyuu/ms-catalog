import http from 'k6/http';
import { sleep, check } from 'k6';

// Configuración de prueba de carga con tasa de solicitudes constante
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
    http_req_failed: ['rate<0.05'], 
    http_req_duration: ['p(95)<1000'],
  }
};
// Función principal que realiza petición GET al endpoint de productos
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