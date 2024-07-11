import { Sequelize } from "sequelize";
import { DATABASE_URL } from '@constants/env';

export default new Sequelize(DATABASE_URL);
