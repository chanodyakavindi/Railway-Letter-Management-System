export default function Loading({ fullPage, text = 'Loading...' }) {
  return (
    <div className={fullPage ? 'loading-fullpage' : 'loading-inline'}>
      <div className="loading-spinner" />
      <span>{text}</span>
    </div>
  );
}
