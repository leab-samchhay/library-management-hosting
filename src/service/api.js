import axios from "axios";
import { store } from "@/store/store";
import { logout } from "@/store/authSlice";

const api = axios.create({
    baseURL : import.meta.env.VITE_API_URL,
    headers : {Accept: 'application/json'}
});


api.interceptors.request.use((config) => {
    const token = store.getState().auth.token
    if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const token = store.getState().auth.token
        if (error.response?.status === 401 && token &&
            error.config?.headers.Authorization === `Bearer ${token}`) {
        store.dispatch(logout())
        }
        return Promise.reject(error)
    },
)

export default api;