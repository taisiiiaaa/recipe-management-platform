import axios from "axios"
import qs from "qs"

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
})

axiosInstance.interceptors.request.use(
  (config) => {
    const authData = JSON.parse(localStorage.getItem("auth"))

    if (authData?.token) {
      config.headers.Authorization = `Bearer ${authData.token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

export default axiosInstance
