export default (sequelize, DataTypes) => {
    
    const Rol = sequelize.define('t_roles', {
        id_rol: {
            type: DataTypes.STRING(30),
            primaryKey: true
        }
    }, {
        timestamps: false,
    });

    Rol.associate = models => {
        Rol.hasMany( models.Usuario, {
            foreignKey: 'id_rol',
            as: 'usuarios',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    }

    return Rol;
}