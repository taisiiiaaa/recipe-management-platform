import { useState } from 'react'
import useTranslation from '../../hooks/useTranslation'
import './SignupModal.css'
import { useDispatch } from 'react-redux'
import { signupUser } from '../../store/authSlice'

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

export default function SignupModal({ onClose, openLoginModal }) {
  const t = useTranslation();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    dispatch(signupUser({ username, email, password, confirmPassword }))
      .unwrap()
      .then(() => {
        onClose(); 
      })
      .catch((error) => {
        alert(error.message || 'Signup failed');
      });
  };

  return (
    <>
      <div style={OVERLAY_STYLES} />
      <div className='signup-modal' style={MODAL_STYLES}>
        <p id='cross-button' onClick={onClose}></p>
        <div className='headings'>
          <h4>{t.hello}</h4>
          <p>{t.createAccount}</p>
        </div>
        <form className='signup' onSubmit={handleSubmit}>
          <input type='text' placeholder={t.signupUsername} value={username} onChange={e => setUsername(e.target.value)} required />
          <input type='email' placeholder={t.signupEmail} value={email} onChange={e => setEmail(e.target.value)} required />
          <input type='password' placeholder={t.signupPassword} value={password} onChange={e => setPassword(e.target.value)} required />
          <input type='password' placeholder={t.signupConfirm} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          <button type='submit'>{t.signupButton}</button>
        </form>
        <p>{t.alreadyHave} <a id='login' onClick={openLoginModal}>{t.login}</a></p>
      </div>
    </>
  )
}
