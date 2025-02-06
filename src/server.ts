import express from 'express'
import router from './router'
import { rateLimiter } from './middleware/rateLimiter'

const server = express()
//Leer datos de formularios
server.use(express.json())

// Aplicar rate limiter antes de todas las rutas
server.use(rateLimiter)

// Configuración de rutas
server.use('/api/product', router)

export default server