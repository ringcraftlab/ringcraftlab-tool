import { HOLE_PATTERNS } from '../constants'
import type { HoleSide, LayoutMode, RefillSize } from '../types'

// ---------------------------------------------------------------------------
// 共通：リフィル1枚のSVG（穴マーク・罫線・カット線付き）
// ---------------------------------------------------------------------------

type RefillCardProps = {
  refill: RefillSize
  active?: boolean
  holeSide?: HoleSide
  width?: number
}

export function RefillCard({ refill, active = false, holeSide = 'left', width = 44 }: RefillCardProps) {
  const pattern = HOLE_PATTERNS[refill.holePatternId]
  const height = (refill.heightMm / refill.widthMm) * width
  const svgW = width
  const svgH = height

  const holeX = holeSide === 'left' ? 4 : width - 4
  const lineCount = 5
  const lineColor = '#e2e8f0'
  const holeColor = active ? '#3b82f6' : '#94a3b8'
  const borderColor = active ? '#3b82f6' : '#cbd5e1'
  const bgColor = active ? '#eff6ff' : '#f8fafc'

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} width={svgW} height={svgH} style={{ display: 'block' }}>
      {/* 本体 */}
      <rect x="0.5" y="0.5" width={svgW - 1} height={svgH - 1} fill={bgColor} stroke={borderColor} strokeWidth="1" rx="2" />

      {/* 穴側の帯（薄く） */}
      <rect
        x={holeSide === 'left' ? 0.5 : svgW - (pattern.safetyZoneMm / refill.widthMm) * width - 0.5}
        y="0.5"
        width={(pattern.safetyZoneMm / refill.widthMm) * width}
        height={svgH - 1}
        fill={active ? '#dbeafe' : '#f1f5f9'}
        rx="1.5"
      />

      {/* 罫線（横線）*/}
      {Array.from({ length: lineCount }).map((_, i) => {
        const y = svgH * ((i + 1) / (lineCount + 1))
        const xStart = holeSide === 'left' ? (pattern.safetyZoneMm / refill.widthMm) * width + 2 : 2
        const xEnd = holeSide === 'left' ? svgW - 3 : svgW - (pattern.safetyZoneMm / refill.widthMm) * width - 2
        return <line key={i} x1={xStart} y1={y} x2={xEnd} y2={y} stroke={lineColor} strokeWidth="0.7" />
      })}

      {/* 穴マーク */}
      {pattern.centerOffsetsMm.map((offset) => {
        const cy = svgH / 2 + (offset / refill.heightMm) * svgH
        const arm = 2.2
        return (
          <g key={offset}>
            <circle cx={holeX} cy={cy} r={2.8} fill={active ? '#dbeafe' : '#e2e8f0'} />
            <line x1={holeX - arm} y1={cy} x2={holeX + arm} y2={cy} stroke={holeColor} strokeWidth="0.9" />
            <line x1={holeX} y1={cy - arm} x2={holeX} y2={cy + arm} stroke={holeColor} strokeWidth="0.9" />
          </g>
        )
      })}

      {/* カット線（外枠点線） */}
      <rect x="0.5" y="0.5" width={svgW - 1} height={svgH - 1} fill="none" stroke={borderColor} strokeWidth="0.8" strokeDasharray="3 2" rx="2" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Step 2：サイズカード用（横並びで比較しやすいサイズ）
// ---------------------------------------------------------------------------

export function RefillSizeCardIllust({ refill, active }: { refill: RefillSize; active: boolean }) {
  return <RefillCard refill={refill} active={active} width={40} />
}

// ---------------------------------------------------------------------------
// Step 2：選択中サイズのプレビュー（大きめ）
// ---------------------------------------------------------------------------

export function RefillSizePreview({ refill }: { refill: RefillSize }) {
  return (
    <div className="flex items-end gap-3">
      <RefillCard refill={refill} active width={52} />
      <div>
        <p className="text-[11px] font-bold text-blue-600">{refill.label}</p>
        <p className="text-[12px] text-slate-500">{refill.widthMm} × {refill.heightMm} mm</p>
        <p className="mt-1 text-[11px] text-slate-400">穴 {HOLE_PATTERNS[refill.holePatternId].holeCount}個</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// レイアウトモードイラスト
// ---------------------------------------------------------------------------

export function LayoutModeIllust({ mode, holeSide = 'left', active = false }: { mode: LayoutMode; holeSide?: HoleSide; active?: boolean }) {
  const w = 36
  const h = 52
  const safeW = 8
  const holeX = holeSide === 'left' ? 4 : w - 4

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: 'block' }}>
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} fill="#fff" stroke={active ? '#3b82f6' : '#ccc'} strokeWidth="1" rx="1.5" />

      {mode === 'avoid-ring' ? (
        <>
          <rect
            x={holeSide === 'left' ? 0.5 : w - safeW - 0.5}
            y="0.5"
            width={safeW}
            height={h - 1}
            fill="#dbeafe"
          />
          <rect
            x={holeSide === 'left' ? safeW + 1 : 0.5}
            y="3"
            width={w - safeW - 3}
            height={h - 6}
            fill={active ? '#bfdbfe' : '#e5e7eb'}
            rx="1"
          />
        </>
      ) : (
        <rect x="1.5" y="1.5" width={w - 3} height={h - 3} fill={active ? '#bfdbfe' : '#e5e7eb'} rx="1" />
      )}

      {[-16, -8, 0, 8, 16].map((offset) => {
        const cy = h / 2 + offset * (h / 52)
        return (
          <g key={offset}>
            <line x1={holeX - 2} y1={cy} x2={holeX + 2} y2={cy} stroke={active ? '#3b82f6' : '#9ca3af'} strokeWidth="0.8" />
            <line x1={holeX} y1={cy - 2} x2={holeX} y2={cy + 2} stroke={active ? '#3b82f6' : '#9ca3af'} strokeWidth="0.8" />
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// 穴位置イラスト
// ---------------------------------------------------------------------------

export function HoleSideIllust({ side, active = false }: { side: HoleSide; active?: boolean }) {
  const w = 36
  const h = 52
  const holeX = side === 'left' ? 5 : w - 5

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: 'block' }}>
      <rect x="0.5" y="0.5" width={w - 1} height={h - 1} fill="#fff" stroke={active ? '#3b82f6' : '#ccc'} strokeWidth="1" rx="1.5" />
      <rect x="2" y="2" width={w - 4} height={h - 4} fill={active ? '#dbeafe' : '#f3f4f6'} rx="1" />
      {[-16, -8, 0, 8, 16].map((offset) => {
        const cy = h / 2 + offset * (h / 52)
        return (
          <g key={offset}>
            <circle cx={holeX} cy={cy} r={2.5} fill={active ? '#bfdbfe' : '#e2e8f0'} />
            <line x1={holeX - 2.5} y1={cy} x2={holeX + 2.5} y2={cy} stroke={active ? '#3b82f6' : '#9ca3af'} strokeWidth="1" />
            <line x1={holeX} y1={cy - 2.5} x2={holeX} y2={cy + 2.5} stroke={active ? '#3b82f6' : '#9ca3af'} strokeWidth="1" />
          </g>
        )
      })}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// 面付けイラスト
// ---------------------------------------------------------------------------

export function ImpositionIllust({ columns, rows, active = false }: { columns: number; rows: number; active?: boolean }) {
  const canvasW = 40
  const canvasH = 56
  const padX = 3
  const padY = 3
  const gapX = 1.5
  const gapY = 1.5
  const cellW = (canvasW - padX * 2 - gapX * (columns - 1)) / columns
  const cellH = (canvasH - padY * 2 - gapY * (rows - 1)) / rows

  const cells: { x: number; y: number }[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      cells.push({ x: padX + c * (cellW + gapX), y: padY + r * (cellH + gapY) })
    }
  }

  return (
    <svg viewBox={`0 0 ${canvasW} ${canvasH}`} width={canvasW} height={canvasH} style={{ display: 'block' }}>
      {/* 用紙（折り目の三角付き） */}
      <rect x="0.5" y="0.5" width={canvasW - 1} height={canvasH - 1} fill={active ? '#eff6ff' : '#f9fafb'} stroke={active ? '#93c5fd' : '#d1d5db'} strokeWidth="0.8" rx="2" />
      {/* 右上の折り目 */}
      <polyline points={`${canvasW - 5},0.5 ${canvasW - 0.5},5.5`} fill="none" stroke={active ? '#93c5fd' : '#d1d5db'} strokeWidth="0.8" />
      {/* リフィル */}
      {cells.map((cell, i) => (
        <rect key={i} x={cell.x} y={cell.y} width={cellW} height={cellH} fill={active ? '#3b82f6' : '#9ca3af'} opacity="0.7" rx="0.5" />
      ))}
    </svg>
  )
}

