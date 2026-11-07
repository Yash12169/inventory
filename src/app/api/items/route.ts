import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { InventoryItem } from '@/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'inventory.json');

function readData(): InventoryItem[] {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, '[]');
    return [];
  }
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

export async function GET() {
  try {
    const items = readData();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Failed to read inventory' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.imageName) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
    }

    const items = readData();

    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      title: body.title.trim(),
      description: body.description?.trim() || '',
      imageName: body.imageName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    items.push(newItem);
    writeData(items);

    return NextResponse.json(newItem, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
