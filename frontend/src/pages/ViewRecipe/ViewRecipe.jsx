import { useEffect, useRef, useState } from 'react'
import './ViewRecipe.css'
import useTranslation from '../../hooks/useTranslation'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router'
import axios from '../../utils/axiosInstance'
import { addFavorite, removeFavorite } from '../../store/favoritesSlice'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { toast } from 'react-toastify'
import { StarRating } from '../../styled-components/components'
import formatCookingTime from '../../utils/formatCookingTime'

dayjs.extend(relativeTime)

export default function ViewRecipe() {
  const t = useTranslation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { recipeId } = useParams()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [userRating, setUserRating] = useState(0)

  const [commentText, setCommentText] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const authData = JSON.parse(localStorage.getItem('auth'))
  const token = authData?.token

  const isAuth = useSelector(state => state.auth.isAuthenticated)
  const favorites = useSelector(state => state.favorites.favorites)

  const isFavorite = recipe && favorites.some(fav => fav.id === recipe.id)

  const printRef = useRef()

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML
    const printWindow = window.open('', '', 'width=1200,height=800')

    printWindow.document.write(`
      <html>
        <head>
          <title>${recipe?.name}</title>
          <style>
            body {
              font-family: "Catamaran", sans-serif;
              padding: 24px;
            }
            img {
              max-width: 670px;
              height: 470px;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  const toggleFavorite = () => {
    if (!recipe || !recipe.id) return

    if (!isAuth) {
      toast.error(t.mustBeLoggedIn)
      return
    }

    if (isFavorite) {
      dispatch(removeFavorite(recipe.id))
      toast.success(t.removedFromFav)
    } else {
      dispatch(addFavorite(recipe.id))
      toast.success(t.addedToFav)
    }
  }

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(`/recipes/${recipeId}/view`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      setRecipe(response.data)
    } catch (err) {
      setError('Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (!commentText.trim() || !token) {
      return
    }

    setPostingComment(true)
    try {
      const response = await axios.post(
        `/recipes/${recipeId}/comments`,
        { content: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      )

      const newComment = {
        ...response.data,
        user: authData.user,
      }

      setRecipe((prev) => ({
        ...prev,
        comments: [newComment, ...(prev.comments || [])],
        commentsCount: (prev.commentsCount || 0) + 1,
      }))

      setCommentText('')
    } catch (err) {
      alert('Failed to post comment')
    } finally {
      setPostingComment(false)
    }
  }

  useEffect(() => {
    fetchRecipe()
  }, [recipeId])

  const handleRatingSubmit = async () => {
    try {
      await axios.post(
        `/recipes/${recipeId}/ratings`,
        { value: userRating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      toast.success(t.ratingSubmitted)
      fetchRecipe()
    } catch (err) {
      if (err.response?.status === 409) {
        toast.warning(t.alreadyRated)
      } else {
        toast.error(t.failedToSubmitRating)
      }
    }
  }

  return (
    <div className='view-recipe'>
      <div ref={printRef} id='print-recipe'>
        <div className='name-image'>
          <div className='name'>
            <div className='back-name'>
              <span className='back-button' onClick={handleBack} />
              {loading && <p>Loading...</p>}
              {error && <p>{error}</p>}
              {recipe && <h3>{recipe.name} by @{recipe?.user?.username}</h3>}
            </div>
            <div className='fields'>
              <div className='names'>
                <span>{t.category}</span>
                <span>{t.cookingTime}</span>
                <span>{t.difficulty}</span>
                <span>{t.averageRating}</span>
              </div>
              <div className='values'>
                <span>{recipe?.category?.name}</span>
                <span>{formatCookingTime(recipe?.cooking_time, t)}</span>
                <span>{recipe?.difficulty}</span>
                <span>{recipe?.avgRating}/5</span>
              </div>
            </div>
            <div className='like-container' onClick={toggleFavorite}>
              <a className={`like-button ${isFavorite ? 'liked' : ''}`}></a>
              <span>
                {isFavorite ? t.removeFromFav : t.addToFav}
              </span>
            </div>
          </div>
          {recipe && <img src={recipe.imagePath ? `/uploads/${recipe.imagePath}` : 'src/assets/placeholder.jpg'} width='670px' height='470px' alt={recipe.name} />}
        </div>
        <div className='description'>{recipe?.description}</div>
        <div className='instructions-ingredients'>
          <div className='instructions'>
            <h3>{t.cookingInstructions}</h3>
            <p>{recipe?.instructions}</p>
          </div>
          <div className='ingredients'>
            <h3>{t.ingredientList}</h3>
            <ul>
              {recipe?.recipeIngredients?.map((item, index) => (
                <li key={index}>
                  {item.ingredient.name}{item.quantity ? ` (${item.quantity})` : ''}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <hr />
      <button type='button' id='print-btn' onClick={handlePrint}>{t.print}</button>
      <div className='comments-rating'>
        <div className='comments-container'>
          <h4>{t.comments} ({recipe?.commentsCount})</h4>
          <form onSubmit={handleCommentSubmit}>
            <input type='text' placeholder={t.addComment} value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <button type='submit' disabled={postingComment}>{postingComment ? t.posting : t.post}</button>
          </form>
          <div className='comments'>
            {recipe?.comments && recipe?.comments.length > 0 ? (
              recipe.comments.map(comment => (
                <div className='comment' key={comment.id}>
                  <div className='top'>
                    <p>@{comment.user.username}</p>
                    <p>{dayjs(comment.createdAt).fromNow()}</p>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))
            ) : (
              <p>{t.noComments}</p>
            )}
          </div>
        </div>
        <div className='rating'>
          <h4>{t.rating}</h4>
          <div className='elements'>
            <StarRating name="rating" defaultValue={2} precision={0.5} size="large" value={userRating} onChange={(event, newValue) => setUserRating(newValue)} />
            <button onClick={handleRatingSubmit} disabled={!userRating}>{t.submit}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
