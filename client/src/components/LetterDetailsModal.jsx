import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { formatDate, formatDateTime, downloadWithAuth } from '../utils/helpers';
import { lettersApi } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function LetterDetailsModal({ letter, open, onClose, onReply }) {
  const { pick, t } = useLanguage();
  if (!letter) return null;

  const downloadPdf = async () => {
    if (!letter.pdfAttachment?.filename) return;
    try {
      await downloadWithAuth(
        lettersApi.downloadUrl(letter._id, 'main'),
        letter.pdfAttachment.originalName || 'letter.pdf'
      );
    } catch {
      /* toast handled by caller if needed */
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={pick('Correspondence Details / ලිපි විස්තර')}
      subtitle={letter.letterId}
      wide
      footer={<button type="button" className="btn btn-secondary" onClick={onClose}>{pick('Close / වසන්න')}</button>}
    >
      <div className="modal-bilingual-split-grid">
        <div className="meta-field">
          <span className="meta-label">{pick('Date Received / ලිපි භාරගත් දිනය')}</span>
          <div className="meta-val">{formatDate(letter.dateReceived)}</div>
        </div>
        <div className="meta-field">
          <span className="meta-label">{pick('Referring Organization / ආයතනය')}</span>
          <div className="meta-val">{letter.referredEntity || '-'}</div>
        </div>
        <div className="meta-field">
          <span className="meta-label">{pick('Letter Number / ලිපි අංකය')}</span>
          <div className="meta-val">{letter.letterNumber || '-'}</div>
        </div>
        <div className="meta-field">
          <span className="meta-label">{pick('File Number / ගොනු අංකය')}</span>
          <div className="meta-val">{letter.fileNumber || '-'}</div>
        </div>
        <div className="meta-field field-span-full">
          <span className="meta-label">{pick('Subject / මාතෘකාව')}</span>
          <div className="meta-val highlight-box">{letter.title}</div>
        </div>
        <div className="meta-field field-span-full">
          <span className="meta-label">{pick('Action Taken / ක්‍රියාමාර්ග')}</span>
          <div className="meta-val">{letter.actionTaken || '-'}</div>
        </div>
        <div className="meta-field">
          <span className="meta-label">{pick('Status / තත්වය')}</span>
          <div className="meta-val"><StatusBadge status={letter.status} reminderStatus={letter.reminderStatus} /></div>
        </div>
        <div className="meta-field">
          <span className="meta-label">{pick('Reminder / මතක් කිරීම')}</span>
          <div className="meta-val">{formatDate(letter.reminderDate)}</div>
        </div>
        <div className="meta-field">
          <span className="meta-label">{pick('Send To / ඉදිරිපත් කළේ')}</span>
          <div className="pills-list-inline">
            {(letter.sendTo || []).map((s) => <span key={s} className="inline-badge">{s}</span>)}
          </div>
        </div>
        <div className="meta-field">
          <span className="meta-label">{pick('Copies / පිටපත්')}</span>
          <div className="pills-list-inline">
            {(letter.sendCopiesTo || []).map((s) => <span key={s} className="inline-badge">{s}</span>)}
          </div>
        </div>
        {letter.customRecipientName && (
          <div className="meta-field field-span-full">
            <span className="meta-label">{pick('Other Recipient / වෙනත්')}</span>
            <div className="meta-val">{letter.customRecipientName}</div>
          </div>
        )}
        {letter.pdfAttachment?.originalName && (
          <div className="meta-field field-span-full">
            <span className="meta-label">{t('PDF Attachment', 'PDF අමුණුම')}</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={downloadPdf}>
              {t('Download', 'බාගත කරන්න')} {letter.pdfAttachment.originalName}
            </button>
          </div>
        )}
      </div>

      {letter.replies?.length > 0 && (
        <div className="replies-section">
          <h4>{pick('Replies / පිළිතුරු')}</h4>
          <div className="replies-timeline">
            {letter.replies.map((r) => (
              <div key={r._id} className="reply-item">
                <strong>{r.user?.fullName || t('User', 'පරිශීලක')}</strong>
                <span className="reply-date">{formatDateTime(r.createdAt)}</span>
                <p>{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {onReply && (
        <div className="modal-footer-inline">
          <button type="button" className="btn btn-primary" onClick={() => onReply(letter)}>{pick('Reply / පිළිතුර')}</button>
        </div>
      )}
    </Modal>
  );
}
