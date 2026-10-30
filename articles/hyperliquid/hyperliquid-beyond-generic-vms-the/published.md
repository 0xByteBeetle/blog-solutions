# Published examples

Source: https://andreyobruchkov1996.substack.com/p/hyperliquid-beyond-generic-vms-the

Captured 2026-10-30T15:05:23.626Z from the live rendered article. Native code/command/output blocks are preserved exactly, including whitespace; full article prose and images are not copied here. Outputs are historical observations, not live fixtures. Commands may target public networks; do not execute blindly.

## Block 1

SHA-256: `72b1ebf84d7b714edefb9b2f76c6a95dc8528a4df3fd8f3c756e0c9716e69cfd`

````text
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
````

## Block 2

SHA-256: `a8822ff62995c006ec717e123c8901f3d1db77224b0fd6ae6936235b666369a7`

````text
{
  "action": {
    "type": "approveAgent",
    "hyperliquidChain": "Mainnet",
    "signatureChainId": "0xa4b1", // Arbitrum One
    "agentAddress": "0xYourGeneratedAgentPublicKey...",
    "agentName": "0xByteBeetle_GridBot_v1"
  },
  "nonce": 1713563456000,
  "signature": "0xSignatureFromMainL1Wallet..."
}
````
