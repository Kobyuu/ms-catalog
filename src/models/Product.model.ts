import { Table, Column, Model, DataType, Default } from 'sequelize-typescript'
import { ERROR_MESSAGES } from '../config/constants'

@Table({
    tableName: 'products'
})
class Product extends Model {
    // Validaciones de nombre
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: ERROR_MESSAGES.EMPTY_NAME
            }
        }
    })
    declare name: string
    // Validaciones de precio
    @Column({
        type: DataType.FLOAT(),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: ERROR_MESSAGES.EMPTY_PRICE
            },
            isNumeric: {
                msg: ERROR_MESSAGES.INVALID_PRICE
            },
            min: {
                args: [0],
                msg: ERROR_MESSAGES.PRICE_POSITIVE
            }
        }
    })
    declare price: number
    
    // Disponibilidad
    @Default(true)
    @Column({
        type: DataType.BOOLEAN()
    })
    declare activate: boolean
}

export default Product