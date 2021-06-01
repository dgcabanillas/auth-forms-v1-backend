import Sequelize    from 'sequelize';
import path         from 'path';
import EstadoCivil  from './EstadoCivil';
import Rol          from './Rol';
import Usuario      from './Usuario';

require('dotenv').config();

const env = process.env.NODE_ENV || "development";
const config = require(path.join(__dirname, "../../", "config", "database.json"))[env];

if( env == 'production' ) {
    var sequelize = new Sequelize( process.env.DATABASE_URL, {
        ssl: true,
        underscored: true,
        freezeTableName: true,
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, 
            }
        },
    });
} else {
    var sequelize = new Sequelize( config.database, config.username, config.password, {
        dialect: config.dialect,
        define: {
            underscored: true,
            freezeTableName: true
        }
    });
}

let db = {
    EstadoCivil:    EstadoCivil( sequelize, Sequelize.DataTypes ),
    Rol:            Rol( sequelize, Sequelize.DataTypes ),
    Usuario:        Usuario( sequelize, Sequelize.DataTypes ),
}

Object.keys(db).forEach( modelName => {
    if( "associate" in db[modelName] ) {
        db[modelName].associate( db );
    }
});

db.sequelize = sequelize;

export default db;