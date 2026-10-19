import type { Vec3 } from './types.ts'

export const WORLD_HALF = 24
export const DAY_TICKS = 90
export const AGE_PER_TICK = 0.25

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function distance2D(a: Pick<Vec3, 'x' | 'z'>, b: Pick<Vec3, 'x' | 'z'>): number {
  return Math.hypot(a.x - b.x, a.z - b.z)
}

export function inBounds(x: number, z: number): boolean {
  return Math.abs(x) <= WORLD_HALF && Math.abs(z) <= WORLD_HALF
}

/** Hills, a shoreline, and one lake basin. Values below the waterline are submerged. */
export function rawHeight(x: number, z: number): number {
  const nx = x / WORLD_HALF
  const nz = z / WORLD_HALF
  const edge = (nx * nx + nz * nz) ** 0.85
  const hills =
    Math.sin(x * 0.21) * Math.cos(z * 0.18) * 1.1 +
    Math.sin(x * 0.07 + z * 0.05) * 0.85 +
    Math.cos(x * 0.33 - z * 0.2) * 0.28
  const lake = Math.exp(-((x - 10) ** 2 + (z + 8) ** 2) / 28) * 2.4
  return 0.85 + hills * 0.55 - edge * 0.45 - lake
}

export function isWater(x: number, z: number): boolean {
  return !inBounds(x, z) || rawHeight(x, z) < 0.35
}

export function terrainHeight(x: number, z: number): number {
  const height = rawHeight(x, z)
  return height < 0.35 ? 0.08 : height
}

export function phaseLabel(phase: number): string {
  const sun = Math.sin(phase * Math.PI * 2)
  if (sun > 0.65) return 'Day'
  if (sun > 0.15) return phase < 0.5 ? 'Morning' : 'Evening'
  return 'Night'
}
