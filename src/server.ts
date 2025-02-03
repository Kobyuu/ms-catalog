import express from 'express'
import router from './router'
import { rateLimiter } from './middleware/rateLimiter'

const server = express()

// Aplicar rate limiter antes de todas las rutas
server.use(rateLimiter)

//Circuitbreaker

//Leer datos de formularios
server.use(express.json())
server.use('/api/products', router)

export default server