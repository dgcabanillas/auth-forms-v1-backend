import bcrypt from 'bcrypt';
import { createToken, getData } from '../util/helpers';
import { 
    loginValidator,
    registerValidator,
    validPassword
} from '../util/validators';

// emails
import { sendResetPasswordEmail }   from '../email/sendResetPasswordEmail';
import { sendWelcomeEmail }         from '../email/sendWelcomeEmail';

export default {
    Mutation: {
        login: async (_, args, { models, SECRET }) => {
            try {
                const { data, valid, errors } = loginValidator( args );

                // if the args are not valid, return
                if( !valid ) return { token: '', errors };

                const { email, password } = data;

                // user must exist
                const user = await models.Usuario.findOne({ 
                    where: { email }, 
                    attributes: ['id_usuario', 'id_rol', 'email', 'password'] 
                });
                if ( !user ) {
                    return { 
                        token: '', 
                        errors: [{ error: 'email', description: 'Este correo no está registrado.' }]
                    };
                }
                    
                // passwords must match
                const matched = await bcrypt.compare( password, user.password );
                if( !matched ) {
                    return {
                        token: '',
                        errors: [{ error: 'password', description: 'Contraseña incorrecta.' }]
                    }
                }
                return { token: await createToken(user, SECRET), errors: [] };
            } catch (e) {
                throw new Error(e.message);
            }
        },
        register: async (_, args, { models, SECRET }) => {
            try {
                const { data, valid, errors } = registerValidator(args);

                // if the args are not valid, return
                if ( !valid ) return { token: '', errors };

                const { nombre, apellido, email, dni } = data;
            
                // the email must not be repeated
                let user = await models.Usuario.findOne({ where: { email }, attributes: ['id_usuario'] });
                if ( user ) errors.push({ error: 'email', description: 'Este correo ya está en uso' });
                
                // the DNI must be unique
                user = await models.Usuario.findOne({ where: { dni }, attributes: ['id_usuario'] });
                if ( user ) errors.push({ error: 'dni', description: 'Este DNI ya ha sido registrado' })

                // finish if there are errors 
                if( errors.length > 0) return { token: '', errors };

                data.password = await bcrypt.hash(data.password, 12);
                const newUser = await models.Usuario.create( data );

                await sendWelcomeEmail({ nombre, apellido, email, secret: SECRET });

                return { token: await createToken(newUser, SECRET), errors: [] };
            } catch (e) {
                throw new Error(e.message);
            }
        },
        confirmAccountFromLink: async (_, args, { models, SECRET }) => {
            try {
                const { token } = args;
                const { email } = getData( token, SECRET );
                const user = await models.Usuario.findOne({ 
                    where: { email },
                    attributes: ['id_usuario']
                });
                if( !user ) throw new Error();

                await models.Usuario.update(
                    { estado_usuario: 'VERIFICADO' }, 
                    { where: { id_usuario: user.id_usuario }}
                );

                return true;
            } catch {
                throw new Error('Algo salió mal en la confirmación de su cuenta');
            }
        },
        recover: async (_, args, { models, SECRET }) => {
            try {
                const { email } = args;
                const user = await models.Usuario.findOne({ 
                    where: { email },
                    attributes: ['id_usuario', 'nombre', 'apellido']
                });
                if( !user ) throw new Error('Este correo no está registrado.')

                const { nombre, apellido } = user;
                await sendResetPasswordEmail({ nombre, apellido, email, secret: SECRET });
                return true;
            } catch (e) {
                throw new Error(e.message);
            }
        },
        resetPassword: async (_, args, { models, SECRET }) => {
            try {
                const { token, password } = args;
                const { email } =  getData(token, SECRET);

                const user = await models.Usuario.findOne({ 
                    where: { email },
                    attributes: ['id_usuario']
                });
                if( !user ) throw new Error('No existe usuario asociado a este correo');

                const validationResult = validPassword( password );
                if( validationResult ) return { errors: [{ error: 'password', description: validationResult }]};

                const hashedPassword = await bcrypt.hash(password, 12);
                await models.Usuario.update(
                    { password: hashedPassword }, 
                    { where: { id_usuario: user.id_usuario }}
                );

                return { errors: [] };
            } catch (e) {
                throw new Error(e.message);
            }
        },
    }
}