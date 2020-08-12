'use strict'

const config = require('../../config').config.database
const Sequelize = require('sequelize')
const Model = Sequelize.Model;
class BinaryInfo extends Model {}

// Option 1: Passing parameters separately
const sequelize = new Sequelize(config.name, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    pool: config.pool
})

sequelize
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

BinaryInfo.init({
    // attributes
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    tag: {
        type: Sequelize.STRING,
        allowNull: false
    },
    version: {
        type: Sequelize.STRING,
        allowNull: false
    },
    archive_file: {
        type: Sequelize.STRING,
        allowNull: false
    },
    stable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'binary_info',
    timestamps: true
    // options
});
BinaryInfo.sync()

module.exports = {
    BinaryInfo
}