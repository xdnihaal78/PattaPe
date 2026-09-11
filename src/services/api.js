import { MOCK_PREDICTION_RESPONSE, MOCK_CROPS } from './mockData';

// Simulated latency helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Backend API configuration
const USE_MOCK = true;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 10000; // 10s timeout for field conditions

/**
 * Predict crop disease from uploaded leaf image and crop type
 * Backend API Contract: POST /predict
 * 
 * @param {FormData|Object} payload - FormData containing 'image' and 'crop' (or cropId)
 * @param {Object} [options] - Optional timeout and mock simulation controls
 * @returns {Promise<typeof MOCK_PREDICTION_RESPONSE>} Prediction response
 */
export async function predictCrop(payload, options = {}) {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;

  // Check for test simulation mode
  const simulation = options.simulate || (typeof window !== 'undefined' && window.__SIMULATE_ERROR);
  if (simulation === 'timeout') {
    await delay(timeoutMs + 200);
    const err = new Error('Connection timed out');
    err.isTimeout = true;
    err.code = 'TIMEOUT';
    throw err;
  }
  if (simulation === 'api_failed') {
    await delay(600);
    const err = new Error('Service communication failed');
    err.isApiError = true;
    err.code = 'API_FAILED';
    throw err;
  }

  if (USE_MOCK) {
    // Normal simulated latency of ~1.8s
    await delay(1800);
    return MOCK_PREDICTION_RESPONSE;
  }

  // --- Real Backend POST /predict Endpoint Integration with Timeout ---
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const formData = payload instanceof FormData ? payload : new FormData();
    if (!(payload instanceof FormData) && payload && typeof payload === 'object') {
      Object.entries(payload).forEach(([k, v]) => formData.append(k, v));
    }

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const err = new Error(`Prediction service returned status ${response.status}`);
      err.isApiError = true;
      err.status = response.status;
      throw err;
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError' || err.message?.includes('aborted')) {
      const timeoutErr = new Error('Network request timed out');
      timeoutErr.isTimeout = true;
      timeoutErr.code = 'TIMEOUT';
      throw timeoutErr;
    }
    err.isApiError = true;
    throw err;
  }
}

/**
 * Wrapper for analyzeCropImage
 */
export async function analyzeCropImage(cropId, imageFileOrData, options = {}) {
  const result = await predictCrop({ crop: cropId, image: imageFileOrData }, options);
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
