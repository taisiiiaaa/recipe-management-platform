import { useEffect, useState } from 'react'
import './MyRecipes.css'
import useTranslation from '../../hooks/useTranslation'
import { Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMyRecipes } from '../../store/myRecipesSlice'
import { ToggleSwitch } from '../../styled-components/components'
import { updateRecipeStatus } from '../../store/updateRecipeStatusSlice'
import { toast } from 'react-toastify'
import { deleteRecipe } from '../../store/myRecipesSlice'
import DeleteModal from '../../modals/DeleteRecipe/DeleteRecipe'
import formatCookingTime from '../../utils/formatCookingTime'
import { difficultyTranslations } from '../../i18n/categoryTranslations'
import categoryTranslations from '../../i18n/categoryTranslations'

export default function MyRecipes() {
  const [filter, setFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [recipeToDelete, setRecipeToDelete] = useState(null)

  const t = useTranslation()
  const selectedLang = useSelector(state => state.ui.language)

  const dispatch = useDispatch()
  const { recipes, loading, error } = useSelector((state) => state.myRecipes)
  const { loading: updatingStatus, error: updateError } = useSelector(state => state.updateRecipeStatus)

  const [initialRecipesCount, setInitialRecipesCount] = useState(null)

  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (!recipeToDelete) return
    dispatch(deleteRecipe(recipeToDelete.id))
      .unwrap()
      .then(() => {
        toast.success(t.deletedSuccessfully || 'Recipe deleted successfully')
        dispatch(fetchMyRecipes({ searchTerm, status: filter }))
      })
      .catch(() => {
        toast.error(t.deleteFailed || 'Failed to delete recipe')
      })
      .finally(() => {
        setShowDeleteModal(false)
        setRecipeToDelete(null)
      })
  }

  useEffect(() => {
    dispatch(fetchMyRecipes({}))
      .then((res) => {
        if (res.payload) {
          setInitialRecipesCount(res.payload.length)
        }
      })
  }, [])

  useEffect(() => {
    const params = {}
    if (searchTerm.trim()) params.searchTerm = searchTerm.trim()
    if (filter) params.status = filter

    dispatch(fetchMyRecipes(params))
  }, [dispatch, searchTerm, filter])

  const handleToggleStatus = (recipe) => {
    const newStatus = !recipe.is_public

    dispatch(updateRecipeStatus({ id: recipe.id, is_public: !recipe.is_public }))
      .unwrap()
      .then(() => {
        dispatch(fetchMyRecipes({ searchTerm, status: filter }))
        toast.success(`${t.statusChanged} ${newStatus ? t.pub : t.priv}`)
      })
      .catch((err) => {
        toast.error('Failed to update recipe status')
        console.error('Failed to update status:', err)
      })
  }

  return (
    <div className='my-recipes-page'>
      <div className='second-bar'>
        <h2>{t.myRecipes}</h2>
        <ul>
          <li>
            <Link to='/my-recipes/favorites' id='favorites'>{t.favorites}</Link>
          </li>
          <li>
            <Link to='/my-recipes/create-recipe' id='create-recipe'>{t.createRecipe}</Link>
          </li>
        </ul>
      </div>
      <div className='top-bar'>
        <input type='text' placeholder={t.search} id='search-bar' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <div className='my-filters'>
          <input
            type="radio"
            id="all"
            name="visibility"
            value=""
            checked={filter === ''}
            onChange={() => setFilter('')}
          />
          <label htmlFor="all" className={filter === '' ? 'active' : ''}>{t.all}</label>

          <input
            type="radio"
            id="public"
            name="visibility"
            value="public"
            checked={filter === 'public'}
            onChange={() => setFilter('public')}
          />
          <label htmlFor="public" className={filter === 'public' ? 'active' : ''}>{t.public}</label>

          <input
            type="radio"
            id="private"
            name="visibility"
            value="private"
            checked={filter === 'private'}
            onChange={() => setFilter('private')}
          />
          <label htmlFor="private" className={filter === 'private' ? 'active' : ''}>{t.private}</label>
        </div>
      </div>
      <div className='my-recipes-container'>
        {recipes && recipes.length === 0 && (
          <>
            {initialRecipesCount === 0 ? (
              <p className='no-recipes'>{t.noRecipesYet}</p>
            ) : (
              <p className='no-recipes'>{t.noRecipesMatch}</p>
            )}
          </>
        )}
        {recipes && recipes.length > 0 && (
          recipes.map(recipe => {
            const isPublic = recipe.status === 'public' || recipe.is_public
            return (
              <div key={recipe.id} className='recipe-card'>
                <img src={recipe.imagePath ? `/uploads/${recipe.imagePath}` : 'src/assets/placeholder.jpg'} width='570px' height='360px' alt={recipe.name} />
                <h4>{recipe.name} by @me</h4>
                <div className='details'>
                  <div className='left'>
                    <p>{selectedLang === 'UA' ? categoryTranslations[recipe.category.name] : recipe.category.name}</p>
                    <p className='cooking-time'>
                      <span id='cooking-time' />
                      <span>{formatCookingTime(recipe.cooking_time, t)}</span>
                    </p>
                    <p>{selectedLang === 'UA' ? difficultyTranslations.UA[recipe.difficulty] : recipe.difficulty}</p>
                  </div>
                  <div className='right'>
                    <p className='comments'>
                      <span id='comments' />
                      <span>{recipe.commentsCount}</span>
                    </p>
                    <p className='rating'>
                      <span id='rating' />
                      <span>{recipe.avgRating}</span>
                    </p>
                  </div>
                </div>
                <div className='buttons'>
                  <div className='actions'>
                    <Link to={`/my-recipes/view-recipe/${recipe.id}`} id='view-recipe'>{t.view}</Link>
                    <Link to={`/my-recipes/edit-recipe/${recipe.id}`} id='edit-recipe'>{t.edit}</Link>
                    <button type='button' onClick={() => handleDeleteClick(recipe)}>{t.delete}</button>
                  </div>
                  <div className='switch'>
                    <span>{t.private}</span>
                    <ToggleSwitch checked={!isPublic} onChange={() => handleToggleStatus(recipe)} disabled={updatingStatus} />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
      {showDeleteModal && (
        <DeleteModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  )
}
