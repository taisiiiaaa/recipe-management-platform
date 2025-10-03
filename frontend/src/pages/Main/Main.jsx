import { NavLink } from 'react-router'
import useTranslation from '../../hooks/useTranslation'
import './Main.css'
import { useDispatch, useSelector } from 'react-redux'
import { openLoginModal, openSignupModal, closeLoginModal } from '../../store/uiSlice'
import LoginModal from '../../modals/Login/LoginModal'

export default function Main() {
  const t = useTranslation();
  const dispatch = useDispatch();

  const { isAuthenticated } = useSelector(state => state.auth);
  const { showLoginModal } = useSelector(state => state.ui);

  return (
    <>
      <div className='main-page'>
        <h1>{t.welcome}</h1>
        <div className='image-button'>
          <NavLink to="/all-recipes" id='browse-recipes'>{t.browseRecipes}</NavLink>
          <img src='src/assets/mainpage_photo.png' alt='Main Page Recipe photo' width='734px' height='412px'></img>
        </div>

        <p className='main-text'>{t.digitalCookbook}</p>
        <p className='main-text text'>{t.perfectPlace}</p>

        {!isAuthenticated &&
          <button type='button' id='getting-started' onClick={() => dispatch(openLoginModal())}>{t.gettingStarted}</button>
        }
      </div>

      {showLoginModal && <LoginModal onClose={() => dispatch(closeLoginModal())} openSignupModal={() => dispatch(openSignupModal())} />}
    </>
  )
}
