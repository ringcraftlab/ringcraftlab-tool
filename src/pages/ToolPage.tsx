import { useCallback, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'
import { DEFAULT_TRANSFORM, HOLE_PATTERNS, REFILL_SIZES, REFILL_SIZES_OTHER } from '../constants'
import { EditSheet } from '../components/EditSheet'
import { RefillPreview } from '../components/RefillPreview'
import { buildPageLayouts, getLayoutOptions } from '../engine/layout'
import { exportPdf } from '../engine/pdf'
import { useSwipeBack } from '../hooks/useSwipeBack'
import type { HoleSide, LayoutChoice, LayoutMode, RefillImage, RefillSize, TransformState } from '../types'

// ---------------------------------------------------------------------------
// 作り方モード
// ---------------------------------------------------------------------------

type MakeMode = 'multi' | 'repeat'

// ---------------------------------------------------------------------------
// ステップ定義
// ---------------------------------------------------------------------------

type Step = 1 | 2 | 3 | 4

const STEP_LABELS: Record<Step, string> = {
  1: '写真をアップロード',
  2: 'リフィルサイズを選択',
  3: 'レイアウトを選択',
  4: 'プレビュー＆PDF出力',
}

// ---------------------------------------------------------------------------
// ステップインジケーター（プログレスバー形式）
// ---------------------------------------------------------------------------

function StepIndicator({ current }: { current: Step }) {
  const total = 4
  const pct = ((current - 1) / (total - 1)) * 100
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-1.5 w-20 overflow-hidden rounded-full bg-[#ede8e0]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] font-bold text-slate-400">{current} / {total}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1：画像を選ぶ
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// ソート可能な画像カード
// ---------------------------------------------------------------------------

function SortableImageCard({
  image,
  index,
  onRemove,
}: {
  image: RefillImage
  index: number
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
      }}
      className="relative touch-none"
    >
      <img
        src={image.dataUrl}
        alt={image.name}
        className="h-20 w-20 rounded-[14px] border border-[#e5ddcf] object-cover"
        {...attributes}
        {...listeners}
      />
      {/* 番号 */}
      <div className="pointer-events-none absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/50 text-[9px] font-black text-white">
        {index + 1}
      </div>
      {/* 削除ボタン */}
      <button
        type="button"
        onClick={() => onRemove(image.id)}
        className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-[11px] font-black text-white"
      >
        ×
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 1：画像を選ぶ
// ---------------------------------------------------------------------------

function Step1({
  images,
  onUpload,
  onRemove,
  onReorder,
}: {
  images: RefillImage[]
  onUpload: (files: FileList) => void
  onRemove: (id: string) => void
  onReorder: (from: number, to: number) => void
}) {
  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = images.findIndex((img) => img.id === active.id)
    const to = images.findIndex((img) => img.id === over.id)
    if (from !== -1 && to !== -1) onReorder(from, to)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="text-[11px] font-bold tracking-[0.1em] text-blue-700">STEP 1</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">画像を選ぶ</h2>
        <p className="mt-1 text-[13px] text-slate-500">
          手帳に入れたい写真やスクリーンショットを選んでください。
        </p>
      </div>

      {/* アップロードエリア */}
      <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] border-2 border-dashed border-[#d9cfbe] bg-[#faf6ee] px-6 py-10 text-center">
        <svg width="56" height="48" viewBox="0 0 64 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 36H14C8.477 36 4 31.523 4 26C4 21.048 7.486 16.9 12.16 15.8C12.056 15.21 12 14.612 12 14C12 8.477 16.477 4 22 4C25.174 4 27.994 5.468 29.86 7.772C31.076 6.664 32.708 6 34.5 6C38.366 6 41.5 9.134 41.5 13C41.5 13.17 41.494 13.338 41.482 13.506C42.296 13.18 43.178 13 44.1 13C48.46 13 52 16.54 52 20.9C52 21.27 51.974 21.634 51.924 21.99C55.402 23.138 58 26.37 58 30.2C58 33.978 55.478 37.158 52 38.128" stroke="#c9bfad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="32" y1="48" x2="32" y2="28" stroke="#ffd24a" strokeWidth="3" strokeLinecap="round"/>
          <polyline points="24,36 32,28 40,36" fill="none" stroke="#ffd24a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-[13px] text-slate-500">ここに写真をドラッグ＆ドロップ</p>
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-[#e0d9ce]" />
          <span className="text-[12px] text-slate-400">または</span>
          <div className="flex-1 h-px bg-[#e0d9ce]" />
        </div>
        <label className="flex h-11 w-full cursor-pointer items-center justify-center rounded-[12px] bg-[#ffd24a] text-[14px] font-bold text-slate-900 shadow-[0_6px_16px_rgba(255,210,74,0.45)] active:opacity-80">
          写真を選ぶ
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && onUpload(e.target.files)}
          />
        </label>
        <p className="text-[11px] text-slate-400">JPG / PNG 対応（最大 50枚まで）</p>
      </div>

      {/* 選択済み画像一覧（ソート可能） */}
      {images.length > 0 && (
        <div className="rounded-[20px] border border-[#e7dfd2] bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[12px] font-bold text-slate-500">{images.length}枚選択中</p>
            <p className="text-[11px] text-slate-400">長押しして並び替えできます</p>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <SortableImageCard
                    key={image.id}
                    image={image}
                    index={index}
                    onRemove={onRemove}
                  />
                ))}
                {/* 追加ボタン */}
                <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-[14px] border-2 border-dashed border-[#d9cfbe] bg-[#faf6ee] text-3xl text-slate-400">
                  +
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => e.target.files && onUpload(e.target.files)} />
                </label>
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 2：手帳サイズを選ぶ
// ---------------------------------------------------------------------------

const SIZE_ICON_COLORS: Record<string, { bg: string; hole: string; guide: string }> = {
  mini5:  { bg: '#fce7f3', hole: '#ec4899', guide: '#f9a8d4' },
  mini6:  { bg: '#e0f2fe', hole: '#0ea5e9', guide: '#7dd3fc' },
  bible:  { bg: '#d1fae5', hole: '#10b981', guide: '#6ee7b7' },
  a5:     { bg: '#fef9c3', hole: '#eab308', guide: '#fde047' },
}

function SizeIcon({ refill, active }: { refill: RefillSize; active: boolean }) {
  const pattern = HOLE_PATTERNS[refill.holePatternId]
  const colors = SIZE_ICON_COLORS[refill.holePatternId] ?? SIZE_ICON_COLORS['bible']
  // 形の差を強調するため表示サイズは誇張
  const DISPLAY: Record<string, { w: number; h: number }> = {
    mini5:  { w: 30, h: 64 },
    mini6:  { w: 38, h: 66 },
    bible:  { w: 44, h: 76 },
    a5:     { w: 52, h: 80 },
  }
  const display = DISPLAY[refill.id] ?? { w: 44, h: 76 }
  const HOLE_ZONE_MM = 6.5
  const holeCx = HOLE_ZONE_MM * 0.42
  const centerY = refill.heightMm / 2

  return (
    <svg
      width={display.w} height={display.h}
      viewBox={`0 0 ${refill.widthMm} ${refill.heightMm}`}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect x="0.8" y="0.8" width={refill.widthMm - 1.6} height={refill.heightMm - 1.6}
        rx="2.5" fill={colors.bg}
        stroke={active ? colors.hole : colors.guide}
        strokeWidth={active ? 1.8 : 1.2} />
      <line x1={HOLE_ZONE_MM} y1="1" x2={HOLE_ZONE_MM} y2={refill.heightMm - 1}
        stroke={colors.guide} strokeWidth="1.2" strokeDasharray="2.5 2" opacity="0.6" />
      {pattern.centerOffsetsMm.map((offset, i) => (
        <circle key={i} cx={holeCx} cy={centerY + offset} r="2.4"
          fill="white" stroke={colors.hole} strokeWidth="1.6" />
      ))}
    </svg>
  )
}

function Step2({
  refillId,
  onSelect,
}: {
  refillId: string
  onSelect: (id: string) => void
}) {
  const allOther = REFILL_SIZES_OTHER
  const isOther = allOther.some((s) => s.id === refillId)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[11px] font-bold tracking-[0.1em] text-blue-700">STEP 2</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">リフィルサイズを選択</h2>
        <p className="mt-1 text-[13px] text-slate-500">お使いの手帳のサイズを選んでください。</p>
      </div>

      {/* 人気サイズ */}
      <div className="flex flex-col gap-2">
        {REFILL_SIZES.map((size) => {
          const isActive = size.id === refillId
          const descriptions: Record<string, string> = {
            mini5: '小さくて持ち運びに便利。メモや日記にぴったり。',
            mini6: 'たっぷり書けてバランスの良い人気サイズ。',
            bible: '定番のバイブルサイズ。情報をしっかり整理。',
            a5: '広々使えて自由度の高いスタンダードサイズ。',
          }
          return (
            <button
              key={size.id}
              type="button"
              onClick={() => onSelect(size.id)}
              className={[
                'flex items-center gap-4 rounded-[16px] border-2 px-4 py-3 text-left transition',
                isActive ? 'border-[#d97706] bg-[#fffbeb]' : 'border-[#e7dfd2] bg-white',
              ].join(' ')}
            >
              <SizeIcon refill={size} active={isActive} />
              <div className="flex-1">
                <p className={['text-[14px] font-bold', isActive ? 'text-[#92400e]' : 'text-slate-800'].join(' ')}>
                  {size.label}
                </p>
                <p className="text-[12px] text-slate-400 mt-0.5">{size.widthMm} × {size.heightMm} mm</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">{descriptions[size.id]}</p>
              </div>
              <div className={[
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black',
                isActive ? 'bg-[#d97706] text-white' : 'border border-[#ddd6c8]',
              ].join(' ')}>
                {isActive ? '✓' : ''}
              </div>
            </button>
          )
        })}
      </div>

      {/* その他サイズ */}
      <div>
        <p className="mb-2 text-[12px] font-bold text-slate-500">その他のサイズ</p>
        <div className={[
          'flex items-center gap-3 rounded-[14px] border-2 bg-white px-4 py-3',
          isOther ? 'border-[#d97706]' : 'border-[#e7dfd2]',
        ].join(' ')}>
          <select
            value={isOther ? refillId : ''}
            onChange={(e) => e.target.value && onSelect(e.target.value)}
            className="flex-1 bg-transparent text-[13px] text-slate-700 outline-none"
          >
            <option value="">選択してください</option>
            {allOther.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}（{s.widthMm}×{s.heightMm}mm）
              </option>
            ))}
          </select>
        </div>
      </div>

    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 3：作り方を選ぶ

// ---------------------------------------------------------------------------

// リフィル1枚のミニチュア（中にコンテンツアイコン付き）
function MiniRefill({
  x, y, w, h,
  content, // 'photo' | 'map' | 'text' | 'receipt'
  active,
}: {
  x: number; y: number; w: number; h: number
  content: 'photo' | 'map' | 'text' | 'receipt'
  active: boolean
}) {
  const holeX = x + 3
  const holeCy = [y + h * 0.3, y + h * 0.5, y + h * 0.7]

  // コンテンツ描画エリア（穴側を少し空ける）
  const cx = x + 5
  const cw = w - 7
  const cy2 = y + 2
  const ch = h - 4

  return (
    <g>
      {/* 本体 */}
      <rect x={x} y={y} width={w} height={h} fill="white" stroke={active ? '#93c5fd' : '#cbd5e1'} strokeWidth="0.8" rx="1.5" />
      {/* 穴帯 */}
      <rect x={x} y={y} width={4} height={h} fill={active ? '#dbeafe' : '#f1f5f9'} rx="1" />
      {/* 穴マーク */}
      {holeCy.map((cy, i) => (
        <g key={i}>
          <line x1={holeX - 1.5} y1={cy} x2={holeX + 1.5} y2={cy} stroke={active ? '#3b82f6' : '#94a3b8'} strokeWidth="0.7" />
          <line x1={holeX} y1={cy - 1.5} x2={holeX} y2={cy + 1.5} stroke={active ? '#3b82f6' : '#94a3b8'} strokeWidth="0.7" />
        </g>
      ))}

      {/* コンテンツ */}
      {content === 'photo' && (
        <g>
          {/* 空の写真っぽい背景 */}
          <rect x={cx} y={cy2} width={cw} height={ch} fill="#bfdbfe" rx="1" />
          {/* 山シルエット */}
          <polygon points={`${cx},${cy2 + ch} ${cx + cw * 0.4},${cy2 + ch * 0.3} ${cx + cw * 0.7},${cy2 + ch * 0.6} ${cx + cw},${cy2 + ch}`} fill="#60a5fa" />
          {/* 太陽 */}
          <circle cx={cx + cw * 0.8} cy={cy2 + ch * 0.25} r={ch * 0.12} fill="#fde68a" />
        </g>
      )}
      {content === 'map' && (
        <g>
          <rect x={cx} y={cy2} width={cw} height={ch} fill="#d1fae5" rx="1" />
          {/* 道路 */}
          <line x1={cx} y1={cy2 + ch * 0.5} x2={cx + cw} y2={cy2 + ch * 0.5} stroke="#6ee7b7" strokeWidth="1.5" />
          <line x1={cx + cw * 0.5} y1={cy2} x2={cx + cw * 0.5} y2={cy2 + ch} stroke="#6ee7b7" strokeWidth="1.5" />
          {/* 現在地マーク */}
          <circle cx={cx + cw * 0.5} cy={cy2 + ch * 0.5} r={1.5} fill="#ef4444" />
        </g>
      )}
      {content === 'text' && (
        <g>
          <rect x={cx} y={cy2} width={cw} height={ch} fill="#f8fafc" rx="1" />
          {/* テキスト行 */}
          {[0.2, 0.4, 0.6, 0.8].map((t, i) => (
            <rect key={i} x={cx + 1} y={cy2 + ch * t} width={i % 2 === 0 ? cw - 2 : cw * 0.65} height={1.2} fill="#94a3b8" rx="0.5" />
          ))}
        </g>
      )}
      {content === 'receipt' && (
        <g>
          <rect x={cx} y={cy2} width={cw} height={ch} fill="#fffbeb" rx="1" />
          {[0.15, 0.35, 0.55, 0.75].map((t, i) => (
            <g key={i}>
              <rect x={cx + 1} y={cy2 + ch * t} width={cw * 0.45} height={1.2} fill="#fbbf24" rx="0.5" />
              <rect x={cx + cw * 0.6} y={cy2 + ch * t} width={cw * 0.35} height={1.2} fill="#fbbf24" rx="0.5" />
            </g>
          ))}
        </g>
      )}
    </g>
  )
}

function MakeModeIllust({ mode, active }: { mode: MakeMode; active: boolean }) {
  const bg = active ? '#eff6ff' : '#f9fafb'

  if (mode === 'multi') {
    // 4種類の異なるコンテンツのリフィルを横並びにフル幅で
    const contents: ('photo' | 'map' | 'text' | 'receipt')[] = ['photo', 'map', 'text', 'receipt']
    return (
      <svg viewBox="0 0 280 80" width="100%" style={{ display: 'block' }}>
        <rect x="0" y="0" width={280} height={80} fill={bg} rx="8" />
        {contents.map((c, i) => (
          <MiniRefill key={i} x={8 + i * 68} y={8} w={58} h={64} content={c} active={active} />
        ))}
      </svg>
    )
  }

  // 同じ写真が2×4で並ぶ
  return (
    <svg viewBox="0 0 280 80" width="100%" style={{ display: 'block' }}>
      <rect x="0" y="0" width={280} height={80} fill={bg} rx="8" />
      {[
        { x: 8,  y: 8 }, { x: 74, y: 8 }, { x: 140, y: 8 }, { x: 206, y: 8 },
        { x: 8,  y: 44 }, { x: 74, y: 44 }, { x: 140, y: 44 }, { x: 206, y: 44 },
      ].map((pos, i) => (
        <MiniRefill key={i} x={pos.x} y={pos.y} w={58} h={28} content="photo" active={active} />
      ))}
    </svg>
  )
}

function Step3({
  makeMode,
  imageCount,
  onSelect,
}: {
  makeMode: MakeMode
  imageCount: number
  onSelect: (mode: MakeMode) => void
}) {
  const options = [
    {
      mode: 'multi' as MakeMode,
      title: '複数の画像を並べる',
      detail: '選んだ画像をそれぞれ1枚のリフィルに配置します。',
    },
    {
      mode: 'repeat' as MakeMode,
      title: '同じ画像を繰り返す',
      detail: '1枚の画像をA4いっぱいに複製して並べます。',
    },
  ] as const

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <p className="text-[11px] font-bold tracking-[0.1em] text-blue-700">STEP 3</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">作り方を選ぶ</h2>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {options.map(({ mode, title, detail }) => {
          const isActive = makeMode === mode
          return (
            <button
              key={mode}
              type="button"
              onClick={() => onSelect(mode)}
              className={[
                'flex flex-1 w-full flex-col justify-between gap-3 rounded-[20px] border-2 px-4 py-5 text-left transition',
                isActive ? 'border-blue-500 bg-blue-50' : 'border-[#e7dfd2] bg-white',
              ].join(' ')}
            >
              <MakeModeIllust mode={mode} active={isActive} />
              <div>
                <div className="flex items-center justify-between">
                  <p className={['font-bold text-base', isActive ? 'text-blue-700' : 'text-slate-900'].join(' ')}>
                    {title}
                  </p>
                  {isActive && <span className="text-[11px] font-black text-blue-500">✓ 選択中</span>}
                </div>
                <p className="mt-1 text-[13px] leading-5 text-slate-500">{detail}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* repeatモードで複数画像がある場合の注意 */}
      {makeMode === 'repeat' && imageCount > 1 && (
        <p className="rounded-[12px] bg-amber-50 px-4 py-3 text-[12px] leading-5 text-amber-700">
          ⚠️ {imageCount}枚選択されていますが、「同じ画像を繰り返す」では1枚目のみ使用されます。
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step 4：一覧・個別編集
// ---------------------------------------------------------------------------

type ImageSetting = {
  holeSide: HoleSide
  layoutMode: LayoutMode
}

function Step4({
  images,
  refill,
  layouts,
  imageSettings,
  onUpdateTransform,
  onUpdateSetting,
  onExport,
  isExporting,
  exportError,
}: {
  images: RefillImage[]
  refill: RefillSize
  layouts: ReturnType<typeof buildPageLayouts>
  imageSettings: Record<string, ImageSetting>
  onUpdateTransform: (id: string, patch: Partial<TransformState>) => void
  onUpdateSetting: (id: string, patch: Partial<ImageSetting>) => void
  onExport: () => void
  isExporting: boolean
  exportError: string | null
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const editingImage = images.find((img) => img.id === editingId) ?? null
  const editingSetting = editingId
    ? (imageSettings[editingId] ?? { holeSide: 'left' as HoleSide, layoutMode: 'avoid-ring' as LayoutMode })
    : null

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-bold tracking-[0.1em] text-blue-700">STEP 4</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">確認・PDF出力</h2>
        <p className="mt-1 text-[12px] text-slate-500">
          印刷イメージです。リフィルをタップして個別に調整できます。
        </p>
      </div>

      {/* A4面付けプレビュー */}
      {layouts.map((layout, pageIndex) => (
        <div key={pageIndex}>
          <p className="mb-1.5 text-[11px] font-bold text-slate-400">
            {pageIndex + 1} / {layouts.length}ページ &nbsp;·&nbsp; {layout.orientation === 'portrait' ? 'A4縦' : 'A4横'}
          </p>
          {/* A4用紙 */}
          <div
            className="relative w-full overflow-hidden bg-white shadow-md"
            style={{ aspectRatio: `${layout.pageWidthMm}/${layout.pageHeightMm}` }}
          >
            {layout.slots.map((slot) => {
              const image = slot.image
              const setting = image
                ? (imageSettings[image.id] ?? { holeSide: 'left' as HoleSide, layoutMode: 'avoid-ring' as LayoutMode })
                : { holeSide: 'left' as HoleSide, layoutMode: 'avoid-ring' as LayoutMode }

              return (
                <button
                  key={`${slot.pageIndex}-${slot.slotIndex}`}
                  type="button"
                  onClick={() => image && setEditingId(image.id)}
                  disabled={!image}
                  className="absolute overflow-hidden active:brightness-75"
                  style={{
                    left: `${(slot.xMm / layout.pageWidthMm) * 100}%`,
                    top: `${(slot.yMm / layout.pageHeightMm) * 100}%`,
                    width: `${(slot.widthMm / layout.pageWidthMm) * 100}%`,
                    height: `${(slot.heightMm / layout.pageHeightMm) * 100}%`,
                    isolation: 'isolate',
                  }}
                >
                  {/* カット線（外枠） */}
                  <div className="pointer-events-none absolute inset-0 border border-dashed border-slate-300" />

                  {/* 画像 */}
                  <RefillPreview
                    image={image}
                    refill={refill}
                    layoutMode={setting.layoutMode}
                    holeSide={setting.holeSide}
                    showHoleMarks
                    showCutLines={false}
                    className="h-full w-full"
                  />
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* 印刷注意 */}
      <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] leading-5 text-amber-900">
        印刷時は「100%」「実際のサイズ」「等倍」を選択してください。「用紙に合わせる」は使わないでください。
      </div>

      {/* PDF出力ボタン */}
      <button
        type="button"
        onClick={onExport}
        disabled={isExporting}
        className="flex h-14 w-full items-center justify-center rounded-[18px] bg-[#ffd24a] text-base font-black text-slate-950 shadow-[0_8px_20px_rgba(255,210,74,0.28)] disabled:opacity-50"
      >
        {isExporting ? 'PDFを生成中...' : '印刷する（PDF出力）'}
      </button>

      {exportError && (
        <p className="rounded-[12px] bg-red-50 px-4 py-3 text-[13px] text-red-600">
          ⚠️ {exportError}
        </p>
      )}

      {/* 個別編集ボトムシート */}
      {editingImage && editingSetting && (
        <EditSheet
          image={editingImage}
          refill={refill}
          holeSide={editingSetting.holeSide}
          layoutMode={editingSetting.layoutMode}
          onUpdate={(patch) => {
            const { holeSide: hs, layoutMode: lm, ...transformPatch } = patch
            if (hs !== undefined || lm !== undefined) {
              onUpdateSetting(editingImage.id, {
                ...(hs !== undefined ? { holeSide: hs } : {}),
                ...(lm !== undefined ? { layoutMode: lm } : {}),
              })
            }
            if (Object.keys(transformPatch).length > 0) {
              onUpdateTransform(editingImage.id, transformPatch)
            }
          }}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// ToolPage
// ---------------------------------------------------------------------------

async function loadImages(files: FileList): Promise<RefillImage[]> {
  return Promise.all(
    Array.from(files).map(async (file, i) => {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })
      const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve({ w: img.width, h: img.height })
        img.onerror = () => reject(new Error('読み込み失敗'))
        img.src = dataUrl
      })
      return {
        id: `${file.name}-${Date.now()}-${i}`,
        name: file.name,
        dataUrl,
        naturalWidth: dims.w,
        naturalHeight: dims.h,
        transform: { ...DEFAULT_TRANSFORM },
      } satisfies RefillImage
    }),
  )
}

export function ToolPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [images, setImages] = useState<RefillImage[]>([])
  const [refillId, setRefillId] = useState(REFILL_SIZES[2].id)
  const [makeMode, setMakeMode] = useState<MakeMode>('multi')
  const [_layoutChoice, _setLayoutChoice] = useState<LayoutChoice>('auto')
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  // 画像ごとの穴位置・レイアウト設定
  const [imageSettings, setImageSettings] = useState<Record<string, { holeSide: HoleSide; layoutMode: LayoutMode }>>({})

  const refill = REFILL_SIZES.find((s) => s.id === refillId) ?? REFILL_SIZES[2]

  // repeatモード：1枚目の画像をA4いっぱいに複製
  const layoutImages = (() => {
    if (makeMode === 'repeat' && images.length > 0) {
      const { maxCount } = getLayoutOptions(refill)
      return Array.from({ length: maxCount }, () => images[0])
    }
    return images
  })()

  const layouts = buildPageLayouts(layoutImages, refill, _layoutChoice)

  async function handleUpload(files: FileList) {
    try {
      const loaded = await loadImages(files)
      setImages((prev) => [...prev, ...loaded])
      setImageSettings((prev) => {
        const next = { ...prev }
        for (const img of loaded) {
          next[img.id] = { holeSide: 'left', layoutMode: 'avoid-ring' }
        }
        return next
      })
    } catch (e) {
      alert(`画像の読み込みに失敗しました。\n${e instanceof Error ? e.message : ''}`)
    }
  }

  function handleRemove(id: string) {
    setImages((prev) => prev.filter((img) => img.id !== id))
    setImageSettings((prev) => { const next = { ...prev }; delete next[id]; return next })
  }

  function handleReorder(from: number, to: number) {
    setImages((prev) => arrayMove(prev, from, to))
  }

  function handleUpdateTransform(id: string, patch: Partial<TransformState>) {
    setImages((prev) =>
      prev.map((img) => img.id === id ? { ...img, transform: { ...img.transform, ...patch } } : img)
    )
  }

  function handleUpdateSetting(id: string, patch: Partial<{ holeSide: HoleSide; layoutMode: LayoutMode }>) {
    setImageSettings((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }

  async function handleExport() {
    if (!images.length || isExporting) return
    setExportError(null)
    try {
      setIsExporting(true)
      const defaultSetting = { holeSide: 'left' as HoleSide, layoutMode: 'avoid-ring' as LayoutMode }
      const bytes = await exportPdf({
        layouts,
        refill,
        imageSettings,
        defaultSetting,
        showCutLines: true,
        showHoleMarks: true,
      })
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ringcraft-${refill.id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      // ダウンロード完了を待ってから解放
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (e) {
      setExportError(e instanceof Error ? e.message : 'PDF生成に失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  function canProceed(): boolean {
    if (step === 1) return images.length > 0
    return true
  }

  function nextStep() {
    if (step < 4) setStep((s) => (s + 1) as Step)
  }

  function prevStep() {
    if (step > 1) setStep((s) => (s - 1) as Step)
    else navigate('/')
  }

  // スワイプで戻る
  const handleSwipeBack = useCallback(() => prevStep(), [step])
  useSwipeBack(handleSwipeBack)

  return (
    <div className="flex h-[100dvh] flex-col bg-[#fbf8f2]">

      {/* ヘッダー */}
      <header className="flex items-center gap-3 border-b border-[#e8e0d4] bg-white px-4 py-3">
        <button
          type="button"
          onClick={prevStep}
          className="text-[12px] font-bold text-slate-400 active:text-slate-600"
        >
          ← {step === 1 ? 'トップへ' : '前へ'}
        </button>
        <div className="flex-1 text-center">
          <p className="text-[12px] font-bold text-slate-700">{STEP_LABELS[step]}</p>
        </div>
        <StepIndicator current={step} />
      </header>

      {/* コンテンツ */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex h-full max-w-md flex-col">
          {step === 1 && <Step1 images={images} onUpload={handleUpload} onRemove={handleRemove} onReorder={handleReorder} />}
          {step === 2 && <Step2 refillId={refillId} onSelect={setRefillId} />}
          {step === 3 && <Step3 makeMode={makeMode} imageCount={images.length} onSelect={setMakeMode} />}
          {step === 4 && (
            <Step4
              images={layoutImages}
              refill={refill}
              layouts={layouts}
              imageSettings={imageSettings}
              onUpdateTransform={handleUpdateTransform}
              onUpdateSetting={handleUpdateSetting}
              onExport={handleExport}
              isExporting={isExporting}
              exportError={exportError}
            />
          )}
        </div>
      </div>

      {/* フッターナビ */}
      <footer className="border-t border-[#e8e0d4] bg-white px-4 py-4">
        <div className="mx-auto flex max-w-md gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#e5ddcf] bg-white text-lg font-bold text-slate-500 active:bg-slate-50"
            >
              ←
            </button>
          )}
          {step < 4 && (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex h-14 flex-1 items-center justify-center rounded-[18px] bg-[#ffd24a] text-sm font-black text-slate-950 shadow-[0_8px_24px_rgba(255,210,74,0.5)] disabled:opacity-40"
            >
              次へ →
            </button>
          )}
        </div>
      </footer>

    </div>
  )
}
