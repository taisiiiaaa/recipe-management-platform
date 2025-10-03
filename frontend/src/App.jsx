import './App.css'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { BrowserRouter, Routes, Route } from 'react-router'
import PrivateRoute from './components/PrivateRoute/PrivateRoute'

import Main from './pages/Main/Main'
import AllRecipes from './pages/AllRecipes/AllRecipes'
import ViewRecipe from './pages/ViewRecipe/ViewRecipe'
import MyRecipes from './pages/MyRecipes/MyRecipes'
import Favorites from './pages/Favorites/Favorites'
import About from './pages/About/About'
import ErrorPage from './pages/ErrorPage/ErrorPage'
import CreateRecipe from './pages/CreateRecipe/CreateRecipe'
import EditRecipe from './pages/EditRecipe/EditRecipe'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const theme = useSelector((state) => state.ui.theme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  return (
    <>
      <BrowserRouter>
        <Header />

        <main>
          <Routes>
            <Route path='/' element={ <Main /> }></Route>
            <Route path='/all-recipes' element={ <AllRecipes /> }></Route>
            <Route path='/all-recipes/view-recipe/:recipeId' element={<ViewRecipe />} />

            <Route path='/my-recipes' element={
              <PrivateRoute>
                <MyRecipes />
              </PrivateRoute>
            } />
            <Route path='/my-recipes/create-recipe' element={
              <PrivateRoute>
                <CreateRecipe />
              </PrivateRoute>
            } />
            <Route path='/my-recipes/edit-recipe/:recipeId' element={
              <PrivateRoute>
                <EditRecipe />
              </PrivateRoute>
            } />
            <Route path='/my-recipes/favorites' element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            } />
            <Route path='/my-recipes/view-recipe/:recipeId' element={
              <PrivateRoute>
                <ViewRecipe />
              </PrivateRoute>
            } />
            <Route path='/my-recipes/favorites/view-recipe/:recipeId' element={
              <PrivateRoute>
                <ViewRecipe />
              </PrivateRoute>
            } />

            <Route path='/about' element={ <About /> }></Route>
            <Route path='*' element={ <ErrorPage /> }></Route>
          </Routes>
        </main>

        <Footer />
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover />
    </>
  )
}

export default App
