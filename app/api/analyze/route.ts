import { NextRequest, NextResponse } from 'next/server'
import { callQwen, extractJSON } from '@/lib/qwen'
import { ProductAnalysis } from '@/lib/types'

function toStr(val: unknown): string {
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  if (Array.isArray(val)) return val.filter(Boolean).join('、')
  return ''
}

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((item) => {
      if (typeof item === 'string') return item
      if (typeof item === 'object' && item !== null) {
        const strVals = Object.values(item as Record<string, unknown>)
          .filter((v): v is string => typeof v === 'string')
        return strVals[0] ?? ''
      }
      return String(item)
    }).filter(Boolean)
  }
  if (typeof val === 'string') return [val]
  return []
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { keyword } = body as { keyword: string }

    if (!keyword?.trim()) {
      return NextResponse.json(
        { success: false, error: '请输入商品关键词' },
        { status: 400 }
      )
    }

    const prompt = `你是跨境电商选品专家。请对关键词"${keyword.trim()}"进行深度选品分析。

请只返回以下格式的JSON，不要其他文字：
{
  "marketScore": 市场机会评分数字0到100,
  "demandTrend": "需求趋势描述，如上升/稳定/下降及原因，50字内",
  "competitionLevel": "竞争强度，如低/中/高，并说明原因，30字内",
  "targetAudience": "目标人群描述，30字内",
  "coreSellingPoints": ["核心卖点1", "核心卖点2", "核心卖点3"],
  "recommendedPlatforms": "推荐平台，如Amazon/Shopee/TikTok Shop，并说明理由，40字内",
  "riskWarning": "风险提示，如侵权/关税/季节性等，50字内",
  "buyerPainPoints": ["买家痛点1", "买家痛点2", "买家痛点3"],
  "buyerPraise": ["买家好评点1", "买家好评点2", "买家好评点3"],
  "unmetNeeds": "市场上还没有被满足的需求，50字内",
  "differentiationAngle": "新卖家差异化切入的最佳角度，50字内"
}`

    const rawResponse = await callQwen([
      { role: 'user', content: prompt },
    ])

    const raw = extractJSON(rawResponse) as Record<string, unknown>

    const result: ProductAnalysis = {
      keyword: keyword.trim(),
      marketScore: Math.min(100, Math.max(0, Math.round(Number(raw.marketScore) || 50))),
      demandTrend: toStr(raw.demandTrend) || '数据获取中',
      competitionLevel: toStr(raw.competitionLevel) || '中等',
      targetAudience: toStr(raw.targetAudience) || '通用人群',
      coreSellingPoints: toStringArray(raw.coreSellingPoints).slice(0, 3),
      recommendedPlatforms: toStr(raw.recommendedPlatforms) || 'Amazon',
      riskWarning: toStr(raw.riskWarning) || '请注意平台规则',
      buyerPainPoints: toStringArray(raw.buyerPainPoints).slice(0, 3),
      buyerPraise: toStringArray(raw.buyerPraise).slice(0, 3),
      unmetNeeds: toStr(raw.unmetNeeds) || '暂无数据',
      differentiationAngle: toStr(raw.differentiationAngle) || '暂无数据',
    }

    if (result.coreSellingPoints.length === 0) {
      result.coreSellingPoints = ['品质优良', '性价比高', '发货快速']
    }
    if (result.buyerPainPoints.length === 0) {
      result.buyerPainPoints = ['价格偏高', '品质参差不齐', '售后服务不稳定']
    }
    if (result.buyerPraise.length === 0) {
      result.buyerPraise = ['使用方便', '性价比高', '发货速度快']
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('选品分析API错误:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '分析失败，请重试' },
      { status: 500 }
    )
  }
}
