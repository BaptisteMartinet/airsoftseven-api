import { Sequelize } from 'sequelize';
import { __DATABASE_URL__ } from '@constants/env';

export default new Sequelize(__DATABASE_URL__);
