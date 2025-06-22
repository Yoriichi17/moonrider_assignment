require('dotenv').config();
const { Sequelize, DataTypes } = require("sequelize");
const ContactModel = require("../models/contact.model");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, 
    pool: {
      max: 5,       
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
  
);

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.Contact = ContactModel(sequelize, DataTypes);

module.exports = db;
