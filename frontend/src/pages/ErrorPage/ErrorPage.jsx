import useTranslation from '../../hooks/useTranslation'
import './ErrorPage.css'

export default function ErrorPage() {
  const t = useTranslation();

  return (
    <div className='error-page'>
      <h3>404</h3>
      <h2>{t.oops}</h2>
      <p>{t.pageDoesntExist}</p>
    </div>
  );
}
