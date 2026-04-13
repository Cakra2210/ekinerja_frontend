import { ReactNode } from "react";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  children?: ReactNode;
};

export const ConfirmationDialog = ({
  open,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  tone = "default",
  isLoading = false,
  onConfirm,
  onClose,
  children
}: ConfirmationDialogProps) => {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-card confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 id="confirmation-dialog-title">{title}</h3>
            <p>{description}</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        {children ? <div className="modal-body">{children}</div> : null}

        <div className="modal-actions">
          <button type="button" className="button-secondary" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={tone === "danger" ? "button-danger" : "button-primary"}
            onClick={() => void onConfirm()}
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
