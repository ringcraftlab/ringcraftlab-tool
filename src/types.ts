export type LayoutMode = 'avoid-ring' | 'full-bleed'

export type HoleSide = 'left' | 'right'

export type LayoutChoice = 'auto' | number

export type Rotation = 0 | 90 | 180 | 270

export type TransformState = {
  scale: number
  offsetX: number
  offsetY: number
  rotation: Rotation
}

export type RefillImage = {
  id: string
  name: string
  dataUrl: string
  naturalWidth: number
  naturalHeight: number
  transform: TransformState
}

export type HolePatternId = 'mini5' | 'mini6' | 'bible' | 'a5' | 'none'

export type MarkerType = 'cross' | 'circle'

export type HolePattern = {
  id: HolePatternId
  label: string
  holeCount: number
  centerOffsetsMm: number[]
  holeDiameterMm: number
  safetyZoneMm: number
  markerType: MarkerType
  markerSizeMm: number
}

export type RefillSize = {
  id: string
  label: string
  widthMm: number
  heightMm: number
  holePatternId: HolePatternId
}

export type PaperOrientation = 'portrait' | 'landscape'

export type PaperSize = {
  id: string
  label: string
  widthMm: number
  heightMm: number
}

export type SlotPlacement = {
  pageIndex: number
  slotIndex: number
  xMm: number
  yMm: number
  widthMm: number
  heightMm: number
  image: RefillImage | null
}

export type PageLayout = {
  orientation: PaperOrientation
  pageWidthMm: number
  pageHeightMm: number
  slotsPerPage: number
  columns: number
  rows: number
  marginX: number
  marginY: number
  slots: SlotPlacement[]
}
