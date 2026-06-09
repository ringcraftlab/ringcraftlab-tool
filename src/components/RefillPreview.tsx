import { HOLE_PATTERNS } from '../constants'
import { getDrawRect, getImageArea } from '../engine/layout'
import type { HoleSide, LayoutMode, RefillImage, RefillSize } from '../types'

type RefillPreviewProps = {
  image: RefillImage | null
  refill: RefillSize
  layoutMode: LayoutMode
  holeSide: HoleSide
  showHoleMarks?: boolean
  showCutLines?: boolean
  showEdgeWarning?: boolean
  className?: string
}

export function RefillPreview({
  image,
  refill,
  layoutMode,
  holeSide,
  showHoleMarks = true,
  showCutLines = true,
  showEdgeWarning = false,
  className = '',
}: RefillPreviewProps) {
  const pattern = HOLE_PATTERNS[refill.holePatternId]
  const area = getImageArea(refill, layoutMode, holeSide)
  const draw = image ? getDrawRect(image, area.widthMm, area.heightMm) : null
  const edgeMm = 2

  return (
    <div
      className={['relative overflow-hidden bg-white border border-[#ddd6c8]', className].join(' ')}
      style={{
        aspectRatio: `${refill.widthMm}/${refill.heightMm}`,
        // isolation:isolateでCSS transformによる枠外漏れを防止
        isolation: 'isolate',
      }}
    >
      {/* 端切れ警告エリア */}
      {showEdgeWarning && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 bg-pink-200/50" style={{ width: `${(edgeMm / refill.widthMm) * 100}%` }} />
          <div className="pointer-events-none absolute inset-y-0 right-0 bg-pink-200/50" style={{ width: `${(edgeMm / refill.widthMm) * 100}%` }} />
          <div className="pointer-events-none absolute inset-x-0 top-0 bg-pink-200/50" style={{ height: `${(edgeMm / refill.heightMm) * 100}%` }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-pink-200/50" style={{ height: `${(edgeMm / refill.heightMm) * 100}%` }} />
        </>
      )}

      {/* 穴帯（回避ゾーン） */}
      <div
        className="pointer-events-none absolute inset-y-0 bg-blue-50/60"
        style={{
          [holeSide === 'left' ? 'left' : 'right']: 0,
          width: `${(pattern.safetyZoneMm / refill.widthMm) * 100}%`,
        }}
      />

      {/* 画像 */}
      <div
        className="absolute overflow-hidden"
        style={{
          left: `${(area.xMm / refill.widthMm) * 100}%`,
          top: `${(area.yMm / refill.heightMm) * 100}%`,
          width: `${(area.widthMm / refill.widthMm) * 100}%`,
          height: `${(area.heightMm / refill.heightMm) * 100}%`,
        }}
      >
        {image && draw ? (() => {
          const rotation = image.transform.rotation
          const isSwapped = rotation === 90 || rotation === 270

          // draw.widthMm / draw.heightMm は回転後の寸法
          // img要素は自然サイズ（回転前）で配置し、CSSで回転させる
          // 回転後のボックスサイズに合わせて位置を補正する
          const naturalW = isSwapped ? draw.heightMm : draw.widthMm
          const naturalH = isSwapped ? draw.widthMm : draw.heightMm

          const offsetX = isSwapped ? (draw.widthMm - draw.heightMm) / 2 : 0
          const offsetY = isSwapped ? (draw.heightMm - draw.widthMm) / 2 : 0

          return (
            <img
              src={image.dataUrl}
              alt={image.name}
              draggable={false}
              className="absolute max-w-none select-none"
              style={{
                left: `${((draw.xMm + offsetX) / area.widthMm) * 100}%`,
                top: `${((draw.yMm + offsetY) / area.heightMm) * 100}%`,
                width: `${(naturalW / area.widthMm) * 100}%`,
                height: `${(naturalH / area.heightMm) * 100}%`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
            />
          )
        })() : (
          <div className="flex h-full items-center justify-center bg-slate-50 text-[10px] font-bold text-slate-300">
            画像なし
          </div>
        )}
      </div>

      {/* 穴マーク */}
      {showHoleMarks && (
        <div
          className="pointer-events-none absolute inset-y-0 z-10 flex flex-col justify-center"
          style={{
            [holeSide === 'left' ? 'left' : 'right']: 0,
            width: `${(pattern.safetyZoneMm / refill.widthMm) * 100}%`,
          }}
        >
          {pattern.centerOffsetsMm.map((offset) => (
            <div
              key={offset}
              className="absolute flex items-center justify-center text-blue-400"
              style={{
                top: `${((refill.heightMm / 2 + offset) / refill.heightMm) * 100}%`,
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '9px',
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              +
            </div>
          ))}
        </div>
      )}

      {/* カット線 */}
      {showCutLines && (
        <div className="pointer-events-none absolute inset-0 border border-dashed border-slate-400/60" />
      )}
    </div>
  )
}
