import { MOCK_PREDICTION_RESPONSE, MOCK_CROPS } from './mockData';

// Simulated latency helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Backend API configuration
// Set VITE_USE_MOCK=true in .env to use simulated responses (no backend required).
// Set VITE_USE_MOCK=false (or omit) to use the real FastAPI backend at VITE_API_BASE_URL.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const DEFAULT_TIMEOUT_MS = 30000; // 30s timeout — model loading can take 10-15s on first request

/**
 * Convert a base64 Data URL to a Blob
 */
function dataURItoBlob(dataURI) {
  const parts = dataURI.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const byteString = atob(parts[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }
  return new Blob([uint8Array], { type: mime });
}

/**
 * Predict crop disease from uploaded leaf image and crop type
 * Backend API Contract: POST /predict
 * 
 * @param {FormData|Object} payload - FormData or Object containing 'image'/'file' and 'crop'
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
    const formData = new FormData();
    let cropVal = 'rice';
    let imageVal = null;
    let latVal = null;
    let lonVal = null;

    if (payload instanceof FormData) {
      cropVal = payload.get('crop') || 'rice';
      imageVal = payload.get('file') || payload.get('image');
      latVal = payload.get('lat');
      lonVal = payload.get('lon');
    } else if (payload && typeof payload === 'object') {
      cropVal = payload.crop || payload.cropId || 'rice';
      imageVal = payload.file || payload.image;
      latVal = payload.lat;
      lonVal = payload.lon;
    }

    formData.append('crop', cropVal);
    if (latVal != null) formData.append('lat', String(latVal));
    if (lonVal != null) formData.append('lon', String(lonVal));

    if (imageVal instanceof Blob || imageVal instanceof File) {
      formData.append('file', imageVal, imageVal.name || 'leaf.jpg');
    } else if (typeof imageVal === 'string' && imageVal.startsWith('data:')) {
      const blob = dataURItoBlob(imageVal);
      formData.append('file', blob, 'leaf.jpg');
    } else if (typeof imageVal === 'string' && (imageVal.startsWith('http://') || imageVal.startsWith('https://'))) {
      try {
        const imgRes = await fetch(imageVal);
        const blob = await imgRes.blob();
        formData.append('file', blob, 'sample_leaf.jpg');
      } catch {
        formData.append('file', imageVal);
      }
    } else if (imageVal) {
      formData.append('file', imageVal);
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
