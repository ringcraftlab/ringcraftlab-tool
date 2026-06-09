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
    <main className="min-h-screen bg-[#fbf8f2] text-slate-900">

      {/* ヘッダー */}
      <header className="px-4 pt-5">
        <div className="mx-auto max-w-md">
          <p className="font-bold text-[1.1rem] text-[#31589a]">RingCraftLab</p>
          <p className="text-[11px] font-bold text-slate-500">Refill Maker</p>
        </div>
      </header>

      {/* ファーストビュー */}
      <section className="px-4 pt-6 pb-10">
        <div className="mx-auto max-w-md">
          <div className="relative overflow-hidden rounded-[28px] bg-[#eef2f8]">
            {/* ヒーロー画像 */}
            <img
              src="/hero-system-planner.png"
              alt="システム手帳にリフィルを挟んだイメージ"
              className="h-56 w-full object-cover object-center"
            />
            {/* テキストオーバーレイ */}
            <div className="px-6 py-6">
              <p className="text-[11px] font-bold tracking-[0.12em] text-blue-700">SMARTPHONE TO PLANNER</p>
              <h1 className="mt-2 text-[1.8rem] font-semibold leading-[1.1] text-slate-950">
                スマホの情報を、
                <br />
                そのまま手帳へ。
              </h1>
              <p className="mt-3 text-[13px] leading-6 text-slate-600">
                写真やスクリーンショットを、手帳用リフィルとして印刷できるPDFに変換します。登録不要。
              </p>
              <button
                type="button"
                onClick={() => navigate('/tool')}
                className="mt-5 flex h-12 w-full items-center justify-center rounded-[18px] bg-[#ffd24a] text-sm font-black text-slate-950 shadow-[0_16px_30px_rgba(255,210,74,0.28)]"
              >
                さっそく作ってみる
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 使用例 */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-md border-t border-[#e8e0d4] pt-8">
          <p className="text-[11px] font-bold tracking-[0.12em] text-blue-700">EXAMPLES</p>
          <h2 className="mt-1 text-[1.5rem] font-semibold leading-tight text-slate-950">
            こんなものを手帳に入れられます
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {exampleItems.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#e5ddcf] bg-white px-3 py-2 text-[12px] font-bold text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ステップ */}
      <section className="px-4 pb-12">
        <div className="mx-auto max-w-md border-t border-[#e8e0d4] pt-8">
          <p className="text-[11px] font-bold tracking-[0.12em] text-blue-700">HOW TO USE</p>
          <h2 className="mt-1 text-[1.5rem] font-semibold leading-tight text-slate-950">
            かんたん4ステップ
          </h2>
          <div className="mt-5 space-y-3">
            {steps.map((step) => (
              <div
                key={step.num}
                className="flex gap-4 rounded-[20px] border border-[#e7dfd2] bg-white px-4 py-4"
              >
                <span className="text-[1.4rem] font-black leading-none text-blue-200">{step.num}</span>
                <div>
                  <p className="font-bold text-slate-900">{step.label}</p>
                  <p className="mt-1 text-[12px] leading-5 text-slate-500">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 最後のCTA */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-md border-t border-[#e8e0d4] pt-8 text-center">
          <p className="text-[13px] leading-6 text-slate-600">
            A4で印刷して、切って、穴をあけて手帳に挟むだけ。
          </p>
          <button
            type="button"
            onClick={() => navigate('/tool')}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-[18px] bg-[#ffd24a] text-sm font-black text-slate-950 shadow-[0_16px_30px_rgba(255,210,74,0.22)]"
          >
            さっそく作ってみる
          </button>
        </div>
      </section>

    </main>
  )
}
