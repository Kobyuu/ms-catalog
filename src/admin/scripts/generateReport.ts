import Product from '../../models/Product.model';
import { connectDb } from '../../config/db';
import { LoggerService } from '../../services/loggerService';
import * as fs from 'fs';

async function generateReport() {
  try {
    await connectDb();
    const products = await Product.findAll();
    // Crea un resumen con la cantidad de productos y su valor total.
    const report = {
      totalProducts: products.length,
      activeProducts: products.filter(p => p.activate).length,
      totalValue: products.reduce((sum, p) => sum + p.price, 0),
      timestamp: new Date().toISOString() //Fecha del informe
    };

    // Genera un archivo JSON con la información.
    const reportPath = `reports/inventory_${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    LoggerService.info(`Reporte generado: ${reportPath}`);
    process.exit(0);
  } catch (error) {
    LoggerService.error('Error generando el reporte', error as Error);
    process.exit(1);
  }
}

generateReport();