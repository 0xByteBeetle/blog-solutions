use serde::{Deserialize, Serialize};

// The root state object returned by the L1 Clearinghouse
#[derive(Serialize, Deserialize, Debug)]
pub struct ClearinghouseState {
    #[serde(rename = "marginSummary")]
    pub margin_summary: MarginSummary,
    
    #[serde(rename = "crossMarginSummary")]
    pub cross_margin_summary: MarginSummary,
    
    #[serde(rename = "crossMaintenanceMarginUsed")]
    pub cross_maintenance_margin_used: String,
    
    pub withdrawable: String,
    
    // The unified array of all active market positions
    #[serde(rename = "assetPositions")]
    pub asset_positions: Vec<AssetPosition>,
    
    pub time: u64,
}

// Global risk parameters calculated natively in memory by the node
#[derive(Serialize, Deserialize, Debug)]
pub struct MarginSummary {
    #[serde(rename = "accountValue")]
    pub account_value: String,      // Total portfolio value (Spot + Perp PnL)
    #[serde(rename = "totalNtlPos")]
    pub total_ntl_pos: String,      // Total notional position size
    #[serde(rename = "totalRawUsd")]
    pub total_raw_usd: String,      // Raw USDC balance
    #[serde(rename = "totalMarginUsed")]
    pub total_margin_used: String,  // Aggregate margin locked
}

// An individual position object within the state
#[derive(Serialize, Deserialize, Debug)]
pub struct AssetPosition {
    pub position: Position,
    #[serde(rename = "type")]
    pub position_type: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Position {
    pub coin: String,         // Asset ticker (e.g., "BTC")
    pub szi: String,          // Size of the position
    pub leverage: Leverage,   
    #[serde(rename = "entryPx")]
    pub entry_px: String,     // Entry Price
    #[serde(rename = "positionValue")]
    pub position_value: String,
    #[serde(rename = "unrealizedPnl")]
    pub unrealized_pnl: String,
    #[serde(rename = "marginUsed")]
    pub margin_used: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Leverage {
    #[serde(rename = "type")]
    pub leverage_type: String,
    pub value: u32,
}