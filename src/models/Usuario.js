import Sequelize from 'sequelize';

export default (sequelize, DataTypes) => {
    
    const Usuario = sequelize.define('t_usuarios', {
        id_usuario: {
            type: DataTypes.UUID, 
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_rol: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: 'ALUMNO',
        },
        estado_usuario: {
            type: DataTypes.ENUM( 'NO VERIFICADO', 'VERIFICADO' ),
            defaultValue: 'NO VERIFICADO' 
        },
        imagen: DataTypes.STRING(80),
        fecha_registro: DataTypes.DATEONLY,
        dni: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        nombre:     DataTypes.STRING(40),
        apellido:   DataTypes.STRING(40),
        sexo:       DataTypes.STRING(10),
        fecha_nacimiento: DataTypes.DATEONLY,
        pais:           DataTypes.STRING(40),
        departamento:   DataTypes.STRING(60),
        provincia:      DataTypes.STRING(60),
        distrito:       DataTypes.STRING(60),
        direccion:      DataTypes.STRING(120),
        telefono_fijo:      DataTypes.STRING(15),
        telefono_celular:   DataTypes.STRING(20),
        id_estado_civil:    DataTypes.STRING(30),
    }, {
        timestamps: true,
        updatedAt: false,
        createdAt: 'fecha_registro'
    });

    Usuario.associate = models => {
        
        Usuario.belongsTo( models.Rol, {
            foreignKey: 'id_rol',
            as:         'rol',
            onDelete:   'CASCADE',
            onUpdate:   'CASCADE'
        });

        Usuario.belongsTo( models.EstadoCivil, {
            foreignKey: 'id_estado_civil',
            as:         'estado_civil',
            onDelete:   'CASCADE',
            onUpdate:   'CASCADE'
        });
    }
    
    return Usuario;
}