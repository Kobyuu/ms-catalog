import colors from 'colors'
import server from "./server"
import db from './config/db'

const port = process.env.PORT || 4001

async function startServer() {
    try {
        await db.authenticate()
        await db.sync()
        console.log(colors.bgGreen.white('Conexión exitosa a la base de datos'))
        
        server.listen(port, () => {
            console.log(colors.cyan.bold(`REST API en el puerto ${port}`))
        })
    } catch (error) {
        console.log(error)
        console.log(colors.bgRed.white('Error al conectar la base de datos'))
        process.exit(1)
    }
}

startServer()