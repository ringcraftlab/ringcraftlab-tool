import { useEffect } from 'react'
import type { HoleSide, LayoutMode, RefillImage, RefillSize, Rotation, TransformState } from '../types'
import { RefillPreview } from './RefillPreview'

type EditSheetProps = {
  image: RefillImage
  refill: RefillSize
  holeSide: HoleSide
  layoutMode: LayoutMode
  onUpdate: (patch: Partial<TransformState> & { holeSide?: HoleSide; layoutMode?: LayoutMode }) => void
  onClose: () => void
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

function IconButton({
  onClick,
  label,
  icon,
}: {
  onClick: () => void
  label: string
  icon: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-[14px] border border-[#e5ddcf] bg-white/90 px-2 active:bg-slate-100"
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="text-[10px] font-bold text-slate-600">{label}</span>
    </button>
  )
}

function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold text-slate-400">{label}</p>
      <div className="flex gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              'flex-1 rounded-[10px] py-2 text-[12px] font-bold transition',
              value === opt.value
                ? 'bg-blue-600 text-white'
                : 'border border-[#e5ddcf] bg-white text-slate-600',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function EditSheet({ image, refill, holeSide, layoutMode, onUpdate, onClose }: EditSheetProps) {
  const step = refill.heightMm * 0.05

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function zoom(delta: number) {
    onUpdate({ scale: clamp((image.transform.scale ?? 1) + delta, 0.5, 4) })
  }

  function move(axis: 'offsetX' | 'offsetY', delta: number) {
    onUpdate({ [axis]: (image.transform[axis] ?? 0) + delta })
  }

  function rotate() {
    onUpdate({ rotation: (((image.transform.rotation ?? 0) + 90) % 360) as Rotation })
  }

  function reset() {
    onUpdate({ scale: 1, offsetX: 0, offsetY: 0, rotation: 0 })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">

      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="line-clamp-1 max-w-[60%] text-[13px] font-bold text-white/70">{image.name}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-white/20 px-4 py-2 text-[13px] font-bold text-white active:bg-white/30"
        >
          完了
        </button>
      </div>

      {/* プレビュー：縦長リフィルを大きく表示 */}
      <div className="flex flex-1 items-center justify-center px-8 py-2">
        <div style={{ width: '62%', maxWidth: '220px' }}>
          <RefillPreview
            image={image}
            refill={refill}
            layoutMode={layoutMode}
            holeSide={holeSide}
            showHoleMarks
            showCutLines
            showEdgeWarning
            className="w-full rounded-[6px] shadow-2xl"
          />
        </div>
      </div>

      {/* コントロール */}
      <div className="space-y-3 rounded-t-[24px] bg-[#f8f5f0] px-4 pb-8 pt-4">

        {/* 穴の位置・レイアウト */}
        <div className="grid grid-cols-2 gap-3">
          <ToggleGroup
            label="穴の位置"
            options={[
              { value: 'left' as HoleSide, label: '← 左穴' },
              { value: 'right' as HoleSide, label: '右穴 →' },
            ]}
            value={holeSide}
            onChange={(v) => onUpdate({ holeSide: v })}
          />
          <ToggleGroup
            label="レイアウト"
            options={[
              { value: 'avoid-ring' as LayoutMode, label: '余白あり' },
              { value: 'full-bleed' as LayoutMode, label: '全面' },
            ]}
            value={layoutMode}
            onChange={(v) => onUpdate({ layoutMode: v })}
          />
        </div>

        {/* ズーム・回転・リセット + 上下左右 */}
        <div className="grid grid-cols-4 gap-2">
          <IconButton onClick={() => zoom(+0.15)} icon="🔍" label="拡大" />
          <IconButton onClick={() => zoom(-0.15)} icon="🔎" label="縮小" />
          <IconButton onClick={rotate} icon="↻" label="回転" />
          <IconButton onClick={reset} icon="↺" label="リセット" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div />
          <IconButton onClick={() => move('offsetY', -step)} icon="↑" label="上へ" />
          <div />
          <IconButton onClick={() => move('offsetX', -step)} icon="←" label="左へ" />
          <IconButton onClick={() => move('offsetY', +step)} icon="↓" label="下へ" />
          <IconButton onClick={() => move('offsetX', +step)} icon="→" label="右へ" />
        </div>

        {/* スケール表示 */}
        <p className="text-center text-[11px] text-slate-400">
          ズーム {Math.round((image.transform.scale ?? 1) * 100)}%
        </p>
      </div>
    </div>
  )
}
