import './RecipeCard.css'
import useTranslation from '../../hooks/useTranslation'
import { Link } from 'react-router'
import formatCookingTime from '../../utils/formatCookingTime'
import categoryTranslations from '../../i18n/categoryTranslations'
import { useSelector } from 'react-redux'
import { difficultyTranslations } from '../../i18n/categoryTranslations'

export default function RecipeCard({ recipe, toggleFavorite, isFavorite, from, showCheckboxes = null, isSelected = null, onCheckboxToggle = null }) {
    const t = useTranslation();
    const selectedLang = useSelector(state => state.ui.language);

    return (
        <div className='recipe-card'>
            {showCheckboxes && (
                <div className='add-to-list'>                    
                    <input
                        id='checkbox'
                        type='checkbox'
                        className='grocery-checkbox'
                        checked={isSelected}
                        onChange={onCheckboxToggle}
                    />
                    <label htmlFor='checkbox'>{isSelected ? t.addedToList : t.addToList}</label>
                </div>
            )}
            <img src={recipe.imagePath ? `http://localhost:3000/uploads/${recipe.imagePath}` : 'src/assets/placeholder.jpg'} width='570px' height='360px' alt={recipe.name} />
            <h4>{recipe.name} {recipe.user ? `by @${recipe.user.username}` : ''}</h4>
            <div className='details'>
                <div className='left'>
                    <p>{selectedLang === 'UA' ? categoryTranslations[recipe.category?.name] : recipe.category?.name}</p>
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
                    <a className={`like-button ${isFavorite ? 'liked' : ''}`} onClick={toggleFavorite}></a>
                </div>     
            </div>
            <p>
                <Link to={`${from}/view-recipe/${recipe.id}`} id='view-details'>{t.viewDetails}</Link>
            </p>
        </div>
    )
}
