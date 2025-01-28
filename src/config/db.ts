//Configuracion relacionada a la base de datos.
import { Sequelize } from "sequelize-typescript";
import dotenv from 'dotenv';
dotenv.config();

console.log('DATABASE_URL:', process.env.DATABASE_URL);

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  models: [__dirname + '/../models/**/*.ts'],
});

export default sequelize;