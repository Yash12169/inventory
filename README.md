# 📦 Personal Inventory Management System

A sleek, self-contained local inventory management system built with Next.js App Router, TypeScript, and modern CSS.

Runs **100% locally** — no external database, no cloud services, and zero subscription requirements.

---

## ✨ Features

- **Inventory Dashboard**: View all items in a responsive grid with image preview, title, description, and date added.
- **Add / Edit / Delete Items**: Full CRUD capabilities with real-time UI updates and confirmation modals.
- **Local Image Uploads**: Drag-and-drop or file picker; images are stored locally under `public/uploads/`.
- **File-Based Storage**: All metadata is stored locally in `data/inventory.json`.
- **Zero-Dependency One-Click Setup**: Auto-downloads a portable Node.js runtime if Node is not installed on the machine.

---

## 🚀 Quick Start

### Option 1: One-Click Setup (Zero Prerequisites)

Even if Node.js or Next.js is **not installed** on your computer, the setup script will fetch a portable runtime and launch the app:

- **macOS / Linux**:
  ```bash
  bash setup.sh
  ```
- **Windows (PowerShell)**:
  Right-click `setup.ps1` → **Run with PowerShell**, or in terminal:
  ```powershell
  .\setup.ps1
  ```

### Option 2: Standard Start (If Node.js v18+ is installed)

```bash
./start.sh
```
or manually:
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
inventory-system/
├── setup.sh             # Universal one-click setup (macOS / Linux)
├── setup.ps1            # Universal one-click setup (Windows)
├── start.sh             # Quick startup script
├── data/
│   └── inventory.json   # Local JSON storage for inventory items
├── public/
│   └── uploads/         # Uploaded item images
└── src/
    ├── app/             # Next.js App Router pages & API routes
    │   ├── api/items/   # REST endpoints for inventory CRUD
    │   ├── api/upload/  # Multipart image upload handler
    │   ├── add/         # Add item page
    │   └── edit/[id]/   # Edit item page
    ├── components/      # UI components (Navbar, ItemCard, ItemForm, Modals)
    └── types/           # TypeScript interfaces
```

---

## 🔒 Privacy & Local Storage

- Images stay on your local disk (`public/uploads/`).
- Item records are saved to `data/inventory.json`.
- No telemetry, no external database, and no internet required after setup.
