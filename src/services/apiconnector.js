import axios from "axios"

let accessToken = null
let refreshPromise = null
let onSessionExpired = null
const FRONTEND_API_URL =
    process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL
const refreshUrl = `${FRONTEND_API_URL}/api/v1/auth/refresh`

export const setAccessToken = (token) => {
    accessToken = token
}

export const clearAccessToken = () => {
    accessToken = null
}

export const setSessionExpiredHandler = (handler) => {
    onSessionExpired = handler
}

export const axiosInstance = axios.create({ withCredentials: true });

axiosInstance.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
})

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (
            error.response?.status !== 401 ||
            !accessToken ||
            !originalRequest ||
            originalRequest._retry ||
            originalRequest.url === refreshUrl
        ) {
            return Promise.reject(error)
        }

        originalRequest._retry = true
        try {
            if (!refreshPromise) {
                refreshPromise = axios.post(refreshUrl, null, {
                    withCredentials: true,
                }).finally(() => {
                    refreshPromise = null
                })
            }
            const refreshResponse = await refreshPromise
            setAccessToken(refreshResponse.data.token)
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`
            return axiosInstance(originalRequest)
        } catch (refreshError) {
            clearAccessToken()
            if (onSessionExpired) {
                onSessionExpired()
            }
            return Promise.reject(refreshError)
        }
    }
)

export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method:`${method}`,
        url:`${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers: null,
        params: params ? params : null,
    });
}