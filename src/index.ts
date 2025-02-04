import colors from 'colors';
import server from "./server";
import { connectDb } from './config/db';
import { ENV } from './config/constants';

// Iniciar el servidor
async function startServer() {
    try {
        await connectDb();
        server.listen(Number(ENV.PORT), "0.0.0.0", () => {
            console.log(colors.cyan.bold(`REST API en el puerto ${ENV.PORT}`));
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

startServer();