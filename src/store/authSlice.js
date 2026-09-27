import { createSlice } from '@reduxjs/toolkit'

const initialUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const initialToken = localStorage.getItem('token') || null;

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: initialUser,
        token: initialToken,
    },
    reducers: {
        loginSuccess(state, action) {
            state.user = action.payload.user
            state.token = action.payload.token
            localStorage.setItem('user', JSON.stringify(action.payload.user))
            localStorage.setItem('token', action.payload.token)
        },
        logout(state) {
            state.user = null
            state.token = null
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        },
    },
})

export const { loginSuccess, logout } = authSlice.actions
export default authSlice.reducer
