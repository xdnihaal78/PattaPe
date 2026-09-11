import { MOCK_CROPS, MOCK_DIAGNOSES } from './mockData';

// Simulated latency helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all supported crops
 */
export async function getCrops() {
  await delay(300);
  return MOCK_CROPS;
}

/**
 * Simulate AI leaf diagnosis logic
 */
export async function analyzeCropImage(cropId, imageFileOrData) {
  // Simulate 1.5 second AI analysis processing
  await delay(1500);

  // Return specific mock diagnosis or fallback
  const result = MOCK_DIAGNOSES[cropId] || MOCK_DIAGNOSES.default;
  
  return {
    success: true,
    timestamp: new Date().toISOString(),
    cropId: cropId || 'tomato',
    data: result
  };
}

/**
 * Simulate Agri Officer Escalation submission
 */
export async function escalateToOfficer(payload) {
  await delay(800);
  return {
    success: true,
    ticketId: 'KVK-' + Math.floor(100000 + Math.random() * 900000),
    message: 'Case escalated to KVK Agriculture Officer. Expect a callback within 2 hours.',
    localMessage: 'आपकी समस्या कृषि अधिकारी के पास भेज दी गई है। आपको २ घंटे में कॉल आएगा।'
  };
}
