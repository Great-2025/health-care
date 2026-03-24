const express = require('express');
const router = express.Router();
const { HL7Parser } = require('../services/hl7Parser');
const { FHIRConverter } = require('../services/fhirConverter');
const { IntegrationConfig } = require('../models/integrationConfig');
const { SyncStatus } = require('../models/syncStatus');
const { authenticateToken } = require('../middleware/auth');

const hl7Parser = new HL7Parser();
const fhirConverter = new FHIRConverter();

// Get all integration configurations
router.get('/configs', authenticateToken, async (req, res) => {
  try {
    const configs = await IntegrationConfig.findAll();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new integration configuration
router.post('/configs', authenticateToken, async (req, res) => {
  try {
    const config = await IntegrationConfig.create(req.body);
    res.status(201).json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Parse HL7 message
router.post('/parse-hl7', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const parsed = hl7Parser.parse(message);
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert HL7 to FHIR
router.post('/convert-hl7-to-fhir', authenticateToken, async (req, res) => {
  try {
    const { hl7Message, resourceType } = req.body;
    const parsedHL7 = hl7Parser.parse(hl7Message);
    const fhirResource = fhirConverter.convertHL7ToFHIR(parsedHL7, resourceType);
    res.json(fhirResource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sync status
router.get('/sync-status', authenticateToken, async (req, res) => {
  try {
    const status = await SyncStatus.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test integration connection
router.post('/test-connection', authenticateToken, async (req, res) => {
  try {
    const { config } = req.body;
    // Test connection logic here
    const testResult = await testIntegrationConnection(config);
    res.json(testResult);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Preview data transformation
router.post('/preview-transformation', authenticateToken, async (req, res) => {
  try {
    const { sourceData, mappingConfig } = req.body;
    const preview = await generateTransformationPreview(sourceData, mappingConfig);
    res.json(preview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get connection health
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const healthStatus = await getConnectionHealth();
    res.json(healthStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function testIntegrationConnection(config) {
  // Mock connection test - implement actual connection logic
  return {
    success: true,
    message: 'Connection successful',
    responseTime: Math.floor(Math.random() * 100) + 'ms',
    timestamp: new Date().toISOString()
  };
}

async function generateTransformationPreview(sourceData, mappingConfig) {
  // Mock transformation preview - implement actual transformation logic
  return {
    originalData: sourceData,
    transformedData: sourceData, // This would be the actual transformed data
    mappingApplied: mappingConfig,
    timestamp: new Date().toISOString()
  };
}

async function getConnectionHealth() {
  // Mock health status - implement actual health checking logic
  return {
    status: 'healthy',
    connections: [
      {
        name: 'HIS System',
        status: 'connected',
        lastSync: new Date().toISOString(),
        responseTime: '45ms'
      },
      {
        name: 'FHIR Server',
        status: 'connected',
        lastSync: new Date().toISOString(),
        responseTime: '32ms'
      }
    ],
    timestamp: new Date().toISOString()
  };
}

module.exports = router;
