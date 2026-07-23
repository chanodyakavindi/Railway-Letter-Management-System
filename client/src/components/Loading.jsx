import { useLanguage } from '../context/LanguageContext';

export default function Loading({ fullPage, text }) {
  const { t } = useLanguage();
  const label = text || t('Loading...', 'පූරණය වෙමින්...');
  return (
    <div className={fullPage ? 'loading-fullpage' : 'loading-inline'}>
      <div className="loading-spinner" />
      <span>{label}</span>
    </div>
  );
}
