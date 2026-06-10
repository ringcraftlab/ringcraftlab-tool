import { PDFDocument, PDFNumber, PDFOperator, degrees, popGraphicsState, pushGraphicsState, rgb } from 'pdf-lib'
import { HOLE_PATTERNS } from '../constants'
import type { HoleSide, LayoutMode, PageLayout, RefillSize } from '../types'
import { getDrawRect, getImageArea, mmToPt } from './layout'

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

export type ImageSetting = {
  holeSide: HoleSide
  layoutMode: LayoutMode
}

export type ExportPdfOptions = {
  layouts: PageLayout[]
  refill: RefillSize
  imageSettings: Record<string, ImageSetting>
  defaultSetting: ImageSetting
  showCutLines: boolean
  showHoleMarks: boolean
}

// ---------------------------------------------------------------------------
// 画像データ変換
// ---------------------------------------------------------------------------

async function dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
  const res = await fetch(dataUrl)
  if (!res.ok) throw new Error(`画像データの取得に失敗しました (${res.status})`)
  return new Uint8Array(await res.arrayBuffer())
}

function isJpeg(dataUrl: string): boolean {
  return dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')
}

// ---------------------------------------------------------------------------
// カット線
// ---------------------------------------------------------------------------

function drawCutLine(
  page: ReturnType<PDFDocument['addPage']>,
  xPt: number,
  yPt: number,
  widthPt: number,
  heightPt: number,
) {
  page.drawRectangle({
    x: xPt,
    y: yPt,
    width: widthPt,
    height: heightPt,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 0.5,
    opacity: 0.35,
  })
}

// ---------------------------------------------------------------------------
// 穴位置マーク
// ---------------------------------------------------------------------------

function drawHoleMarks(
  page: ReturnType<PDFDocument['addPage']>,
  refill: RefillSize,
  slot: PageLayout['slots'][number],
  holeSide: HoleSide,
  pageHeightPt: number,
) {
  const pattern = HOLE_PATTERNS[refill.holePatternId]
  // プレビューと合わせて安全ゾーンの中央に配置
  const holeXMm = holeSide === 'left'
    ? slot.xMm + pattern.safetyZoneMm / 2
    : slot.xMm + slot.widthMm - pattern.safetyZoneMm / 2

  for (const offsetMm of pattern.centerOffsetsMm) {
    const centerYMm = slot.yMm + slot.heightMm / 2 + offsetMm
    const cx = mmToPt(holeXMm)
    const cy = pageHeightPt - mmToPt(centerYMm)
    const arm = mmToPt(pattern.markerSizeMm / 2)

    page.drawLine({ start: { x: cx - arm, y: cy }, end: { x: cx + arm, y: cy }, thickness: 0.6, color: rgb(0.4, 0.4, 0.4), opacity: 0.55 })
    page.drawLine({ start: { x: cx, y: cy - arm }, end: { x: cx, y: cy + arm }, thickness: 0.6, color: rgb(0.4, 0.4, 0.4), opacity: 0.55 })
  }
}

// ---------------------------------------------------------------------------
// 画像描画（回転補正込み）
// ---------------------------------------------------------------------------

function drawImageOnPage(
  page: ReturnType<PDFDocument['addPage']>,
  embedded: Awaited<ReturnType<PDFDocument['embedPng']>>,
  slot: PageLayout['slots'][number],
  refill: RefillSize,
  setting: ImageSetting,
  pageHeightPt: number,
) {
  const image = slot.image!
  const imageArea = getImageArea(refill, setting.layoutMode, setting.holeSide)
  const draw = getDrawRect(image, imageArea.widthMm, imageArea.heightMm)

  const rotation = image.transform.rotation
  const isSwapped = rotation === 90 || rotation === 270

  // 画像エリアのPD座標
  const areaXPt = mmToPt(slot.xMm + imageArea.xMm)
  const areaWidthPt = mmToPt(imageArea.widthMm)
  const areaHeightPt = mmToPt(imageArea.heightMm)
  const areaYPt = pageHeightPt - mmToPt(slot.yMm + imageArea.yMm) - areaHeightPt

  // 回転補正
  const naturalW = isSwapped ? draw.heightMm : draw.widthMm
  const naturalH = isSwapped ? draw.widthMm : draw.heightMm
  const offsetX = isSwapped ? (draw.widthMm - draw.heightMm) / 2 : 0
  const offsetY = isSwapped ? (draw.heightMm - draw.widthMm) / 2 : 0

  const drawXPt = areaXPt + mmToPt(draw.xMm + offsetX)
  const drawYPt = areaYPt + mmToPt(draw.yMm + offsetY)

  // 画像エリアでクリップしてから描画（avoid-ringの安全ゾーンへのはみ出しを防ぐ）
  page.pushOperators(
    pushGraphicsState(),
    PDFOperator.of('re', [
      PDFNumber.of(areaXPt),
      PDFNumber.of(areaYPt),
      PDFNumber.of(areaWidthPt),
      PDFNumber.of(areaHeightPt),
    ]),
    PDFOperator.of('W'),  // クリップパスを設定
    PDFOperator.of('n'),  // パスを描画せず終了
  )

  page.drawImage(embedded, {
    x: drawXPt,
    y: drawYPt,
    width: mmToPt(naturalW),
    height: mmToPt(naturalH),
    rotate: degrees(rotation),
  })

  page.pushOperators(popGraphicsState())
}

// ---------------------------------------------------------------------------
// 1ページ描画
// ---------------------------------------------------------------------------

async function drawPage(
  pdfDoc: PDFDocument,
  layout: PageLayout,
  refill: RefillSize,
  imageSettings: Record<string, ImageSetting>,
  defaultSetting: ImageSetting,
  showCutLines: boolean,
  showHoleMarks: boolean,
  imageCache: Map<string, Awaited<ReturnType<PDFDocument['embedPng']>>>,
) {
  const page = pdfDoc.addPage([mmToPt(layout.pageWidthMm), mmToPt(layout.pageHeightMm)])
  const pageHeightPt = mmToPt(layout.pageHeightMm)

  for (const slot of layout.slots) {
    const xPt = mmToPt(slot.xMm)
    const yPt = pageHeightPt - mmToPt(slot.yMm) - mmToPt(slot.heightMm)
    const widthPt = mmToPt(slot.widthMm)
    const heightPt = mmToPt(slot.heightMm)

    if (showCutLines) {
      drawCutLine(page, xPt, yPt, widthPt, heightPt)
    }

    if (slot.image) {
      const image = slot.image
      // 画像ごとの個別設定を取得（なければデフォルト）
      const setting = imageSettings[image.id] ?? defaultSetting

      if (!imageCache.has(image.id)) {
        try {
          const bytes = await dataUrlToBytes(image.dataUrl)
          const embedded = isJpeg(image.dataUrl)
            ? await pdfDoc.embedJpg(bytes)
            : await pdfDoc.embedPng(bytes)
          imageCache.set(image.id, embedded as Awaited<ReturnType<PDFDocument['embedPng']>>)
        } catch (e) {
          throw new Error(`「${image.name}」の埋め込みに失敗しました: ${e instanceof Error ? e.message : e}`)
        }
      }

      drawImageOnPage(page, imageCache.get(image.id)!, slot, refill, setting, pageHeightPt)

      if (showHoleMarks) {
        drawHoleMarks(page, refill, slot, setting.holeSide, pageHeightPt)
      }
    } else if (showHoleMarks) {
      // 画像なしスロットにも穴マークを表示
      drawHoleMarks(page, refill, slot, defaultSetting.holeSide, pageHeightPt)
    }
  }
}

// ---------------------------------------------------------------------------
// PDF出力エントリポイント
// ---------------------------------------------------------------------------

export async function exportPdf(options: ExportPdfOptions): Promise<Uint8Array> {
  const { layouts, refill, imageSettings, defaultSetting, showCutLines, showHoleMarks } = options
  const pdfDoc = await PDFDocument.create()
  const imageCache = new Map<string, Awaited<ReturnType<PDFDocument['embedPng']>>>()

  for (const layout of layouts) {
    await drawPage(pdfDoc, layout, refill, imageSettings, defaultSetting, showCutLines, showHoleMarks, imageCache)
  }

  return pdfDoc.save()
}
