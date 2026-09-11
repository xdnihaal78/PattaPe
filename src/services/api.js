import { MOCK_PREDICTION_RESPONSE, MOCK_CROPS } from './mockData';

// Simulated latency helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Backend API configuration - toggle to false when real backend endpoint is ready
const USE_MOCK = true;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Predict crop disease from uploaded leaf image and crop type
 * Backend API Contract: POST /predict
 * 
 * @param {FormData|Object} payload - FormData containing 'image' and 'crop' (or cropId)
 * @returns {Promise<typeof MOCK_PREDICTION_RESPONSE>} Prediction response
 */
export async function predictCrop(payload) {
  if (USE_MOCK) {
    // Simulate API network latency of approximately 1.5–2 seconds
    await delay(1800);
    return MOCK_PREDICTION_RESPONSE;
  }

  // --- Real Backend POST /predict Endpoint Integration ---
  const formData = payload instanceof FormData ? payload : new FormData();
  if (!(payload instanceof FormData) && payload && typeof payload === 'object') {
    Object.entries(payload).forEach(([k, v]) => formData.append(k, v));
  }

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.detail || `Prediction failed with status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Wrapper for analyzeCropImage to maintain backward compatibility with existing components
 * Calls predictCrop and returns the exact mock prediction response
 */
export async function analyzeCropImage(cropId, imageFileOrData) {
  const result = await predictCrop({ crop: cropId, image: imageFileOrData });
  return {
    success: true,
    timestamp: result.timestamp || new Date().toISOString(),
    cropId: result.crop || cropId || 'rice',
    data: result
  };
}

/**
 * Get all supported crops
 */
export async function getCrops() {
  await delay(200);
  return MOCK_CROPS;
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
