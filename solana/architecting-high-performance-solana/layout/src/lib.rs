use anchor_lang::prelude::*;
use bytemuck::{Pod, Zeroable};
use std::mem::{size_of, align_of};

#[repr(C)]
#[derive(Default, Debug, Clone, Copy, Pod, Zeroable)]
pub struct MarketState {
    pub version: u8,
    pub _padding1: [u8; 7], 
    pub volume: u64,
    pub is_active: u8,      // Use u8 instead of bool: 0 = false, 1 = true
    pub _padding2: [u8; 7], 
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memory_layout() {
        let state = MarketState {
            version: 1,
            volume: 100,
            is_active: 1,
            ..Default::default()
        };

        println!("\n--- Memory Analysis ---");
        println!("Total Size: {} bytes", size_of::<MarketState>());
        println!("Alignment:  {} bytes", align_of::<MarketState>());
        println!("-----------------------");

        let bytes = bytemuck::bytes_of(&state);
        
        println!("Byte Map (Hex):");
        for (i, chunk) in bytes.chunks(8).enumerate() {
            println!("Row {}: {:02X?}", i, chunk);
        }
        println!("-----------------------\n");
    }
}
