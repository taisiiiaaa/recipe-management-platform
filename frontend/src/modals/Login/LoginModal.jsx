import { useState, useEffect } from 'react'
import useTranslation from '../../hooks/useTranslation'
import './LoginModal.css'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '../../store/authSlice'

const MODAL_STYLES = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'var(--color-bg)',
  padding: '32px 38px 56px 38px',
  zIndex: 1000
};

const OVERLAY_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'var(--color-overlay)',
  zIndex: 1000
};

export default function LoginModal({ onClose, openSignupModal }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const { isAuthenticated, error, loading } = useSelector((state) => state.auth);

  const t = useTranslation();

  useEffect(() => {
    if (isAuthenticated) {
      onClose();
    }
  }, [isAuthenticated, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser({ identifier, password }));
  };

  return (
    <>
      <div style={OVERLAY_STYLES} />
      <div className='login-modal' style={MODAL_STYLES}>
        <p id='cross-button' onClick={onClose}></p>
        <div className='headings'>
          <h4>{t.hello}</h4>
          <p>{t.loginTo}</p>
        </div>
        <form className='login' onSubmit={handleSubmit}>
          <input type='text' placeholder={t.loginEmailUsername} value={identifier} onChange={e => setIdentifier(e.target.value)} required />
          <input type='password' placeholder={t.loginPassword} value={password} onChange={e => setPassword(e.target.value)} required />
          <button type='submit'>{t.loginButton}</button>
        </form>
        <p>{t.dontHaveAccount} <a id='signup' onClick={openSignupModal}>{t.signup}</a></p>
      </div>
    </>
  )
}
