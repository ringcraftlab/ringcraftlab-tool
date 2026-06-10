import { useNavigate } from 'react-router-dom'

const exampleItems = [
  { icon: '📷', label: '旅行の記録' },
  { icon: '👶', label: '子どもの成長記録' },
  { icon: '🍳', label: 'レシピノート' },
  { icon: '📚', label: '読書メモ' },
  { icon: '⭐', label: '推し活の記録' },
  { icon: '💼', label: '仕事の記録' },
]

const steps = [
  { num: 1, label: '写真をアップロード', detail: 'スマホの写真やスクショを追加します' },
  { num: 2, label: 'リフィルサイズを選択', detail: 'お使いの手帳に合わせて選びます' },
  { num: 3, label: 'レイアウトを選択', detail: '並べる or 繰り返すを選びます' },
  { num: 4, label: 'プレビューしてPDF出力', detail: 'A4に最適配置してPDFを作成！' },
]

export function LpPage() {
  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-[#fbf8f2] text-slate-800">

      {/* ヘッダー */}
      <header className="px-5 pt-5 pb-4">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <div>
            <p className="font-bold text-[1.05rem] text-slate-900 tracking-tight">RingCraftLab</p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Refill Maker</p>
          </div>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="px-5 pb-8">
        <div className="mx-auto max-w-md">
          {/* テキスト */}
          <h1 className="text-[2rem] font-bold leading-[1.25] text-slate-900 mb-2">
            スマホの写真を、<br />手帳リフィルに。
          </h1>
          <p className="text-[13px] leading-6 text-slate-500 mb-5">
            思い出もメモも、きれいに整理。<br />
            システム手帳用のリフィルPDFを<br />
            かんたんに作成できます。
          </p>
          <button
            type="button"
            onClick={() => navigate('/tool')}
            className="flex h-12 w-full items-center justify-center rounded-[14px] bg-[#ffd24a] text-[15px] font-bold text-slate-900 shadow-[0_8px_24px_rgba(255,210,74,0.45)] mb-5"
          >
            リフィルを作成する →
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
        <div className="mx-auto max-w-md">
          <h2 className="text-[1rem] font-bold text-slate-700 mb-4 text-center">こんな使い方に</h2>
          <div className="grid grid-cols-2 gap-2">
            {exampleItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-[12px] bg-white border border-[#ede6da] px-3 py-2.5"
              >
                <span className="text-[16px]">{item.icon}</span>
                <span className="text-[12px] font-bold text-slate-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ステップ */}
      <section className="px-5 pb-10">
        <div className="mx-auto max-w-md">
          <h2 className="text-[1rem] font-bold text-slate-700 mb-5 text-center">使い方はかんたん4ステップ</h2>
          <div className="relative">
            {/* 縦線 */}
            <div className="absolute left-[19px] top-[28px] bottom-[28px] w-[2px] bg-[#f0e8d8]" />
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.num} className="flex items-start gap-4 relative">
                  <div className="w-10 h-10 rounded-full bg-[#ffd24a] flex items-center justify-center flex-shrink-0 font-black text-[14px] text-slate-900 shadow-[0_4px_12px_rgba(255,210,74,0.4)] z-10">
                    {step.num}
                  </div>
                  <div className="flex-1 bg-white border border-[#ede6da] rounded-[14px] px-4 py-3">
                    <p className="text-[13px] font-bold text-slate-800">{step.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-5">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 最後のCTA */}
      <section className="px-5 pb-16">
        <div className="mx-auto max-w-md">
          <p className="text-center text-[13px] text-slate-500 mb-4">さあ、あなただけのリフィルを作ろう！</p>
          <button
            type="button"
            onClick={() => navigate('/tool')}
            className="flex h-12 w-full items-center justify-center rounded-[14px] bg-[#ffd24a] text-[15px] font-bold text-slate-900 shadow-[0_8px_24px_rgba(255,210,74,0.35)]"
          >
            リフィルを作成する →
          </button>
        </div>
      </section>

    </main>
  )
}
