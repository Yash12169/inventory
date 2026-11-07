'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ItemForm from '@/components/ItemForm';
import type { InventoryItem } from '@/types';

export default function EditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/items/${id}`);
        if (res.status === 404) {
          setError('Item not found');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch item');
        const data = await res.json();
        setItem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchItem();
  }, [id]);

  return (
    <>
      <Navbar />
      <main className="page">
        <div className="page-header">
          <h1 className="page-title">Edit Item</h1>
          <p className="page-subtitle">Update the details or image for this inventory item.</p>
        </div>

        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '80px 24px',
              color: 'var(--text-secondary)',
            }}
          >
            <span className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
            Loading item…
          </div>
        )}

        {error && (
          <div className="form-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ marginBottom: '8px' }}>{error}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
              The item could not be loaded.
            </p>
            <button className="btn btn-secondary" onClick={() => router.push('/')}>
              Back to Inventory
            </button>
          </div>
        )}

        {!loading && !error && item && (
          <ItemForm mode="edit" existingItem={item} />
        )}
      </main>
    </>
  );
}
