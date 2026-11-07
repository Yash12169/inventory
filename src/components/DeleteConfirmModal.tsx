'use client';

interface DeleteConfirmModalProps {
  itemTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  itemTitle,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmModalProps) {
  return (
    <div className="modal-backdrop" onClick={onCancel} id="delete-modal-backdrop">
      <div className="modal" onClick={(e) => e.stopPropagation()} id="delete-modal">
        <span className="modal-icon">🗑️</span>
        <h2 className="modal-title">Delete Item?</h2>
        <p className="modal-text">
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text-primary)' }}>&quot;{itemTitle}&quot;</strong>?
          <br />
          This will also remove the associated image. This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
            id="cancel-delete-btn"
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
            id="confirm-delete-btn"
          >
            {isDeleting ? (
              <>
                <span className="spinner" />
                Deleting…
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
