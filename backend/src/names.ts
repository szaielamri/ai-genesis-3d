import type { Gender } from 'ai-genesis-shared'

const MALE = [
  'Adam', 'Cain', 'Abel', 'Seth', 'Noah', 'Enoch', 'Jared', 'Lamech', 'Shem', 'Ham',
  'Levi', 'Judah', 'Asher', 'Cyrus', 'Felix', 'Jonah', 'Marcus', 'Owen', 'Silas', 'Theo',
  'Miles', 'Oscar', 'Rowan', 'Ezra', 'Nico', 'Hugo',
]

const FEMALE = [
  'Eve', 'Sara', 'Leah', 'Ruth', 'Esther', 'Miriam', 'Hannah', 'Deborah', 'Naomi', 'Dinah',
  'Clara', 'Iris', 'Mara', 'Nora', 'Ada', 'Lydia', 'June', 'Freya', 'Willa', 'Esme',
  'Helen', 'Greta', 'Ines', 'Opal', 'Vera', 'Priya',
]

const used = new Set<string>()

export function resetNames(): void {
  used.clear()
}

export function reserveName(name: string): void {
  used.add(name)
}

export function takeName(gender: Gender): string {
  const pool = gender === 'male' ? MALE : FEMALE
  const available = pool.find((name) => !used.has(name))
  if (available) {
    used.add(available)
    return available
  }
  const base = pool[Math.floor(Math.random() * pool.length)] ?? 'Ari'
  let suffix = 2
  while (used.has(`${base} ${suffix}`)) suffix += 1
  const name = `${base} ${suffix}`
  used.add(name)
  return name
}
