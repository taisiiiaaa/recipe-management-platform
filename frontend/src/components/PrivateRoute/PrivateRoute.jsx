import { useSelector } from 'react-redux'
import useTranslation from '../../hooks/useTranslation'
import './PrivateRoute.css'

export default function PrivateRoute({ children }) {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const t = useTranslation();

  if (!isAuthenticated) {
    return (
      <div className='private-route'>
        <p id='lock-icon' />
        <h2>{t.accessDenied}</h2>
        <p>{t.youMust}</p>
      </div>
    );
  }

  return children;
}
