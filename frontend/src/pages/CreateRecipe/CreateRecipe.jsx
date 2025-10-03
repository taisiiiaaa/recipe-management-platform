import './CreateRecipe.css'
import useTranslation from '../../hooks/useTranslation';
import { useNavigate } from 'react-router';
import RecipeForm from '../../components/RecipeForm/RecipeForm';

export default function CreateRecipe() {
    const t = useTranslation();
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1); 
    }

    return (
        <div className='create-recipe-page'>
            <div className='top'>
                <span className='back-button' onClick={handleBack} />
                <h3>{t.createRecipe}</h3>
            </div>
            <RecipeForm mode='create' />
        </div>
    )
}
