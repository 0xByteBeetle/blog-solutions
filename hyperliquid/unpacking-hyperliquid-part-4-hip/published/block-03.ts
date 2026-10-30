type RegisterAsset2 = {
  maxGas?: number
  assetRequest: {
    coin: string
    szDecimals: number
    oraclePx: string
    marginTableId: number
    marginMode: "strictIsolated" | "noCross" | "normal"
  }
  dex: string
  schema?: {
    fullName: string
    collateralToken: number
    oracleUpdater?: string
  }
}