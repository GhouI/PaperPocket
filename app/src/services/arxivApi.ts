import { XMLParser } from 'fast-xml-parser';
import type { Paper } from '../types';

const ARXIV_API_BASE = 'https://export.arxiv.org/api/query';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  author: { name: string } | { name: string }[];
  published: string;
  updated: string;
  'arxiv:primary_category'?: { '@_term': string };
  category?: { '@_term': string } | { '@_term': string }[];
  link?: { '@_href': string; '@_type'?: string } | { '@_href': string; '@_type'?: string }[];
}

function parseEntry(entry: ArxivEntry): Paper {
  const idMatch = entry.id.match(/abs\/(.+)$/);
  const arxivId = idMatch ? idMatch[1] : entry.id;

  const authors = Array.isArray(entry.author)
    ? entry.author.map((a) => a.name)
    : [entry.author.name];

  const primaryCategory = entry['arxiv:primary_category']?.['@_term'] || '';

  const categories = entry.category
    ? Array.isArray(entry.category)
      ? entry.category.map((c) => c['@_term'])
      : [entry.category['@_term']]
    : [];

  const links = entry.link
    ? Array.isArray(entry.link)
      ? entry.link
      : [entry.link]
    : [];
  const pdfLink = links.find((l) => l['@_type'] === 'application/pdf')?.['@_href'] || 
                  'https://arxiv.org/pdf/' + arxivId + '.pdf';

  return {
    id: arxivId,
    title: entry.title.replace(/\s+/g, ' ').trim(),
    abstract: entry.summary.replace(/\s+/g, ' ').trim(),
    authors,
    publishedDate: entry.published,
    updatedDate: entry.updated,
    categories,
    primaryCategory,
    pdfUrl: pdfLink,
    arxivUrl: 'https://arxiv.org/abs/' + arxivId,
  };
}

export async function searchPapers(
  query: string,
  maxResults: number = 20,
  start: number = 0
): Promise<Paper[]> {
  try {
    const searchQuery = encodeURIComponent(query);
    const url = ARXIV_API_BASE + '?search_query=all:' + searchQuery + '&start=' + start + '&max_results=' + maxResults + '&sortBy=relevance&sortOrder=descending';

    const response = await fetch(url);
    const xmlText = await response.text();
    const result = parser.parse(xmlText);

    if (!result.feed?.entry) {
      return [];
    }

    const entries = Array.isArray(result.feed.entry)
      ? result.feed.entry
      : [result.feed.entry];

    return entries.map(parseEntry);
  } catch (error) {
    console.error('Error searching arXiv:', error);
    throw error;
  }
}

export async function getRecentPapers(
  categories: string[],
  maxResults: number = 50
): Promise<Paper[]> {
  try {
    const categoryQuery = categories.map((cat) => 'cat:' + cat).join('+OR+');
    const url = ARXIV_API_BASE + '?search_query=' + categoryQuery + '&start=0&max_results=' + maxResults + '&sortBy=submittedDate&sortOrder=descending';

    const response = await fetch(url);
    const xmlText = await response.text();
    const result = parser.parse(xmlText);

    if (!result.feed?.entry) {
      return [];
    }

    const entries = Array.isArray(result.feed.entry)
      ? result.feed.entry
      : [result.feed.entry];

    return entries.map(parseEntry);
  } catch (error) {
    console.error('Error fetching recent papers:', error);
    throw error;
  }
}

export async function getPaperById(arxivId: string): Promise<Paper | null> {
  try {
    const url = ARXIV_API_BASE + '?id_list=' + arxivId;

    const response = await fetch(url);
    const xmlText = await response.text();
    const result = parser.parse(xmlText);

    if (!result.feed?.entry) {
      return null;
    }

    const entry = Array.isArray(result.feed.entry)
      ? result.feed.entry[0]
      : result.feed.entry;

    return parseEntry(entry);
  } catch (error) {
    console.error('Error fetching paper by ID:', error);
    throw error;
  }
}

export const ARXIV_CATEGORIES = {
  'cs.AI': 'Artificial Intelligence',
  'cs.LG': 'Machine Learning',
  'cs.CL': 'Computation and Language',
  'cs.CV': 'Computer Vision',
  'cs.NE': 'Neural and Evolutionary Computing',
  'cs.RO': 'Robotics',
  'cs.IR': 'Information Retrieval',
  'stat.ML': 'Machine Learning (Stats)',
  'math.OC': 'Optimization and Control',
  'cs.CR': 'Cryptography and Security',
  'cs.DS': 'Data Structures and Algorithms',
  'cs.HC': 'Human-Computer Interaction',
  'cs.SE': 'Software Engineering',
};

export const arxivApi = {
  searchPapers,
  getRecentPapers,
  getPaperById,
  ARXIV_CATEGORIES,
};
