import { Sequelize } from 'sequelize';
import { __DATABASE_URL__, __DISABLE_DB_LOGGING__ } from '@constants/env';

export default new Sequelize(__DATABASE_URL__, { logging: __DISABLE_DB_LOGGING__ ? false : console.log });
