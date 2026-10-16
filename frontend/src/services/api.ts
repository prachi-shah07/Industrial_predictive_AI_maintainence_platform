import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const getMachines = () => api.get('/machines').then(res => res.data);
export const createMachine = (data: any) => api.post('/machines', data).then(res => res.data);
export const getMachine = (id: number) => api.get(`/machines/${id}`).then(res => res.data);
export const getSensors = (machineId: number) => api.get(`/sensors/${machineId}`).then(res => res.data);
export const getPredictions = (machineId: number) => api.get(`/predictions/${machineId}`).then(res => res.data);
export const getRul = (machineId: number) => api.get(`/rul/${machineId}`).then(res => res.data);
export const getAnomalies = () => api.get('/anomalies').then(res => res.data);
export const getAlerts = () => api.get('/alerts').then(res => res.data);
export const getMetrics = () => api.get('/metrics').then(res => res.data);
export const getModels = () => api.get('/models').then(res => res.data);
export const getMaintenance = () => api.get('/maintenance').then(res => res.data);

export default api;
