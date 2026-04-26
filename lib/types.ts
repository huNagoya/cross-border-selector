export interface ProductAnalysis {
  keyword: string
  marketScore: number          // 市场机会评分 0-100
  demandTrend: string          // 需求趋势
  competitionLevel: string     // 竞争强度
  targetAudience: string       // 目标人群
  coreSellingPoints: string[]  // 核心卖点（3条）
  recommendedPlatforms: string // 推荐平台
  riskWarning: string          // 风险提示
}
