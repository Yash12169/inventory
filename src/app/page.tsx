'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ItemCard from '@/components/ItemCard';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Link from 'next/link';
import type { InventoryItem } from '@/types';

interface Toast {
  type: 'success' | 'error';
  message: string;
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Failed to fetch items');
      const data = await res.json();
      // Sort newest first
      data.sort((a: InventoryItem, b: InventoryItem) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDeleteRequest = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) setDeleteTarget(item);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/items/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      showToast('success', `"${deleteTarget.title}" deleted`);
    } catch {
      showToast('error', 'Failed to delete item. Please try again.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="page">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Your Inventory</h1>
          <p className="page-subtitle">
            {loading ? 'Loading your items…' : `Manage and track all your personal items`}
          </p>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-value" id="total-items-count">
              {loading ? '—' : items.length}
            </div>
            <div className="stat-label">Total Items</div>
          </div>
          {search && (
            <div className="stat-card">
              <div className="stat-value">{filteredItems.length}</div>
              <div className="stat-label">Search Results</div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search items by title or description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-input"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="loading-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="inventory-grid">
            <div className="error-state">
              <div className="error-state-icon">⚠️</div>
              <div className="error-state-title">Failed to load inventory</div>
              <div className="error-state-text">{error}</div>
              <button className="btn btn-secondary" onClick={fetchItems} style={{ marginTop: '16px' }}>
                Try Again
              </button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="inventory-grid">
            <div className="empty-state" id="empty-state">
              <div className="empty-state-icon">
                {search ? '🔍' : '📦'}
              </div>
              <div className="empty-state-title">
                {search ? 'No items match your search' : 'Your inventory is empty'}
              </div>
              <div className="empty-state-text">
                {search
                  ? `No results for "${search}". Try a different keyword.`
                  : 'Start building your inventory by adding your first item.'}
              </div>
              {!search && (
                <Link href="/add" className="btn btn-primary" id="empty-add-btn">
                  + Add Your First Item
                </Link>
              )}
              {search && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setSearch('')}
                  id="clear-search-btn"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="inventory-grid" id="inventory-grid">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} onDelete={handleDeleteRequest} />
            ))}
          </div>
        )}
      </main>

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          itemTitle={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleting}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`} id="home-toast">
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </>
  );
}
