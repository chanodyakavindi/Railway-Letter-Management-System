export default function Modal({ open, onClose, title, subtitle, children, footer, wide }) {
  if (!open) return null;
  return (
    <div className="modal-overlay active" onClick={onClose}>
      <div
        className={`modal-dialog ${wide ? 'modal-wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-header-titles">
            <h3>{title}</h3>
            {subtitle && <span className="modal-subtitle">{subtitle}</span>}
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>X</button>
        </div>
        <div className="modal-body scrollable">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
