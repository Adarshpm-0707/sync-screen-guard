import React from 'react';
import AdminModal from './AdminModal';
import AdminButton from './AdminButton';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false,
  variant = 'danger',
}) {
  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-6">
        <p className="text-xs text-slate-400 font-medium leading-relaxed">
          {message}
        </p>
        
        <div className="flex items-center justify-end space-x-3">
          <AdminButton variant="secondary" onClick={onClose} disabled={isConfirming}>
            {cancelText}
          </AdminButton>
          <AdminButton variant={variant} onClick={onConfirm} isLoading={isConfirming}>
            {confirmText}
          </AdminButton>
        </div>
      </div>
    </AdminModal>
  );
}
