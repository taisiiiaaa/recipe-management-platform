import React from 'react'
import useTranslation from '../../hooks/useTranslation';
import './Footer.css'
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../store/uiSlice';

export default function Footer() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  const t = useTranslation();

  const handleChangeTheme = () => {
    dispatch(toggleTheme());
  }

  return (
    <div className='footer-wrapper'>
      <div className='footer'>
        <div className='follow-us'>
          <p id='follow'>{t.followUs}</p>
          <ul className='social-media'>
            <li id='inst'></li>
            <li id='youtube'></li>
            <li id='tiktok'></li>
          </ul>
        </div>
        <div className='support'>
          <a href='https://www.paypal.com/donate/?hosted_button_id=DBMRH2RGH2QTS' target='blank'>
            <p id='paypal'></p>
            <p>{t.supportUkraine}</p>
          </a>
        </div>
        <button type='button' id='toggle-theme' onClick={handleChangeTheme}>{theme === 'light' ? t.changeThemeDark : t.changeThemeLight}</button>
      </div>
      <p id='copyright'>Copyright RPM '2025</p>
    </div>
  )
}
