import { HOLE_PATTERNS } from '../constants'
import type {
  HoleSide,
  LayoutChoice,
  LayoutMode,
  PageLayout,
  RefillImage,
  RefillSize,
  SlotPlacement,
  TransformState,
} from '../types'

// ---------------------------------------------------------------------------
// 単位変換
// ---------------------------------------------------------------------------

export function mmToPt(mm: number): number {
  return (mm / 25.4) * 72
}

// ---------------------------------------------------------------------------
// 画像配置エリア（穴回避 or 全面）
// ---------------------------------------------------------------------------

export function getImageArea(
  refill: RefillSize,
  layoutMode: LayoutMode,
  holeSide: HoleSide,
) {
  if (layoutMode === 'full-bleed') {
    return { xMm: 0, yMm: 0, widthMm: refill.widthMm, heightMm: refill.heightMm }
  }

  const { safetyZoneMm } = HOLE_PATTERNS[refill.holePatternId]
  return {
    xMm: holeSide === 'left' ? safetyZoneMm : 0,
    yMm: 0,
    widthMm: refill.widthMm - safetyZoneMm,
    heightMm: refill.heightMm,
  }
}

// ---------------------------------------------------------------------------
// 画像の描画矩形（mm単位、エリア内での位置とサイズ）
// ---------------------------------------------------------------------------

function getRotatedNaturalSize(image: RefillImage, rotation: TransformState['rotation']) {
  const swapped = rotation === 90 || rotation === 270
  return swapped
    ? { width: image.naturalHeight, height: image.naturalWidth }
    : { width: image.naturalWidth, height: image.naturalHeight }
}

export function getDrawRect(
  image: RefillImage,
  areaWidthMm: number,
  areaHeightMm: number,
) {
  const natural = getRotatedNaturalSize(image, image.transform.rotation)
  const baseScale = Math.max(areaWidthMm / natural.width, areaHeightMm / natural.height)
  const drawWidthMm = natural.width * baseScale * image.transform.scale
  const drawHeightMm = natural.height * baseScale * image.transform.scale

  const xMm = image.transform.offsetX - (drawWidthMm - areaWidthMm) / 2
  const yMm = image.transform.offsetY - (drawHeightMm - areaHeightMm) / 2

  return { xMm, yMm, widthMm: drawWidthMm, heightMm: drawHeightMm }
}

// ---------------------------------------------------------------------------
// グリッド選択
// ---------------------------------------------------------------------------

type Grid = {
  columns: number
  rows: number
  capacity: number
  marginX: number
  marginY: number
}

function findBestGrid(
  pageWidthMm: number,
  pageHeightMm: number,
  refill: RefillSize,
  desiredCount: number,
): Grid | null {
  const maxCols = Math.floor(pageWidthMm / refill.widthMm)
  const maxRows = Math.floor(pageHeightMm / refill.heightMm)

  if (maxCols === 0 || maxRows === 0) return null

  let best: (Grid & { waste: number }) | null = null

  for (let cols = 1; cols <= maxCols; cols++) {
    for (let rows = 1; rows <= maxRows; rows++) {
      const capacity = cols * rows
      if (capacity < desiredCount) continue

      const marginX = (pageWidthMm - cols * refill.widthMm) / (cols + 1)
      const marginY = (pageHeightMm - rows * refill.heightMm) / (rows + 1)
      const waste = capacity - desiredCount

      if (!best || waste < best.waste || (waste === best.waste && marginX + marginY > best.marginX + best.marginY)) {
        best = { columns: cols, rows, capacity, marginX, marginY, waste }
      }
    }
  }

  return best
}

// ---------------------------------------------------------------------------
// 配置可能な最大枚数と選択肢
// ---------------------------------------------------------------------------

export const PAPER_SIZES_PRINT = {
  a4: { widthMm: 210, heightMm: 297, label: 'A4' },
  a5: { widthMm: 148, heightMm: 210, label: 'A5' },
} as const

export type PrintPaperSizeId = keyof typeof PAPER_SIZES_PRINT

export function getLayoutOptions(refill: RefillSize, paperId: PrintPaperSizeId = 'a4') {
  const paper = PAPER_SIZES_PRINT[paperId]
  const portrait = paper
  const landscape = { widthMm: paper.heightMm, heightMm: paper.widthMm }

  const maxPortrait =
    Math.floor(portrait.widthMm / refill.widthMm) *
    Math.floor(portrait.heightMm / refill.heightMm)

  const maxLandscape =
    Math.floor(landscape.widthMm / refill.widthMm) *
    Math.floor(landscape.heightMm / refill.heightMm)

  const maxCount = Math.max(maxPortrait, maxLandscape)
  const presets = [1, 2, 4, 6, 8]
  const options = presets.filter((n, i, arr) => n <= maxCount && arr.indexOf(n) === i)

  return { maxCount, options }
}

// ---------------------------------------------------------------------------
// ページレイアウト構築
// ---------------------------------------------------------------------------

export function buildPageLayouts(
  images: RefillImage[],
  refill: RefillSize,
  layoutChoice: LayoutChoice,
  paperId: PrintPaperSizeId = 'a4',
): PageLayout[] {
  const { maxCount } = getLayoutOptions(refill, paperId)
  const desiredCount = layoutChoice === 'auto' ? maxCount : layoutChoice

  const paper = PAPER_SIZES_PRINT[paperId]
  const portrait = paper
  const landscape = { widthMm: paper.heightMm, heightMm: paper.widthMm }

  const portraitGrid = findBestGrid(portrait.widthMm, portrait.heightMm, refill, desiredCount)
  const landscapeGrid = findBestGrid(landscape.widthMm, landscape.heightMm, refill, desiredCount)

  const useLandscape =
    !!landscapeGrid &&
    (!portraitGrid ||
      landscapeGrid.capacity - desiredCount < portraitGrid.capacity - desiredCount ||
      (landscapeGrid.capacity - desiredCount === portraitGrid.capacity - desiredCount &&
        landscapeGrid.marginX + landscapeGrid.marginY > portraitGrid.marginX + portraitGrid.marginY))

  const grid = (useLandscape ? landscapeGrid : portraitGrid) ?? portraitGrid ?? landscapeGrid
  if (!grid) return []

  const orientation = useLandscape ? 'landscape' : 'portrait'
  const pageWidthMm = useLandscape ? paper.heightMm : paper.widthMm
  const pageHeightMm = useLandscape ? paper.widthMm : paper.heightMm
  const slotsPerPage = grid.capacity
  const pageCount = Math.max(1, Math.ceil(images.length / slotsPerPage))

  const layouts: PageLayout[] = []

  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const slots: SlotPlacement[] = []

    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.columns; col++) {
        const slotIndex = row * grid.columns + col
        const absoluteIndex = pageIndex * slotsPerPage + slotIndex
        const xMm = grid.marginX + col * (refill.widthMm + grid.marginX)
        const yMm = grid.marginY + row * (refill.heightMm + grid.marginY)

        slots.push({
          pageIndex,
          slotIndex,
          xMm,
          yMm,
          widthMm: refill.widthMm,
          heightMm: refill.heightMm,
          image: images[absoluteIndex] ?? null,
        })
      }
    }

    layouts.push({
      orientation,
      pageWidthMm,
      pageHeightMm,
      slotsPerPage,
      columns: grid.columns,
      rows: grid.rows,
      marginX: grid.marginX,
      marginY: grid.marginY,
      slots,
    })
  }

  return layouts
}
