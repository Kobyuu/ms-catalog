import Product from '../../models/Product.model';
import { connectDb } from '../../config/db';
import { LoggerService } from '../../services/loggerService';
import { Op } from 'sequelize';

async function cleanup() {
  try {
    await connectDb();
     // Elimina productos inactivos que no han sido actualizados en los últimos 30 días.
    const result = await Product.destroy({
      where: {
        activate: false, // Solo productos inactivos.
        updatedAt: {
          [Op.lt]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 días
        }
      }
    });
    LoggerService.info(`Se limpiaron ${result} productos inactivos.`);
    process.exit(0);
  } catch (error) {
    LoggerService.error('Error durante la limpieza', error as Error);
    process.exit(1);
  }
}

cleanup();