import { ApolloServer, makeExecutableSchema } from 'apollo-server';
import models from './models'
import typeDefs from './types';
import resolvers from './resolvers';

require('dotenv').config();

const SECRET = process.env.SECRET;

const schema = makeExecutableSchema({
    typeDefs,
    resolvers
});

const apollo = new ApolloServer({
    schema,
    context: ({req}) => {
        return {
            models,
            SECRET,
        }
    }
})

const PORT = process.env.PORT || '4000';

const forceOption = {force: true};
models.sequelize.sync(forceOption).then( () => {
    apollo.listen(PORT).then(({url}) => {
        console.log(`Servidor corriendo en: ${url}`);
    });
}).then( async () => {
    if( forceOption.force ) {
        await models.Rol.create({ id_rol: 'ALUMNO' });
    }
});

