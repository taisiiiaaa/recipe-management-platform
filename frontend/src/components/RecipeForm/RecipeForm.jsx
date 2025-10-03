import { useEffect, useState } from 'react'
import './RecipeForm.css'
import axios from '../../store/axiosInstance'
import { useNavigate } from 'react-router'
import useTranslation from '../../hooks/useTranslation'
import { toast } from 'react-toastify'
import categoryTranslations from '../../i18n/categoryTranslations'
import { useSelector } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

export default function RecipeForm({ mode, initialData = null, onSubmitSuccess }) {
  const [ingredientName, setIngredientName] = useState('');
  const [ingredientQty, setIngredientQty] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [file, setFile] = useState('');

  const t = useTranslation();
  const selectedLang = useSelector((state) => state.ui.language);

  const authData = JSON.parse(localStorage.getItem('auth'));
  const token = authData?.token;

  const initialValues = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    categoryId: initialData?.category?.id.toString() || '',
    difficulty: initialData?.difficulty || '',
    cooking_time: initialData?.cooking_time || '',
    is_public: (initialData?.is_public ?? true).toString(),
    ingredients: initialData?.recipeIngredients?.map(i => ({
      name: i.ingredient?.name || '',
      quantity: i.quantity || '',
    })) || [],
    instructions: initialData?.instructions || '',
    image: null,
    ingredientName: '',
    ingredientQty: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required(t.required),
    description: Yup.string().required(t.required),
    categoryId: Yup.string().required(t.required),
    difficulty: Yup.string().required(t.required),
    cooking_time: Yup.number().required(t.required),
    instructions: Yup.string().required(t.required),
    ingredients: Yup.array().min(1, t.ingredientListRequired),
  });

  useEffect(() => {
    axios.get('/categories').then(res => {
      setCategories(res.data);
    });
  }, []);

  const handleFileInput = e => {
    const file = e.target.files[0];
    if (file) {
      setFile(file.name);
      setForm(prev => ({ ...prev, image: file }));
    } else {
      setFile('');
      setForm(prev => ({ ...prev, image: null }));
    }
  }

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('description', values.description);
    formData.append('categoryId', parseInt(values.categoryId));
    formData.append('difficulty', values.difficulty);
    formData.append('cooking_time', values.cooking_time);
    formData.append('is_public', values.is_public === 'true');
    formData.append('instructions', values.instructions);
    formData.append('ingredients', JSON.stringify(values.ingredients));

    if (values.image instanceof File) {
      formData.append('image', values.image);
    }

    try {
      if (mode === 'create') {
        await axios.post('/recipes', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(t.created);
      } else {
        await axios.put(`/recipes/${initialData.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success(t.edited);
      }
      onSubmitSuccess?.();
      navigate('/my-recipes');
    } catch (err) {
      console.error(err.response?.data || err);
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form className='recipe-form'>
          <div className={`field name ${values.name ? '' : 'error'}`}>
            <label htmlFor='name'>{t.name}</label>
            <Field name='name' placeholder={t.namePlaceholder} />
            <ErrorMessage name='name' component='span' className='error-message' />
          </div>
          <div className='field photo'>
            <label>{t.photo}</label>
            <label htmlFor='file-upload' className='custom-file-upload'>{file ? `${file}` : t.photoPlaceholder}</label>
            <input 
              type='file' 
              id='file-upload' 
              placeholder={t.photoPlaceholder} 
              onChange={(e) => {                
                const file = e.target.files[0];
                setFile(file?.name || '');
                setFieldValue('image', file || null);              
                handleFileInput(e)
              }}/>
          </div>
          <div className='field description'>
            <label htmlFor='description'>{t.description}</label>
            <Field as='textarea' name='description' placeholder={t.descrPlaceholder} />
            <ErrorMessage name='description' component='span' className='error-message' />
          </div>
          <div className='field category'>
            <label htmlFor='categoryId'>{t.category}</label>
            <Field as='select' name='categoryId' className={values.categoryId === '' ? 'placeholder' : 'selected'}>
              <option value=''>{t.categoryDefaultValue}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {selectedLang === 'UA' ? categoryTranslations[cat.name] : cat.name}
                </option>
              ))}
            </Field>
            <ErrorMessage name='categoryId' component='span' className='error-message' />
          </div>
          <div className='field difficulty'>
            <label>{t.difficultyLevel}</label>
            <div className='options'>
              {['Easy', 'Medium', 'Hard'].map(level => (
                <label key={level}>
                  <Field type='radio' name='difficulty' value={level} />
                  <span>{t[level.toLowerCase()]}</span>
                </label>
              ))}
            </div>
            <ErrorMessage name='difficulty' component='span' className='error-message' />
          </div>
          <div className='field time'>
            <label htmlFor='cooking_time'>{t.cookingTime} ({t.inMin})</label>
            <Field type='number' name='cooking_time' min='1' placeholder={t.cookingTimePlaceholder} />
            <ErrorMessage name='cooking_time' component='span' className='error-message' />
          </div>
          <div className='field status'>
            <label>{t.recipeVisibility}</label>
            <div className='options'>
              <label>
                <Field type='radio' name='is_public' value='true' />
                <span>{t.public}</span>
              </label>
              <label>
                <Field type='radio' name='is_public' value='false' />
                <span>{t.private}</span>
              </label>
            </div>
          </div>
          <div className='field ingredient-list'>
            <p>{t.ingredientList}</p>
            <div className='field ingredients'>
              <div className='ingr-name'>
                <label>{t.ingredientName}</label>
                <input
                  type='text'
                  placeholder={t.ingredientNamePlaceholder}
                  value={values.ingredientName}
                  onChange={e => setFieldValue('ingredientName', e.target.value)}
                />
              </div>
              <div className='ingr-q'>
                <label>{t.quantity}</label>
                <input
                  type='text'
                  placeholder={t.quantityPlaceholder}
                  value={values.ingredientQty}
                  onChange={e => setFieldValue('ingredientQty', e.target.value)}
                />
              </div>
              <button
                type='button'
                onClick={() => {
                  if (!values.ingredientName.trim()) return;
                  setFieldValue('ingredients', [...values.ingredients, {
                    name: values.ingredientName,
                    quantity: values.ingredientQty
                  }]);
                  setFieldValue('ingredientName', '');
                  setFieldValue('ingredientQty', '');
                }}
              >
                {t.add}
              </button>
            </div>
            <ErrorMessage name='ingredients' component='span' className='error-message' />
            <ul>
              {values.ingredients.map((ing, i) => (
                <li key={i}>
                  <span>{ing.name} ({ing.quantity})</span>
                  <button type='button' onClick={() => {
                    const updated = [...values.ingredients];
                    updated.splice(i, 1);
                    setFieldValue('ingredients', updated);
                  }} />
                </li>
              ))}
            </ul>
          </div>
          <div className='field instructions'>
            <label htmlFor='instructions'>{t.cookingInstructions}</label>
            <Field as='textarea' name='instructions' placeholder={t.cookingInstructionsPlaceholder} />
            <ErrorMessage name='instructions' component='span' className='error-message' />
          </div>
          <button type='submit' id='post'>{mode === 'edit' ? t.saveChanges : t.createPost}</button>
        </Form>
      )}
    </Formik>
  )
}

