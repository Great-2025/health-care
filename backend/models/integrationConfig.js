const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/init');

const IntegrationConfig = sequelize.define('IntegrationConfig', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('HL7', 'FHIR', 'CUSTOM'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  connectionConfig: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  mappingConfig: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  syncFrequency: {
    type: DataTypes.ENUM('REAL_TIME', 'HOURLY', 'DAILY', 'WEEKLY'),
    defaultValue: 'DAILY'
  },
  lastSync: {
    type: DataTypes.DATE
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'integration_configs',
  timestamps: true
});

module.exports = { IntegrationConfig };
