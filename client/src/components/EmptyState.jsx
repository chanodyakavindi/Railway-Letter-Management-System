export default function EmptyState({ title, message }) {
  return (
    <div className="table-empty-state">
      <span className="empty-icon" />
      <h4>{title}</h4>
      {message && <p>{message}</p>}
    </div>
  );
}
