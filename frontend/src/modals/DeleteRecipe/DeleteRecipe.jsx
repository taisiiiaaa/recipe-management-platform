import './DeleteRecipe.css' 
import useTranslation from '../../hooks/useTranslation'

const MODAL_STYLES = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'var(--color-bg)',
  padding: '32px',
  zIndex: 1000,
  borderRadius: '10px',
  width: '90%',
  maxWidth: '480px',
  textAlign: 'center'
};

const OVERLAY_STYLES = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  zIndex: 999
};

export default function DeleteModal({ onClose, onConfirm }) {
  const t = useTranslation();

  return (
    <>
      <div style={OVERLAY_STYLES} onClick={onClose} />
      <div style={MODAL_STYLES} className='delete-modal'>
        <p id='cross-button' onClick={onClose}></p>
        <h4>{t.confirmDelete}</h4>
        <p>{t.areYouSureDelete}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="delete-btn">{t.delete}</button>
          <button onClick={onClose} className="cancel-btn">{t.cancel}</button>
        </div>
      </div>
    </>
  );
}
