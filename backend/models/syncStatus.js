const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/init');

const SyncStatus = sequelize.define('SyncStatus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  integrationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'integration_configs',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  messageType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sourceSystem: {
    type: DataTypes.STRING,
    allowNull: false
  },
  targetSystem: {
    type: DataTypes.STRING,
    allowNull: false
  },
  recordCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  processedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  errorCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  errorMessage: {
    type: DataTypes.TEXT
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endTime: {
    type: DataTypes.DATE
  },
  duration: {
    type: DataTypes.INTEGER // in milliseconds
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
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
  tableName: 'sync_status',
  timestamps: true
});

module.exports = { SyncStatus };
