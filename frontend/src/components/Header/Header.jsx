import { NavLink } from 'react-router'
import './Header.css'
import { useEffect } from 'react'
import useTranslation from '../../hooks/useTranslation'
import { useDispatch, useSelector } from 'react-redux'
import { switchLanguage } from '../../store/uiSlice'
import LoginModal from '../../modals/Login/LoginModal'
import SignupModal from '../../modals/Signup/SignupModal'
import { setAuthFromStorage } from '../../store/authSlice'
import { openLoginModal, openSignupModal, closeLoginModal, closeSignupModal } from '../../store/uiSlice'
import { logoutUser } from '../../store/authSlice'

export default function Header() {
  const { showLoginModal, showSignupModal } = useSelector(state => state.ui)

  const selectedLang = useSelector((state) => state.ui.language)
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const t = useTranslation()

  const handleLanguageChange = (event) => {
    dispatch(switchLanguage(event.target.value))
  }

  const handleLogout = () => {
    dispatch(logoutUser())
  }

  useEffect(() => {
    const authData = localStorage.getItem('auth')
    if (authData) {
      const parsed = JSON.parse(authData)
      console.log('Loaded from localStorage:', parsed)
      dispatch(setAuthFromStorage(parsed))
    }
  }, [dispatch])

  return (
    <>
      <div className='header'>
        <nav>
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'active-link' : ''}>{t.home}</NavLink>
            </li>
            <li>
              <NavLink to="/all-recipes" className={({ isActive }) => isActive ? 'active-link' : ''}>{t.allRecipes}</NavLink>
            </li>
            <li>
              <NavLink to="/my-recipes" className={({ isActive }) => isActive ? 'active-link' : ''}>{t.myRecipes}</NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => isActive ? 'active-link' : ''}>{t.about}</NavLink>
            </li>
          </ul>
        </nav>
        <p className='logo'></p>
        <ul>
          <li>
            <select name='language' value={selectedLang} onChange={handleLanguageChange}>
              <option value='EN'>EN</option>
              <option value='UA'>UA</option>
            </select>
          </li>
          <li>
            {isAuthenticated && user ? (
              <p id='username'>@{user.username}</p>
            ) :
              (
                <a onClick={() => dispatch(openLoginModal())}>{t.login}</a>
              )
            }
          </li>
          <li>
            {isAuthenticated ? (
              <a id='logout' onClick={handleLogout}>{t.logout}</a>
            ) :
              (
                <a id='button-signup' onClick={() => dispatch(openSignupModal())}>{t.signup}</a>
              )
            }
          </li>
        </ul>
      </div>


      {showLoginModal && <LoginModal onClose={() => dispatch(closeLoginModal())} openSignupModal={() => dispatch(openSignupModal())} />}
      {showSignupModal && <SignupModal onClose={() => dispatch(closeSignupModal())} openLoginModal={() => dispatch(openLoginModal())} />}
    </>
  )
}
