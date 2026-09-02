import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import categoryTranslations from '../../i18n/categoryTranslations'
import './AllRecipes.css'
import useTranslation from '../../hooks/useTranslation'
import { fetchRecipes } from '../../store/recipesSlice'
import { addFavorite, removeFavorite } from '../../store/favoritesSlice'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import axios from '../../utils/axiosInstance'
import RecipeCard from '../../components/RecipeCard/RecipeCard'
import { useLocation } from 'react-router'
import { toast } from 'react-toastify'

export default function AllRecipes() {
  const location = useLocation()
  const t = useTranslation()
  const selectedLang = useSelector((state) => state.ui.language)
  const isAuth = useSelector(state => state.auth.isAuthenticated)

  const [categories, setCategories] = useState([])
  const [translatedCategories, setTranslatedCategories] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedCookingTime, setSelectedCookingTime] = useState('')

  const dispatch = useDispatch()
  const { recipes, loading, error } = useSelector(state => state.recipes)

  const favorites = useSelector(state => state.favorites.favorites)

  useEffect(() => {
    const filters = {
      searchTerm: searchTerm.trim() || undefined,
      ingredients: undefined,
      categoryIds: selectedCategories.length > 0 ? selectedCategories.map(cat => Number(cat.id)) : undefined,
      difficulty: selectedDifficulty || undefined,
      cookingTimeRange: selectedCookingTime || undefined,
    }

    const trimmedInput = searchTerm.trim()

    if (trimmedInput.includes(',')) {
      const ingredientsArray = trimmedInput
        .split(',')
        .map(i => i.trim().toLowerCase())
        .filter(i => i.length > 0)
      if (ingredientsArray.length > 0) {
        filters.ingredients = ingredientsArray.join(',')
      }
    } else if (trimmedInput.length > 0) {
      filters.searchTerm = trimmedInput.toLowerCase()
    }

    dispatch(fetchRecipes(filters))
  }, [searchTerm, selectedCategories, selectedDifficulty, selectedCookingTime, dispatch])


  useEffect(() => {
    const mapped = categories.map((cat) => ({
      ...cat,
      displayName: selectedLang === 'UA' ? categoryTranslations[cat.name] || cat.name : cat.name,
    }))
    setTranslatedCategories(mapped)
  }, [categories, selectedLang])

  useEffect(() => {
    const doRequest = async () => {
      const request = await axios.get('/categories')
      setCategories(request.data)
    }
    doRequest()
  }, [])

  return (
    <>
      <div className='all-recipes-page'>
        <div className='top-bar'>
          <input type='text' placeholder={t.search} id='search-bar' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div className='filters'>
            <Stack spacing={3} sx={{ width: 400 }}>
              <Autocomplete
                sx={{ width: 400 }}
                multiple
                limitTags={3}
                id="tags-outlined"
                options={translatedCategories}
                getOptionLabel={(option) => option.displayName}
                value={selectedCategories}
                onChange={(event, newValue) => {
                  if (newValue.length <= 3) {
                    setSelectedCategories(newValue)
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label={t.selectCategories}
                    InputLabelProps={{
                      sx: {
                        fontFamily: '"Catamaran", sans-serif',
                        color: 'var(--color-text)',
                        '&.Mui-focused': {
                          color: 'var(--color-button-primary)',
                        },
                      },
                    }}
                    placeholder={t.selectCategories}
                    inputProps={{
                      ...params.inputProps,
                      style: {
                        fontFamily: '"Catamaran", sans-serif',
                        color: 'var(--color-placeholder)',
                      },
                    }}
                  />
                )}
                slotProps={{
                  popper: {
                    sx: {
                      '.MuiAutocomplete-listbox': {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                      },
                    },
                  },
                }}
                renderOption={(props, option, { selected }) => (
                  <li
                    {...props}
                    style={{
                      textAlign: 'left',
                      width: '100%',
                      paddingLeft: '20px',
                      padding: '10px 0',
                      marginBottom: '-16px',
                      marginTop: '-16px',
                    }}
                    className="custom-option"
                  >
                    {option.displayName}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      {...getTagProps({ index })}
                      label={option.displayName}
                      sx={{
                        backgroundColor: 'transparent',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-stroke)',
                        '& .MuiChip-deleteIcon': {
                          color: 'var(--color-stroke)',
                          '&:hover': {
                            color: 'var(--color-button-primary)',
                          },
                        },
                      }}
                    />
                  ))
                }
              />
            </Stack>
            <select name='difficulty' className='difficulty-select' value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} >
              <option value=''>{t.difficulty}</option>
              <option value='Easy'>{t.easy}</option>
              <option value='Medium'>{t.medium}</option>
              <option value='Hard'>{t.hard}</option>
            </select>
            <select name='cooking-time' className='cooking-select' value={selectedCookingTime} onChange={(e) => setSelectedCookingTime(e.target.value)} >
              <option value=''>{t.cookingTime}</option>
              <option value='1-20'>{t.time1}</option>
              <option value='20-40'>{t.time2}</option>
              <option value='40-60'>{t.time3}</option>
              <option value='60+'>{t.time4}</option>
            </select>
          </div>
        </div>
        <div className='recipes-container'>
          {recipes.length === 0 && !loading && !error && (
            <p className='no-results'>{t.noResults}</p>
          )}
          {recipes.length > 0 &&
            recipes.map((recipe) => {
              const isFavorite = favorites.some(fav => fav.id === recipe.id)

              const toggleFavorite = () => {
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

              return (
                <RecipeCard key={recipe.id} recipe={recipe} toggleFavorite={toggleFavorite} isFavorite={isFavorite} from={location.pathname} />
              )
            })}
        </div>
      </div>
    </>
  )
}
