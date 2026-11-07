'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { InventoryItem } from '@/types';

interface ItemCardProps {
  item: InventoryItem;
  onDelete: (id: string) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ItemCard({ item, onDelete }: ItemCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="item-card" id={`item-card-${item.id}`}>
      {/* Image */}
      <div className="item-card-image-wrapper">
        {!imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/uploads/${item.imageName}`}
            alt={item.title}
            className="item-card-image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ fontSize: '36px' }}>🖼️</span>
            <span>Image not found</span>
          </div>
        )}
        <div className="item-card-image-overlay" />

        {/* Hover action buttons */}
        <div className="item-card-actions">
          <Link
            href={`/edit/${item.id}`}
            className="action-btn action-btn-edit"
            title="Edit item"
            id={`edit-btn-${item.id}`}
          >
            ✏️
          </Link>
          <button
            className="action-btn action-btn-delete"
            title="Delete item"
            id={`delete-btn-${item.id}`}
            onClick={() => onDelete(item.id)}
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="item-card-body">
        <h2 className="item-card-title">{item.title}</h2>
        {item.description && (
          <p className="item-card-desc">{item.description}</p>
        )}
        <div className="item-card-meta">
          <span className="item-card-date">📅 {formatDate(item.updatedAt)}</span>
        </div>
      </div>
    </article>
  );
}
