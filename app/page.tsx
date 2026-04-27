'use client'

import { useState } from 'react'
import { Search, Loader2, TrendingUp, Users, ShoppingBag, AlertTriangle, Star, Globe } from 'lucide-react'
import type { ProductAnalysis } from '@/lib/types'

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-red-500'
  const label =
    score >= 70 ? '优质机会' : score >= 40 ? '一般机会' : '机会较少'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-6xl font-black ${color}`}>{score}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
      <div className="text-xs text-gray-400">市场机会评分 / 100</div>
    </div>
  )
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-gray-500 text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-gray-800 text-sm leading-relaxed">{value}</p>
    </div>
  )
}

export default function Home() {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProductAnalysis | null>(null)
  const [error, setError] = useState('')

  async function handleAnalyze() {
    if (!keyword.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error || '分析失败')
      setResult(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-gray-900 text-lg">跨境选品分析师</span>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            Powered by Qwen
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-3">
            输入关键词，秒出选品报告
          </h1>
          <p className="text-gray-500 text-base">
            AI 分析市场机会、竞争强度、目标人群，帮你找到跨境爆款
          </p>
        </div>

        {/* 搜索框 */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleAnalyze()}
            placeholder="输入商品关键词，如：无线耳机、瑜伽垫、LED台灯..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !keyword.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {loading ? '分析中...' : '开始分析'}
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* 结果报告 */}
        {result && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 标题 + 评分 */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="text-sm text-gray-500 mb-1">
                关键词：<span className="font-semibold text-gray-900">「{result.keyword}」</span>
              </div>
              <div className="my-4">
                <ScoreRing score={result.marketScore} />
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    result.marketScore >= 70
                      ? 'bg-emerald-500'
                      : result.marketScore >= 40
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${result.marketScore}%` }}
                />
              </div>
            </div>

            {/* 信息卡片 2列 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoCard
                icon={<TrendingUp className="w-4 h-4" />}
                label="需求趋势"
                value={result.demandTrend}
              />
              <InfoCard
                icon={<Search className="w-4 h-4" />}
                label="竞争强度"
                value={result.competitionLevel}
              />
              <InfoCard
                icon={<Users className="w-4 h-4" />}
                label="目标人群"
                value={result.targetAudience}
              />
              <InfoCard
                icon={<Globe className="w-4 h-4" />}
                label="推荐平台"
                value={result.recommendedPlatforms}
              />
            </div>

            {/* 核心卖点 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3 text-gray-700 font-semibold">
                <Star className="w-4 h-4 text-amber-500" />
                核心卖点
              </div>
              <div className="space-y-2">
                {result.coreSellingPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 风险提示 */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-2 text-amber-700 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4" />
                风险提示
              </div>
              <p className="text-amber-800 text-sm leading-relaxed">{result.riskWarning}</p>
            </div>

            {/* 买家洞察 */}
            <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
              <div className="flex items-center gap-2 mb-4 text-purple-700 font-semibold">
                <Users className="w-4 h-4" />
                买家洞察
              </div>
              {/* 痛点 + 好评并排 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <div className="text-xs font-semibold text-purple-500 mb-2 uppercase tracking-wide">买家痛点</div>
                  <div className="space-y-2">
                    {result.buyerPainPoints.map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-red-100 text-red-500 text-xs font-bold flex items-center justify-center mt-0.5">!</span>
                        <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <div className="text-xs font-semibold text-purple-500 mb-2 uppercase tracking-wide">买家好评点</div>
                  <div className="space-y-2">
                    {result.buyerPraise.map((point, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-4 h-4 rounded-full bg-green-100 text-green-500 text-xs font-bold flex items-center justify-center mt-0.5">✓</span>
                        <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* 未被满足需求 + 差异化角度并排 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <div className="text-xs font-semibold text-purple-500 mb-2 uppercase tracking-wide">未被满足的需求</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{result.unmetNeeds}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-purple-100">
                  <div className="text-xs font-semibold text-purple-500 mb-2 uppercase tracking-wide">差异化切入角度</div>
                  <p className="text-sm text-gray-700 leading-relaxed">{result.differentiationAngle}</p>
                </div>
              </div>
            </div>

            {/* 重新分析 */}
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  setResult(null)
                  setKeyword('')
                }}
                className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
              >
                分析新关键词
              </button>
            </div>
          </div>
        )}

        {/* 空状态提示词 */}
        {!result && !loading && !error && (
          <div className="text-center text-gray-400 text-sm mt-8 space-y-2">
            <p>试试这些热门品类：</p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {['无线耳机', '瑜伽垫', 'LED台灯', '保温杯', '宠物玩具', '蓝牙音箱'].map((kw) => (
                <button
                  key={kw}
                  onClick={() => setKeyword(kw)}
                  className="bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-600 text-xs px-3 py-1.5 rounded-full transition-colors"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
