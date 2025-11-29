import * as FileSystem from 'expo-file-system';
import type { Paper, UserInterest, ChatSession, PaperNote } from '../types';

const DATA_DIR = `${FileSystem.documentDirectory}paperpocket/`;
const PAPERS_FILE = `${DATA_DIR}papers.json`;
const LIBRARY_FILE = `${DATA_DIR}library.json`;
const INTERESTS_FILE = `${DATA_DIR}interests.json`;
const CHAT_SESSIONS_FILE = `${DATA_DIR}chat_sessions.json`;
const NOTES_FILE = `${DATA_DIR}notes.json`;
const EMBEDDINGS_FILE = `${DATA_DIR}embeddings.json`;

interface EmbeddingData {
  paperId: string;
  embedding: number[];
  updatedAt: string;
}

/**
 * Ensure data directory exists
 */
async function ensureDataDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(DATA_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DATA_DIR, { intermediates: true });
  }
}

/**
 * Read JSON file
 */
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      return defaultValue;
    }
    const content = await FileSystem.readAsStringAsync(filePath);
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

/**
 * Write JSON file
 */
async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  try {
    await ensureDataDir();
    await FileSystem.writeAsStringAsync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    throw error;
  }
}

// ==================== Papers ====================

/**
 * Save fetched papers (cache)
 */
export async function savePapersCache(papers: Paper[]): Promise<void> {
  await writeJsonFile(PAPERS_FILE, {
    papers,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Get cached papers
 */
export async function getPapersCache(): Promise<{ papers: Paper[]; updatedAt: string } | null> {
  const data = await readJsonFile<{ papers: Paper[]; updatedAt: string } | null>(
    PAPERS_FILE,
    null
  );
  return data;
}

// ==================== Library ====================

/**
 * Get saved library papers
 */
export async function getLibraryPapers(): Promise<Paper[]> {
  return readJsonFile<Paper[]>(LIBRARY_FILE, []);
}

/**
 * Save library papers
 */
export async function saveLibraryPapers(papers: Paper[]): Promise<void> {
  await writeJsonFile(LIBRARY_FILE, papers);
}

/**
 * Add paper to library
 */
export async function addPaperToLibrary(paper: Paper): Promise<void> {
  const library = await getLibraryPapers();
  if (!library.some((p) => p.id === paper.id)) {
    library.unshift(paper);
    await saveLibraryPapers(library);
  }
}

/**
 * Remove paper from library
 */
export async function removePaperFromLibrary(paperId: string): Promise<void> {
  const library = await getLibraryPapers();
  const filtered = library.filter((p) => p.id !== paperId);
  await saveLibraryPapers(filtered);
}

// ==================== Interests ====================

/**
 * Get user interests
 */
export async function getInterests(): Promise<UserInterest[]> {
  return readJsonFile<UserInterest[]>(INTERESTS_FILE, []);
}

/**
 * Save user interests
 */
export async function saveInterests(interests: UserInterest[]): Promise<void> {
  await writeJsonFile(INTERESTS_FILE, interests);
}

// ==================== Chat Sessions ====================

/**
 * Get all chat sessions
 */
export async function getChatSessions(): Promise<Record<string, ChatSession>> {
  return readJsonFile<Record<string, ChatSession>>(CHAT_SESSIONS_FILE, {});
}

/**
 * Save chat sessions
 */
export async function saveChatSessions(
  sessions: Record<string, ChatSession>
): Promise<void> {
  await writeJsonFile(CHAT_SESSIONS_FILE, sessions);
}

/**
 * Get chat session for a paper
 */
export async function getChatSession(paperId: string): Promise<ChatSession | null> {
  const sessions = await getChatSessions();
  return sessions[paperId] || null;
}

/**
 * Save chat session for a paper
 */
export async function saveChatSession(
  paperId: string,
  session: ChatSession
): Promise<void> {
  const sessions = await getChatSessions();
  sessions[paperId] = session;
  await saveChatSessions(sessions);
}

// ==================== Notes ====================

/**
 * Get all notes
 */
export async function getAllNotes(): Promise<Record<string, PaperNote[]>> {
  return readJsonFile<Record<string, PaperNote[]>>(NOTES_FILE, {});
}

/**
 * Save all notes
 */
export async function saveAllNotes(notes: Record<string, PaperNote[]>): Promise<void> {
  await writeJsonFile(NOTES_FILE, notes);
}

/**
 * Get notes for a paper
 */
export async function getNotesForPaper(paperId: string): Promise<PaperNote[]> {
  const allNotes = await getAllNotes();
  return allNotes[paperId] || [];
}

/**
 * Add note for a paper
 */
export async function addNote(paperId: string, note: PaperNote): Promise<void> {
  const allNotes = await getAllNotes();
  if (!allNotes[paperId]) {
    allNotes[paperId] = [];
  }
  allNotes[paperId].push(note);
  await saveAllNotes(allNotes);
}

// ==================== Embeddings ====================

/**
 * Get stored embeddings
 */
export async function getEmbeddings(): Promise<Record<string, EmbeddingData>> {
  return readJsonFile<Record<string, EmbeddingData>>(EMBEDDINGS_FILE, {});
}

/**
 * Save embeddings
 */
export async function saveEmbeddings(
  embeddings: Record<string, EmbeddingData>
): Promise<void> {
  await writeJsonFile(EMBEDDINGS_FILE, embeddings);
}

/**
 * Store embedding for a paper
 */
export async function storePaperEmbedding(
  paperId: string,
  embedding: number[]
): Promise<void> {
  const embeddings = await getEmbeddings();
  embeddings[paperId] = {
    paperId,
    embedding,
    updatedAt: new Date().toISOString(),
  };
  await saveEmbeddings(embeddings);
}

/**
 * Get embedding for a paper
 */
export async function getPaperEmbedding(paperId: string): Promise<number[] | null> {
  const embeddings = await getEmbeddings();
  return embeddings[paperId]?.embedding || null;
}

/**
 * Clear all data (for debugging/reset)
 */
export async function clearAllData(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(DATA_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(DATA_DIR, { idempotent: true });
    }
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}

