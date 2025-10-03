import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'

import uiReducer from './store/uiSlice.js'
import authReducer from './store/authSlice.js'
import recipesReducer from './store/recipesSlice.js'
import favoritesReducer from './store/favoritesSlice.js'
import myRecipesReducer from './store/myRecipesSlice.js'
import updateRecipeStatusReducer from './store/updateRecipeStatusSlice.js'

const store = configureStore({
    reducer: {
        ui: uiReducer,
        auth: authReducer,
        recipes: recipesReducer,
        favorites: favoritesReducer,
        myRecipes: myRecipesReducer,
        updateRecipeStatus: updateRecipeStatusReducer
    },
});

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <App />
    </Provider>
);
