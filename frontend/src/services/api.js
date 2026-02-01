import axios from "axios";

const API_BASE = "http://localhost:5000/api";

/**
 * API Service - Real Backend Integration
 * Replaces mockApi.js for production use
 */

// =============================================
// STATE
// =============================================

export const getState = async () => {
    const response = await axios.get(`${API_BASE}/state`);
    return response;
};

// =============================================
// DEVICES
// =============================================

export const getDevices = async () => {
    const response = await axios.get(`${API_BASE}/devices`);
    return response;
};

export const addDevice = async (device) => {
    const response = await axios.post(`${API_BASE}/devices`, {
        name: device.name,
        powerW: device.powerW,
        type: device.type
    });
    return response;
};

export const deleteDevice = async (id) => {
    const response = await axios.delete(`${API_BASE}/devices/${id}`);
    return response;
};

export const updateDevice = async (device) => {
    // Backend doesn't have PUT /devices/:id, so we delete and re-add
    // Or use POST /device/:id with the full device object
    // For now, we'll just toggle + handle locally
    console.warn("updateDevice: Backend doesn't support full device update yet");
    return Promise.resolve();
};

export const toggleDevice = async (id, isOn) => {
    const response = await axios.post(`${API_BASE}/device/${id}`, { isOn });
    return response;
};

// =============================================
// OVERRIDE MODE
// =============================================

export const setOverride = async (overrideMode) => {
    const response = await axios.post(`${API_BASE}/override`, { overrideMode });
    return response;
};

// =============================================
// SYSTEM CONFIG
// =============================================

export const getConfig = async () => {
    const response = await axios.get(`${API_BASE}/config`);
    return response;
};

export const updateConfig = async (config) => {
    const response = await axios.post(`${API_BASE}/config`, config);
    return response;
};

// =============================================
// FORECAST
// =============================================

export const get24hForecast = async () => {
    const response = await axios.get(`${API_BASE}/forecast`);
    return response;
};
