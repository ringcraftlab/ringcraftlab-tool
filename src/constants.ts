import type { HolePattern, PaperSize, RefillSize } from './types'

export const DEFAULT_TRANSFORM = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0 as const,
}

// ---------------------------------------------------------------------------
// 穴パターン
// ---------------------------------------------------------------------------

export const HOLE_PATTERNS: Record<string, HolePattern> = {
  mini5: {
    id: 'mini5',
    label: 'ミニ5',
    holeCount: 5,
    centerOffsetsMm: [-38, -19, 0, 19, 38],
    holeDiameterMm: 3.8,
    safetyZoneMm: 8,
    markerType: 'cross',
    markerSizeMm: 2.4,
  },
  mini6: {
    id: 'mini6',
    label: 'ミニ6',
    holeCount: 6,
    centerOffsetsMm: [-47.5, -28.5, -9.5, 9.5, 28.5, 47.5],
    holeDiameterMm: 4.5,
    safetyZoneMm: 8,
    markerType: 'cross',
    markerSizeMm: 2.4,
  },
  bible: {
    id: 'bible',
    label: 'バイブル',
    holeCount: 6,
    centerOffsetsMm: [-63.5, -44.5, -25.5, 25.5, 44.5, 63.5],
    holeDiameterMm: 5.3,
    safetyZoneMm: 11,
    markerType: 'cross',
    markerSizeMm: 2.4,
  },
  a5: {
    id: 'a5',
    label: 'A5',
    holeCount: 6,
    centerOffsetsMm: [-73, -54, -35, 35, 54, 73],
    holeDiameterMm: 5.8,
    safetyZoneMm: 11,
    markerType: 'cross',
    markerSizeMm: 2.4,
  },
}

// ---------------------------------------------------------------------------
// リフィルサイズ
// ---------------------------------------------------------------------------

export const REFILL_SIZES: RefillSize[] = [
  {
    id: 'mini5',
    label: 'ミニ5',
    widthMm: 61,
    heightMm: 105,
    holePatternId: 'mini5',
  },
  {
    id: 'mini5-square',
    label: 'ミニ5スクエア',
    widthMm: 105,
    heightMm: 105,
    holePatternId: 'mini5',
  },
  {
    id: 'mini6',
    label: 'ミニ6',
    widthMm: 80,
    heightMm: 126,
    holePatternId: 'mini6',
  },
  {
    id: 'bible',
    label: 'バイブル',
    widthMm: 95,
    heightMm: 170,
    holePatternId: 'bible',
  },
  {
    id: 'a5',
    label: 'A5',
    widthMm: 148,
    heightMm: 210,
    holePatternId: 'a5',
  },
]

// ---------------------------------------------------------------------------
// 用紙サイズ
// ---------------------------------------------------------------------------

export const PAPER_SIZES: PaperSize[] = [
  {
    id: 'a4',
    label: 'A4',
    widthMm: 210,
    heightMm: 297,
  },
]

export const PAPER_A4 = PAPER_SIZES[0]
