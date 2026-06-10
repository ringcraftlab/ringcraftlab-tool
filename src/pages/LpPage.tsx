import { useNavigate } from 'react-router-dom'

const exampleItems = [
  '学校のお知らせ',
  '習い事の予定',
  '地図・アクセス',
  '予約情報',
  '家族の予定・写真',
  'レシピ・メモ',
]

const steps = [
  { num: '01', label: '画像を選ぶ', detail: '写真やスクリーンショットをそのままアップロード' },
  { num: '02', label: 'サイズ・設定を選ぶ', detail: 'ミニ5〜A5まで対応。左穴・右穴も切り替え可能' },
  { num: '03', label: '調整する', detail: 'ズーム・位置・回転で収まりを整える' },
  { num: '04', label: 'PDFを作って印刷', detail: 'A4に自動で面付けしてPDF出力。あとは切って挟むだけ' },
]

export function LpPage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-[#fbf8f2] text-slate-800">

      {/* ヘッダー */}
      <header className="px-5 pt-5 pb-3">
        <div className="mx-auto max-w-md flex items-baseline gap-2">
          <p className="font-bold text-[1rem] text-[#31589a] tracking-tight">RingCraftLab</p>
          <p className="text-[11px] text-slate-400">Refill Maker</p>
        </div>
      </header>

      {/* ヒーロー：画像固定高さ＋オーバーレイ */}
      <section className="px-5 pt-2 pb-10">
        <div className="mx-auto max-w-md">
          <div className="relative rounded-[24px] overflow-hidden" style={{ height: '260px' }}>
            {/* 背景画像（object-cover で固定高さに収める） */}
            <img
              src={`${import.meta.env.BASE_URL}hero-system-planner.png`}
              alt="システム手帳にリフィルを挟んだイメージ"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* 左側グラデーション */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,248,242,0.97)_0%,rgba(251,248,242,0.88)_55%,rgba(251,248,242,0.0)_100%)]" />

            {/* テキスト＆ボタン */}
            <div className="absolute inset-y-0 left-0 w-[58%] flex flex-col justify-between p-5">
              <div>
                <p className="text-[9px] font-bold tracking-[0.12em] text-blue-700">SMARTPHONE TO PLANNER</p>
                <h1 className="mt-2 text-[1.4rem] font-bold leading-[1.2] text-slate-900">
                  スマホの写真を、<br />手帳リフィルに。
                </h1>
                <p className="mt-1.5 text-[11px] leading-[1.6] text-slate-500">
                  撮ってアップ、<br />切って挟むだけ。
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/tool')}
                className="flex h-10 w-full items-center justify-center rounded-[12px] bg-[#ffd24a] text-[12px] font-bold text-slate-900 shadow-[0_8px_20px_rgba(255,210,74,0.4)]"
              >
                作ってみる →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 使用例 */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-md border-t border-[#e8e0d4] pt-7">
          <p className="text-[10px] font-bold tracking-[0.14em] text-blue-600 mb-1">EXAMPLES</p>
          <h2 className="text-[1.15rem] font-bold text-slate-800 mb-4">
            こんなものを手帳に入れられます
          </h2>
          <div className="flex flex-wrap gap-2">
            {exampleItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#e5ddcf] bg-white px-3 py-1.5 text-[12px] text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ステップ */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-md border-t border-[#e8e0d4] pt-7">
          <p className="text-[10px] font-bold tracking-[0.14em] text-blue-600 mb-1">HOW TO USE</p>
          <h2 className="text-[1.15rem] font-bold text-slate-800 mb-4">かんたん4ステップ</h2>
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-4 rounded-[16px] bg-white border border-[#ede6da] px-4 py-3"
              >
                <span className="text-[1.1rem] font-black leading-tight text-[#ffd24a] min-w-[2rem]">{step.num}</span>
                <div>
                  <p className="text-[13px] font-bold text-slate-800">{step.label}</p>
                  <p className="text-[11px] leading-5 text-slate-500 mt-0.5">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最後のCTA */}
      <section className="px-5 pb-16">
        <div className="mx-auto max-w-md border-t border-[#e8e0d4] pt-7">
          <button
            type="button"
            onClick={() => navigate('/tool')}
            className="flex h-12 w-full items-center justify-center rounded-[16px] bg-[#ffd24a] text-[14px] font-bold text-slate-900 shadow-[0_8px_20px_rgba(255,210,74,0.28)]"
          >
            さっそく作ってみる →
          </button>
        </div>
      </section>

    </main>
  )
}
