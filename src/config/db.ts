import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import colors from 'colors';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants';

dotenv.config();
// Verificar que la variable de entorno DATABASE_URL esté definida
if (!process.env.DATABASE_URL) {
    throw new Error(ERROR_MESSAGES.DB_URL_NOT_DEFINED);
}
// Crear una instancia de Sequelize con la URL de la base de datos
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    models: [__dirname + '/../models/**/*.ts'],
    logging: false
});
// Conectar a la base de datos
export async function connectDb(): Promise<void> {
    const maxRetries = 5;
    let currentTry = 1;

    while (currentTry <= maxRetries) {
        try {
            await sequelize.authenticate();
            await sequelize.sync();
            console.log(colors.bgGreen.white(SUCCESS_MESSAGES.DB_CONNECTION));
            return;
        } catch (error) {
            console.error(colors.bgRed.white(`Intento ${currentTry} de ${maxRetries}: ${ERROR_MESSAGES.DB_CONNECTION}`), error);
            if (currentTry === maxRetries) throw error;
            await new Promise(resolve => setTimeout(resolve, 5000)); // espera 5 segundos
            currentTry++;
        }
    }
}
export default sequelize;