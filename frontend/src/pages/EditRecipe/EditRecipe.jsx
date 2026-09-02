import './EditRecipe.css'
import { useNavigate, useParams } from 'react-router-dom'
import RecipeForm from '../../components/RecipeForm/RecipeForm'
import { useEffect, useState } from 'react'
import axios from '../../utils/axiosInstance'
import useTranslation from '../../hooks/useTranslation'

export default function EditRecipePage() {
  const { recipeId } = useParams()
  const [recipe, setRecipe] = useState(null)

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem('auth'))
        const token = authData?.token

        const res = await axios.get(`/recipes/${recipeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setRecipe(res.data)
      } catch (err) {
        console.error('Failed to fetch recipe:', err)
      }
    }

    fetchRecipe()
  }, [recipeId])

  const t = useTranslation()
  const navigate = useNavigate()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <div className='edit-recipe-page'>
      <div className='top'>
        <span className='back-button' onClick={handleBack} />
        <h3>{t.editRecipe}</h3>
      </div>
      <RecipeForm mode='edit' initialData={recipe} />
    </div>
  )
}