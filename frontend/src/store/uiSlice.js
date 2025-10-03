import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    showLoginModal: false,
    showSignupModal: false,
    theme: 'light',
    language: 'EN'
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openLoginModal: (state) => {
            state.showLoginModal = true;
            state.showSignupModal = false;
        },
        closeLoginModal: (state) => {
            state.showLoginModal = false;
        },
        openSignupModal: (state) => {
            state.showSignupModal = true;
            state.showLoginModal = false;
        },
        closeSignupModal: (state) => {
            state.showSignupModal = false;
        },
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
        switchLanguage: (state, action) => {
            state.language = action.payload;
        },
    }
});

export const {
    openLoginModal,
    openSignupModal,
    closeLoginModal,
    closeSignupModal,
    toggleTheme,
    switchLanguage
} = uiSlice.actions;

export default uiSlice.reducer;