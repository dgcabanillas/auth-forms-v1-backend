import jwt from 'jsonwebtoken';
import { sendEmail } from './sendEmail';
import { welcome } from './templates/welcome';
import config from '../../config/app';

export const sendWelcomeEmail = async ( args ) => { 
    try {
        const { nombre, apellido, email, secret } = args;

        const token = jwt.sign({ email, nombre, apellido }, secret, {});
        const link = config.env.CLIENT_URL + '/auth/confirm-account/' + token;
        
        let mailOptions = {
            from:       "admin <no-reply@gmail.com>", 
            to:         email,
            subject:    '¡Bienvenido!',
            html:       welcome({ nombre, apellido, link })
        };
        
        await sendEmail( mailOptions );
    } catch (e) {
        throw new Error(e.message);
    }
}