import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { InventoryItem } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'inventory.json');

function readData(): InventoryItem[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  const content = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}

function writeData(items: InventoryItem[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

function deleteImageFile(imageName: string) {
  if (!imageName) return;
  const imagePath = path.join(process.cwd(), 'public', 'uploads', imageName);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const items = readData();
    const item = items.find((i) => i.id === id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const items = readData();
    const index = items.findIndex((i) => i.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const oldItem = items[index];

    // If image changed, delete the old image file
    if (body.imageName && body.imageName !== oldItem.imageName) {
      deleteImageFile(oldItem.imageName);
    }

    items[index] = {
      ...oldItem,
      title: body.title?.trim() ?? oldItem.title,
      description: body.description?.trim() ?? oldItem.description,
      imageName: body.imageName ?? oldItem.imageName,
      updatedAt: new Date().toISOString(),
    };

    writeData(items);
    return NextResponse.json(items[index]);
  } catch {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const items = readData();
    const index = items.findIndex((i) => i.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const item = items[index];
    deleteImageFile(item.imageName);

    items.splice(index, 1);
    writeData(items);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
