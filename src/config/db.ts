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
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        console.log(colors.bgGreen.white(SUCCESS_MESSAGES.DB_CONNECTION));
    } catch (error) {
        console.error(colors.bgRed.white(ERROR_MESSAGES.DB_CONNECTION), error);
        throw error;
    }
}

export default sequelize;