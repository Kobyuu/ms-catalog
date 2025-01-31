//Configuracion relacionada a la base de datos.
import { Sequelize } from "sequelize-typescript";
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  models: [__dirname + '/../models/**/*.ts'],
  logging: false // Desactivar los logs
});

export default sequelize;