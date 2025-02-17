import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import colors from 'colors';
import { ENV, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';
import { DatabaseService } from '../types/cache.types';

dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
    throw new Error(ERROR_MESSAGES.DB_URL_NOT_DEFINED);
}

// Crear una instancia de Sequelize con la URL de la base de datos
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    models: [__dirname + '/../models/**/*.ts'],
    logging: false,
  pool: {
    max: ENV.POOL.MAX_CONNECTIONS,
    min: ENV.POOL.MIN_CONNECTIONS,
    idle: ENV.POOL.IDLE_TIME,
    acquire: ENV.POOL.ACQUIRE_TIMEOUT
  }
});

// Hook para intentar reconectar automáticamente si la conexión se pierde
sequelize.addHook('afterDisconnect', async () => {
console.log('Conexión a la base de datos perdida. Intentando reconectar...');
try {
  await sequelize.authenticate();
  console.log('Reconectado a la base de datos con éxito.');
} catch (err) {
  console.error('Error al intentar reconectar:', err);
}
});
// Conectar a la base de datos
export async function connectDb(): Promise<void> {
    try {
        await sequelize.authenticate();
        await sequelize.sync(); // Sincroniza el esquema
        console.log(colors.bgGreen.white(SUCCESS_MESSAGES.DB_CONNECTION));
    } catch (error) {
        console.error(colors.bgRed.white(ERROR_MESSAGES.DB_CONNECTION), error);
        throw error; // Lanza el error para que el servidor lo gestione
    }
}
// Implementación de la interfaz DatabaseService
class SequelizeDatabaseService implements DatabaseService {
  async transaction(): Promise<any> {
    return sequelize.transaction();
  }
}
// Exportar la instancia de Sequelize y la implementación de la interfaz DatabaseService
export const dbService = new SequelizeDatabaseService();
export default sequelize;
