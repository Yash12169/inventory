'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { InventoryItem } from '@/types';

interface ItemFormProps {
  mode: 'add' | 'edit';
  existingItem?: InventoryItem;
}

interface Toast {
  type: 'success' | 'error';
  message: string;
}

export default function ItemForm({ mode, existingItem }: ItemFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(existingItem?.title ?? '');
  const [description, setDescription] = useState(existingItem?.description ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    existingItem?.imageName ? `/uploads/${existingItem.imageName}` : ''
  );
  const [existingImageName, setExistingImageName] = useState<string>(
    existingItem?.imageName ?? ''
  );
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('error', 'Invalid file type. Please use JPEG, PNG, GIF, or WEBP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('error', 'File too large. Maximum size is 10MB.');
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFileChange(file);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFileChange(file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const removeImage = () => {
    setImageFile(null);
    setPreviewUrl('');
    setExistingImageName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (file: File): Promise<string> => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    setUploadingImage(false);

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload image');
    }

    const data = await res.json();
    return data.filename as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('error', 'Title is required.');
      return;
    }

    const hasImage = imageFile || existingImageName;
    if (!hasImage) {
      showToast('error', 'Please select an image for the item.');
      return;
    }

    setSubmitting(true);

    try {
      let imageName = existingImageName;

      // Upload new image if selected
      if (imageFile) {
        imageName = await uploadImage(imageFile);
      }

      const payload = { title: title.trim(), description: description.trim(), imageName };

      let res: Response;
      if (mode === 'add') {
        res = await fetch('/api/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/items/${existingItem!.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save item');
      }

      showToast('success', mode === 'add' ? 'Item added successfully!' : 'Item updated!');
      setTimeout(() => router.push('/'), 800);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = uploadingImage || submitting;

  return (
    <>
      <form className="form-card" onSubmit={handleSubmit} id="item-form">
        {/* Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="item-title">
            Title <span className="required">*</span>
          </label>
          <input
            id="item-title"
            type="text"
            className="form-input"
            placeholder="e.g. Sony WH-1000XM5 Headphones"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            disabled={isLoading}
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="item-description">
            Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            id="item-description"
            className="form-input"
            placeholder="Add notes, details, or anything else about this item…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={isLoading}
          />
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label className="form-label">
            Image <span className="required">*</span>
          </label>

          {previewUrl ? (
            <div className="image-preview-wrapper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Preview" className="image-preview" id="image-preview" />
              <div className="image-preview-label">
                📷 {imageFile ? imageFile.name : 'Current image'}
              </div>
              {!isLoading && (
                <button
                  type="button"
                  className="image-preview-remove"
                  onClick={removeImage}
                  id="remove-image-btn"
                  title="Remove image"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <div
              className={`image-upload-area ${dragOver ? 'drag-over' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              id="image-upload-area"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleInputChange}
                id="image-file-input"
                disabled={isLoading}
              />
              <div className="image-upload-icon">🖼️</div>
              <div className="image-upload-text">
                Click or drag & drop an image here
              </div>
              <div className="image-upload-hint">
                JPEG, PNG, GIF, WEBP · Max 10MB
              </div>
            </div>
          )}

          {uploadingImage && (
            <div className="upload-progress">
              <span className="spinner" />
              Uploading image…
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push('/')}
            disabled={isLoading}
            id="cancel-form-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            id="submit-form-btn"
            style={{ flex: 1 }}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                {uploadingImage ? 'Uploading…' : mode === 'add' ? 'Adding…' : 'Saving…'}
              </>
            ) : (
              mode === 'add' ? '+ Add Item' : '💾 Save Changes'
            )}
          </button>
        </div>
      </form>

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`} id="form-toast">
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </>
  );
}
