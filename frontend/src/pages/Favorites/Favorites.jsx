import { useEffect, useState } from 'react'
import './Favorites.css'
import { useDispatch, useSelector } from 'react-redux'
import { addFavorite, getFavorites, removeFavorite } from '../../store/favoritesSlice'
import RecipeCard from '../../components/RecipeCard/RecipeCard'
import useTranslation from '../../hooks/useTranslation'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import groupIngredientsByName from '../../utils/groupIngredientsByName'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function Favorites() {
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.favorites.favorites); 

  const [selectingMode, setSelectingMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  const cancelSelection = () => {
    setSelectingMode(false);
    setSelectedIds([]);
  }

  const handleExportPDF = () => {
    const selectedRecipes = favorites.filter(f => selectedIds.includes(f.id));

    const doc = new jsPDF();
    doc.setFontSize(18);
    const pageWidth = doc.internal.pageSize.getWidth();
    const titleText = 'Grocery List';
    const textWidth = doc.getTextWidth(titleText);
    const centerX = (pageWidth - textWidth) / 2;
    doc.text(titleText, centerX, 20);
    doc.setFontSize(14);
    let currentY = 30;

    selectedRecipes.forEach((recipe, index) => {
      if (index > 0) {
        currentY += 10;
        if (currentY > 270) {
          doc.addPage();
          currentY = 8;
        }
      }
      doc.setFontSize(15);
      doc.text(recipe.name, 14, currentY);
      currentY += 3;

      const recipeIngredients = recipe.recipeIngredients.map(ri => [
        ri.ingredient.name,
        ri.quantity || ''
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Ingredient', 'Quantity']],
        body: recipeIngredients,
        theme: 'grid',
        headStyles: {
          fillColor: '#232528',
          textColor: [255, 255, 255]
        },
        margin: { left: 14, right: 14 },
        didDrawPage: (data) => {
          currentY = data.cursor.y + 10; 
        }
      });
    });
    doc.save('grocery-list.pdf');
  }
  
  useEffect(() => {
    dispatch(getFavorites());
  }, [dispatch]);

  const handleBack = () => {
    navigate(-1); 
  }

  return (
    <div className='favorites-page'>
      <div className='heading-and-back'>
        <div className='left'>
          <span className='back-button' onClick={handleBack} />
          <h2>{t.favorites}</h2>
        </div>
        {favorites.length > 0 && (
        <>
          {!selectingMode ? (
            <button onClick={() => setSelectingMode(true)} id='create-list'>{t.createGroceryList}</button>
          ) : (
            <div className='grocery-btn'>
              <button onClick={handleExportPDF} id='export-list'>{t.exportList}</button>
              <button onClick={cancelSelection} id='cancel-list'></button>
            </div>
          )}
        </>
      )}        
      </div>
      <div className='favorite-recipes'>
        {favorites.length === 0 &&
          <p className='empty-list'>{t.empty}</p>
        }
        {favorites?.map(f => {
          if (!f.id) return null;
          const isFavorite = favorites.some(fav => fav.id === f.id);
          
          const toggleFavorite = () => {
            if (isFavorite) {
              dispatch(removeFavorite(f.id));
              toast.success(t.removedFromFav);
            } else {
              dispatch(addFavorite(f.id));
            }
          };
          return (
            <RecipeCard 
              key={f.id + 1} 
              recipe={f} 
              toggleFavorite={toggleFavorite} 
              isFavorite={isFavorite} 
              from={location.pathname}
              showCheckboxes={selectingMode}
              isSelected={selectedIds.includes(f.id)}
              onCheckboxToggle={() => toggleSelect(f.id)} 
            />
          )
        })}
      </div>
    </div>
  )
}
