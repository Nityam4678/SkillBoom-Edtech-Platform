import { toast } from "react-hot-toast"

import { setInitialized, setLoading, setToken } from "../../slices/authSlice"
import { resetCart } from "../../slices/cartSlice"
import { setUser } from "../../slices/profileSlice"
import { apiConnector, clearAccessToken, setAccessToken, setSessionExpiredHandler } from "../apiconnector"
import { endpoints } from "../apis"

const {
  SIGNUP_API,
  LOGIN_API,
  REFRESH_API,
  LOGOUT_API,
} = endpoints

export function signUp(
  accountType,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  navigate
) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      toast.success("Signup Successful")
      navigate("/login")
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup Failed")
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}

export function login(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      })

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Login Successful")
      dispatch(setToken(response.data.token))
      setAccessToken(response.data.token)
      const userImage = response.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`
      dispatch(setUser({ ...response.data.user, image: userImage }))
      localStorage.setItem("user", JSON.stringify(response.data.user))
      navigate("/dashboard/my-profile")
    } catch (error) {
      toast.error("Login Failed")
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}

export function logout(navigate) {
  return async (dispatch) => {
    try {
      await apiConnector("POST", LOGOUT_API)
    } catch (error) {
      // Local logout must still complete if the refresh cookie is unavailable.
    }
    clearAccessToken()
    dispatch(setToken(null))
    dispatch(setUser(null))
    dispatch(resetCart())
    localStorage.removeItem("user")
    toast.success("Logged Out")
    navigate("/")
  }
}

export function refreshSession() {
  return async (dispatch) => {
    try {
      const response = await apiConnector("POST", REFRESH_API)
      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      setAccessToken(response.data.token)
      dispatch(setToken(response.data.token))
      dispatch(setUser(response.data.user))
    } catch (error) {
      clearAccessToken()
      dispatch(setToken(null))
      dispatch(setUser(null))
    } finally {
      dispatch(setInitialized(true))
    }
  }
}

export function configureSessionExpiry(dispatch) {
  setSessionExpiredHandler(() => {
    clearAccessToken()
    dispatch(setToken(null))
    dispatch(setUser(null))
    localStorage.removeItem("user")
  })
}