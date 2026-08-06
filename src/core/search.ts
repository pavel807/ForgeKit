/* Лёгкий нечёткий поиск: совпадение подстроки + последовательности символов */

export interface Searchable {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  category: string;
  categoryName: string;
}

export interface SearchResult<T> {
  item: T;
  score: number;
}

function subsequenceScore(query: string, text: string): number {
  const q = query.toLowerCase();
  let ti = 0;
  let matches = 0;
  let distance = 0;
  let last = -1;
  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    let found = -1;
    for (let j = ti; j < text.length; j++) {
      if (text[j].toLowerCase() === ch) {
        found = j;
        break;
      }
    }
    if (found === -1) return -1;
    if (last !== -1) distance += found - last - 1;
    last = found;
    matches++;
    ti = found + 1;
  }
  return 1 / (1 + text.length - matches + distance * 0.5);
}

function score(query: string, target: string, weight: number): number {
  const t = target.toLowerCase();
  const q = query.toLowerCase();
  let s = 0;
  if (t.startsWith(q)) {
    s += weight * (q.length === t.length ? 1.2 : 1.0);
  } else if (t.includes(q)) {
    s += weight * 0.7;
  } else {
    const sub = subsequenceScore(q, t);
    if (sub < 0) return 0;
    s += weight * sub;
  }
  return s;
}

export function fuzzySearch<T extends Searchable>(query: string, items: T[], limit = 12): SearchResult<T>[] {
  const q = query.trim();
  if (!q) return items.slice(0, limit).map((item) => ({ item, score: 0 }));

  const results: SearchResult<T>[] = [];
  for (const item of items) {
    let s = score(q, item.name, 3);
    s += score(q, item.categoryName, 0.4);
    s += score(q, item.keywords.join(" "), 1.5);
    s += score(q, item.description, 0.6);
    if (s > 0) results.push({ item, score: s });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}