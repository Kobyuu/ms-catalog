import Product from '../../models/Product.model';
import { connectDb } from '../../config/db';
import { LoggerService } from '../../services/loggerService';

//Rellenar la base de datos con datos de prueba

const seedProducts = [
  {
    name: "Producto administrativo 1",
    price: 99.99,
    activate: true
  }
];

async function seedDatabase() {
  try {
    await connectDb();
    await Product.bulkCreate(seedProducts); // Inserta los productos de prueba en la base de datos.
    LoggerService.info('Base de datos sembrada con éxito');
    process.exit(0);
  } catch (error) {
    LoggerService.error('Error al sembrar la base de datos', error as Error);
    process.exit(1);
  }
}

seedDatabase();