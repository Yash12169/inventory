import Navbar from '@/components/Navbar';
import ItemForm from '@/components/ItemForm';

export default function AddPage() {
  return (
    <>
      <Navbar />
      <main className="page">
        <div className="page-header">
          <h1 className="page-title">Add New Item</h1>
          <p className="page-subtitle">
            Upload an image and add details to track a new item in your inventory.
          </p>
        </div>
        <ItemForm mode="add" />
      </main>
    </>
  );
}
