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

      {/* ヒーロー */}
      <section className="px-5 pt-2 pb-8">
        <div className="mx-auto max-w-md">

          {/* テキストブロック */}
          <p className="text-[10px] font-bold tracking-[0.14em] text-blue-600 mb-2">SMARTPHONE → PLANNER PDF</p>
          <h1 className="text-[1.75rem] font-bold leading-[1.25] text-slate-900 mb-3">
            スマホの写真を、<br />手帳リフィルに。
          </h1>
          <p className="text-[13px] leading-6 text-slate-500 mb-5">
            写真・スクリーンショットをアップロードするだけ。<br />
            A4に自動で面付けしてPDF出力、切って挟むだけです。
          </p>
          <button
            type="button"
            onClick={() => navigate('/tool')}
            className="flex h-12 w-full items-center justify-center rounded-[16px] bg-[#ffd24a] text-[14px] font-bold text-slate-900 shadow-[0_8px_20px_rgba(255,210,74,0.35)] mb-5"
          >
            さっそく作ってみる →
          </button>

          {/* ヒーロー画像 */}
          <div className="rounded-[20px] overflow-hidden">
            <img
              src={`${import.meta.env.BASE_URL}hero-system-planner.png`}
              alt="システム手帳にリフィルを挟んだイメージ"
              className="block w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* 使用例 */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-md border-t border-[#e8e0d4] pt-7">
          <p className="text-[10px] font-bold tracking-[0.14em] text-blue-600 mb-1">EXAMPLES</p>
          <h2 className="text-[1.2rem] font-bold text-slate-800 mb-4">
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
          <h2 className="text-[1.2rem] font-bold text-slate-800 mb-4">かんたん4ステップ</h2>
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-4 rounded-[16px] bg-white border border-[#ede6da] px-4 py-3"
              >
                <span className="text-[1.2rem] font-black leading-tight text-[#ffd24a] min-w-[2rem]">{step.num}</span>
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
