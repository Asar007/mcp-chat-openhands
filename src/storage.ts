import { mkdir, writeFile, readFile, readdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

export interface Diagram {
  id: string;
  type: 'image' | 'mindmap' | 'drawio';
  content: string; // URL for image, JSON for mindmap, XML for drawio
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface Whiteboard {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  diagrams: Diagram[];
}

function getWhiteboardPath(id: string): string {
  return join(DATA_DIR, `${id}.json`);
}

export async function createWhiteboard(name: string): Promise<Whiteboard> {
  await ensureDataDir();
  
  const id = `wb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  
  const whiteboard: Whiteboard = {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    diagrams: []
  };
  
  await writeFile(getWhiteboardPath(id), JSON.stringify(whiteboard, null, 2));
  return whiteboard;
}

export async function getWhiteboard(id: string): Promise<Whiteboard | null> {
  await ensureDataDir();
  
  const path = getWhiteboardPath(id);
  if (!existsSync(path)) {
    return null;
  }
  
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content);
}

export async function listWhiteboards(): Promise<Array<{
  id: string;
  name: string;
  createdAt: string;
  diagramCount: number;
}>> {
  await ensureDataDir();
  
  const files = await readdir(DATA_DIR);
  const whiteboards: Array<{
    id: string;
    name: string;
    createdAt: string;
    diagramCount: number;
  }> = [];
  
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    
    try {
      const content = await readFile(join(DATA_DIR, file), 'utf-8');
      const wb = JSON.parse(content) as Whiteboard;
      whiteboards.push({
        id: wb.id,
        name: wb.name,
        createdAt: wb.createdAt,
        diagramCount: wb.diagrams.length
      });
    } catch {
      // Skip invalid files
    }
  }
  
  return whiteboards.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function addDiagram(
  whiteboardId: string,
  diagram: Omit<Diagram, 'id'>
): Promise<Diagram | null> {
  const whiteboard = await getWhiteboard(whiteboardId);
  if (!whiteboard) return null;
  
  const newDiagram: Diagram = {
    ...diagram,
    id: `diag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  };
  
  whiteboard.diagrams.push(newDiagram);
  whiteboard.updatedAt = new Date().toISOString();
  
  await writeFile(
    getWhiteboardPath(whiteboardId),
    JSON.stringify(whiteboard, null, 2)
  );
  
  return newDiagram;
}

export async function updateDiagramPosition(
  whiteboardId: string,
  diagramId: string,
  x: number,
  y: number,
  width?: number,
  height?: number
): Promise<Diagram | null> {
  const whiteboard = await getWhiteboard(whiteboardId);
  if (!whiteboard) return null;
  
  const diagram = whiteboard.diagrams.find(d => d.id === diagramId);
  if (!diagram) return null;
  
  diagram.x = x;
  diagram.y = y;
  if (width !== undefined) diagram.width = width;
  if (height !== undefined) diagram.height = height;
  
  whiteboard.updatedAt = new Date().toISOString();
  
  await writeFile(
    getWhiteboardPath(whiteboardId),
    JSON.stringify(whiteboard, null, 2)
  );
  
  return diagram;
}

export async function deleteWhiteboard(id: string): Promise<boolean> {
  const path = getWhiteboardPath(id);
  if (!existsSync(path)) return false;
  
  await unlink(path);
  return true;
}