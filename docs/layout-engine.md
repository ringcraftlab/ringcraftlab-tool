# RingCraftLab リフィル作成ツール レイアウトエンジン設計

## 1. 目的

レイアウトエンジンは、選択された手帳サイズ、穴パターン、配置モード、出力用紙サイズに基づき、印刷用PDF上のリフィル配置を決定する役割を持つ。

本設計では、A4など特定の用紙サイズに固定した面付けではなく、用紙サイズとリフィルサイズの組み合わせから動的に面付けを計算する。

## 2. 基本方針

- リフィルは原寸で配置する
- 出力用紙の縦向き・横向きは自動決定する
- まず最大枚数配置を求める
- 余剰領域は外側余白やリフィル間隔として扱える構造を持つ
- 穴位置は穴パターンとして管理する
- プレビューとPDF生成は同じ配置データを参照する

## 3. リフィルサイズ定義

```ts
type RefillSize = {
  id: string
  label: string
  widthMm: number
  heightMm: number
  holePatternId: HolePatternId
}
```

初期対応サイズ：

| id | label | widthMm | heightMm | holePatternId |
|---|---|---:|---:|---|
| `mini5` | ミニ5 | 61 | 105 | `mini5` |
| `mini5-square` | ミニ5スクエア | 105 | 105 | `mini5` |
| `mini6` | ミニ6 | 80 | 126 | `mini6` |
| `bible` | バイブル | 95 | 170 | `bible` |
| `a5` | A5 | 148 | 210 | `a5` |

## 4. 穴パターン定義

```ts
type HolePatternId = 'mini5' | 'mini6' | 'bible' | 'a5' | 'none'

type HolePattern = {
  id: HolePatternId
  label: string
  holeCount: number
  centerOffsetsMm: number[]
  holeDiameterMm: number
  safetyZoneMm: number
  markerType: 'cross' | 'circle'
  markerSizeMm: number
}
```

## 5. 穴位置の考え方

穴位置は、リフィル上端からの絶対値ではなく、**リフィル高さの中央を基準としたオフセット値**として管理する。

穴中心Y座標は以下で求める。

```ts
holeCenterY = refillHeightMm / 2 + centerOffsetMm
```

これにより、カスタムサイズや派生サイズにも同じ穴パターンを適用しやすくする。

## 6. 穴パターン初期値

### 6.1 ミニ5

- 穴数：5
- 穴間隔：19mm
- 穴径：3.5〜4.0mm相当
- 穴回避エリア：8mm
- 初期マーカー：`+`

```ts
centerOffsetsMm = [-38, -19, 0, 19, 38]
```

### 6.2 ミニ6

- 穴数：6
- 穴間隔：19mm
- 中央間隔：19mm
- 穴径：4.0〜5.0mm相当
- 穴回避エリア：8mm
- 初期マーカー：`+`

```ts
centerOffsetsMm = [-47.5, -28.5, -9.5, 9.5, 28.5, 47.5]
```

### 6.3 バイブル

- 穴数：6
- 穴間隔：19mm
- 上下グループ間隔：51mm
- 穴径：5.0〜5.5mm相当
- 穴回避エリア：11mm
- 初期マーカー：`+`

```ts
centerOffsetsMm = [-63.5, -44.5, -25.5, 25.5, 44.5, 63.5]
```

### 6.4 A5

- 穴数：6
- 穴間隔：19mm
- 上下グループ間隔：70mm
- 穴径：5.5〜6.0mm相当
- 穴回避エリア：11mm
- 初期マーカー：`+`

```ts
centerOffsetsMm = [-73, -54, -35, 35, 54, 73]
```

## 7. 出力用紙サイズ定義

```ts
type PaperSize = {
  id: string
  label: string
  widthMm: number
  heightMm: number
}
```

初期対応：

| id | label | widthMm | heightMm |
|---|---|---:|---:|
| `a4` | A4 | 210 | 297 |

将来対応候補：

- A3
- A5

## 8. 用紙向きの自動決定

出力用紙の縦向き・横向きは自動決定とする。

比較候補：

- A4縦
- A4横

各候補について、配置可能な列数・行数・枚数を計算し、より多く入る向きを採用する。

同数の場合は以下を優先する。

- リフィルが縦長に無理なく収まる
- 余白の偏りが少ない
- 見た目が自然である

## 9. 面付け計算

### 9.1 基本計算

```ts
columns = Math.floor(paperWidthMm / refillWidthMm)
rows = Math.floor(paperHeightMm / refillHeightMm)
perPage = columns * rows
```

初期リリースでは最大枚数配置を基本とする。

### 9.2 余剰領域

配置後に余った領域は以下で求める。

```ts
remainWidthMm = paperWidthMm - refillWidthMm * columns
remainHeightMm = paperHeightMm - refillHeightMm * rows
```

この余剰領域は、将来的に以下の配分方式へ利用できる構造とする。

- 用紙端へ寄せる
- 外側余白として均等配分する
- リフィル間隔と外側余白へ配分する

初期リリースでは、最大枚数配置を優先し、配分方式は固定とする。

## 10. 画像配置モード

```ts
type ImageLayoutMode = 'avoid-ring' | 'full-bleed'
```

### 10.1 リングを避ける印刷

穴側の安全領域を除いた範囲に画像を配置する。

```ts
usableWidthMm = refillWidthMm - safetyZoneMm
```

穴側に応じて、画像配置開始位置を調整する。

### 10.2 全面印刷

リフィル全面に画像を配置する。  
端の欠けや重要部分の位置は、ユーザーがズーム・位置調整で補正する前提とする。

## 11. 画像の変換情報

画像ごとに以下の編集情報を持つ。

```ts
type ImageTransform = {
  scale: number
  offsetX: number
  offsetY: number
  rotation: 0 | 90 | 180 | 270
}
```

### 11.1 編集操作

- ズーム
- 位置調整
- 90度単位の回転
- リセット

## 12. 面付け対象データ

面付け前に、作成モードに応じて出力対象画像列を確定する。

```ts
type OutputItem = {
  sourceImageId: string
  refillSizeId: string
  transform: ImageTransform
}
```

### 12.1 複数の画像を並べる

- 画像1枚 = OutputItem 1件

### 12.2 1枚を複数作る

- 同じ画像を必要数展開して OutputItem 化する

## 13. ページ分割

総アイテム数と1ページあたりの配置枚数からページ数を自動計算する。

```ts
pageCount = Math.ceil(totalItems / perPage)
```

ページごとに、配置順にアイテムを割り当てる。

```ts
page0 = items.slice(0, perPage)
page1 = items.slice(perPage, perPage * 2)
...
```

## 14. 出力順

- 配置順はアップロード順を初期値とする
- ユーザーが長押しドラッグで並び替え可能（実装済み）
- 複数ページでも順序は保持する

## 15. プレビュー用配置データ

プレビューとPDF生成は、同じ配置データを参照する。

```ts
type Placement = {
  pageIndex: number
  itemIndex: number
  xMm: number
  yMm: number
  widthMm: number
  heightMm: number
  refillSizeId: string
  holePatternId: HolePatternId
  imageLayoutMode: ImageLayoutMode
  transform: ImageTransform
}
```

## 16. プレビュー描画

プレビューはCanvas APIで描画する。

描画対象：

- 用紙
- リフィル外形
- カット線
- 穴位置マーク
- 画像
- 現在ページ番号

mm単位の配置を画面pxへ変換して描画する。

## 17. PDF描画

PDF生成は pdf-lib を使用し、配置データをもとに直接描画する。

描画対象：

- リフィル外形
- カット線
- 穴位置マーク
- 配置済み画像

プレビュー用DOMをキャプチャしてPDF化する方式は採用しない。

## 18. 印刷時の前提

- PDFは原寸印刷を前提とする
- 用紙に合わせる縮小は許容しない
- フチなし印刷でも外周が欠ける可能性がある
- 固定の端切れ注意エリアは初期リリースでは持たない
- ユーザーがズームや位置調整で重要部分を内側へ寄せる前提とする

## 19. 将来拡張

- A3、A5出力
- カスタムサイズ
- 余白配分方式の切り替え
- 確認スケール
- 並び替え
- 穴位置マークの円表示
- サイズ別の高度な端切れ注意領域
- 個別部数指定UI
