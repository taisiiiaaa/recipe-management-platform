import { useSelector } from 'react-redux'
import translations from '../i18n/translations'

export default function useTranslation() {
  const lang = useSelector((state) => state.ui.language);
  const t = translations[lang] || translations.EN;

  return t;
}
