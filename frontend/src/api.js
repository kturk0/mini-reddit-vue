import axios from "axios";

const api = axios.create({
 baseURL: 'http://192.168.1.13:5000',
});

export default api;
export const server = 'http://192.168.1.13:5000';