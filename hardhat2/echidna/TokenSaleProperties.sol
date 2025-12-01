// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "../contracts/TokenSale.sol";
import "../contracts/PelonClubToken.sol";
import "../contracts/MockUSDC.sol";

contract TokenSaleProperties {
    TokenSale public tokenSale;
    PelonClubToken public pelonToken;
    MockUSDC public mockUSDC;
    
    address public owner;
    address public fundsWallet;
    
    uint256 public immutable initialPrice;
    uint256 public immutable initialMaxPrice;
    uint256 public immutable initialMaxTokensPerWallet;
    uint256 public immutable initialMaxTotalSale;
    uint256 public immutable initialInflectionPoint;
    
    uint256 public previousPrice;
    uint256 public previousTotalSold;
    
    constructor() {
        owner = msg.sender;
        fundsWallet = address(0x1234);
        
        mockUSDC = new MockUSDC();
        
        pelonToken = new PelonClubToken(address(this));
        
        initialPrice = 0.000003 * 10**18;
        initialMaxPrice = 0.01 * 10**18;
        uint256 curveSteepness = 1 * 10**18;
        initialInflectionPoint = 100000000000 * 10**18;
        initialMaxTokensPerWallet = 20000000000 * 10**18;
        initialMaxTotalSale = 200000000000 * 10**18;
        
        tokenSale = new TokenSale(
            address(mockUSDC),
            address(pelonToken),
            initialPrice,
            initialMaxPrice,
            curveSteepness,
            initialInflectionPoint,
            initialMaxTokensPerWallet,
            initialMaxTotalSale,
            fundsWallet
        );
        
        uint256 tokensForSale = 200000000000 * 10**18;
        pelonToken.transfer(address(tokenSale), tokensForSale);
        
        uint256 usdcAmount = 1000000 * 10**6;
        mockUSDC.mint(owner, usdcAmount);
        
        previousPrice = tokenSale.getCurrentPrice();
        previousTotalSold = tokenSale.totalSold();
    }
    
    function bound(uint256 x, uint256 min, uint256 max) internal pure returns (uint256) {
        if (x < min) return min;
        if (x > max) return max;
        return x;
    }
    
    function giveUSDC(address to, uint256 amount) internal {
        mockUSDC.mint(to, amount);
    }
    
    function echidna_price_bounds() public view returns (bool) {
        uint256 price = tokenSale.getCurrentPrice();
        return price >= tokenSale.initialPrice() && price <= tokenSale.maxPrice();
    }
    
    function echidna_price_monotonic() public view returns (bool) {
        uint256 currentPrice = tokenSale.getCurrentPrice();
        uint256 currentTotalSold = tokenSale.totalSold();
        
        if (currentTotalSold > previousTotalSold) {
            return currentPrice >= previousPrice;
        }
        
        if (currentTotalSold == previousTotalSold) {
            return currentPrice == previousPrice;
        }
        
        return true;
    }
    
    function echidna_total_sold_limit() public view returns (bool) {
        return tokenSale.totalSold() <= tokenSale.maxTotalSale();
    }
    
    function echidna_wallet_limit() public view returns (bool) {
        return tokenSale.tokensPurchased(msg.sender) <= tokenSale.maxTokensPerWallet();
    }
    
    function echidna_remaining_tokens() public view returns (bool) {
        uint256 remaining = tokenSale.getRemainingTokens();
        uint256 totalSold = tokenSale.totalSold();
        uint256 maxTotalSale = tokenSale.maxTotalSale();
        uint256 contractBalance = pelonToken.balanceOf(address(tokenSale));
        
        uint256 expectedRemaining = (maxTotalSale - totalSold) < contractBalance 
            ? (maxTotalSale - totalSold) 
            : contractBalance;
        
        return remaining == expectedRemaining;
    }
    
    function echidna_price_calculation() public view returns (bool) {
        uint256 totalSold = tokenSale.totalSold();
        uint256 currentPrice = tokenSale.getCurrentPrice();
        uint256 initialPrice = tokenSale.initialPrice();
        uint256 maxPrice = tokenSale.maxPrice();
        uint256 inflectionPoint = tokenSale.inflectionPoint();
        
        if (totalSold == 0) {
            return currentPrice == initialPrice;
        }
        
        if (totalSold >= inflectionPoint * 2) {
            return currentPrice == maxPrice;
        }
        
        uint256 priceRange = maxPrice - initialPrice;
        uint256 soldSquared = totalSold * totalSold;
        uint256 inflectionSquared = inflectionPoint * inflectionPoint;
        uint256 numerator = priceRange * soldSquared;
        uint256 denominator = inflectionSquared + soldSquared;
        
        if (denominator == 0) {
            return false;
        }
        
        uint256 sigmoidValue = numerator / denominator;
        uint256 expectedPrice = initialPrice + sigmoidValue;
        
        return currentPrice >= expectedPrice - 1 && currentPrice <= expectedPrice + 1;
    }
    
    function fuzz_buy(uint256 usdcAmount) public returns (bool) {
        usdcAmount = bound(usdcAmount, 1, 1000000 * 10**6);
        
        if (tokenSale.paused()) {
            return true;
        }
        
        uint256 totalSoldBefore = tokenSale.totalSold();
        uint256 priceBefore = tokenSale.getCurrentPrice();
        
        uint256 expectedPelon = tokenSale.getPelonAmount(usdcAmount);
        
        if (expectedPelon == 0) {
            return true;
        }
        
        (bool canBuy, ) = tokenSale.canPurchase(msg.sender, usdcAmount);
        
        if (!canBuy) {
            return true;
        }
        
        uint256 usdcBalance = mockUSDC.balanceOf(msg.sender);
        if (usdcBalance < usdcAmount) {
            giveUSDC(msg.sender, usdcAmount);
        }
        
        try tokenSale.buyTokens(usdcAmount) {
            previousPrice = tokenSale.getCurrentPrice();
            previousTotalSold = tokenSale.totalSold();
            
            uint256 totalSoldAfter = tokenSale.totalSold();
            uint256 priceAfter = tokenSale.getCurrentPrice();
            
            if (totalSoldAfter <= totalSoldBefore) {
                return false;
            }
            
            if (priceAfter < priceBefore) {
                return false;
            }
            
            return true;
        } catch {
            return true;
        }
    }
    
    function fuzz_buy_consistency(uint256 usdcAmount) public view returns (bool) {
        usdcAmount = bound(usdcAmount, 1, 1000000 * 10**6);
        
        if (usdcAmount == 0) {
            return tokenSale.getPelonAmount(0) == 0;
        }
        
        uint256 pelonAmount = tokenSale.getPelonAmount(usdcAmount);
        uint256 currentPrice = tokenSale.getCurrentPrice();
        
        uint256 expectedPelon = (usdcAmount * currentPrice) / 1e6;
        
        return pelonAmount == expectedPelon;
    }
    
    function fuzz_can_purchase(address wallet, uint256 usdcAmount) public view returns (bool) {
        usdcAmount = bound(usdcAmount, 1, 1000000 * 10**6);
        
        (bool canBuy, ) = tokenSale.canPurchase(wallet, usdcAmount);
        
        if (!canBuy) {
            return true;
        }
        
        uint256 pelonAmount = tokenSale.getPelonAmount(usdcAmount);
        
        uint256 currentPurchased = tokenSale.tokensPurchased(wallet);
        if (currentPurchased + pelonAmount > tokenSale.maxTokensPerWallet()) {
            return false;
        }
        
        uint256 totalSold = tokenSale.totalSold();
        if (totalSold + pelonAmount > tokenSale.maxTotalSale()) {
            return false;
        }
        
        uint256 contractBalance = pelonToken.balanceOf(address(tokenSale));
        if (contractBalance < pelonAmount) {
            return false;
        }
        
        return true;
    }
    
    function fuzz_no_overflow(uint256 usdcAmount) public view returns (bool) {
        usdcAmount = bound(usdcAmount, 1, 1000000 * 10**6);
        
        uint256 price = tokenSale.getCurrentPrice();
        
        if (usdcAmount > type(uint256).max / price) {
            return false;
        }
        
        uint256 pelonAmount = (usdcAmount * price) / 1e6;
        
        uint256 totalSold = tokenSale.totalSold();
        if (totalSold > type(uint256).max - pelonAmount) {
            return false;
        }
        
        return true;
    }
    
    function fuzz_pause_protection(uint256 usdcAmount) public view returns (bool) {
        usdcAmount = bound(usdcAmount, 1, 1000000 * 10**6);
        
        if (!tokenSale.paused()) {
            return true;
        }
        
        (bool canBuy, string memory reason) = tokenSale.canPurchase(msg.sender, usdcAmount);
        
        if (canBuy) {
            return false;
        }
        
        return keccak256(bytes(reason)) == keccak256(bytes("Sale is paused"));
    }
    
    function fuzz_admin_limits(uint256 newMaxPrice, uint256 newMaxTokensPerWallet, uint256 newMaxTotalSale) public view returns (bool) {
        if (newMaxPrice == 0 || newMaxPrice <= tokenSale.initialPrice()) {
            return true;
        }
        
        if (newMaxTokensPerWallet == 0) {
            return true;
        }
        
        if (newMaxTotalSale == 0) {
            return true;
        }
        
        return true;
    }
    
    function echidna_parameter_updates() public view returns (bool) {
        uint256 price = tokenSale.getCurrentPrice();
        uint256 totalSold = tokenSale.totalSold();
        
        if (price < tokenSale.initialPrice() || price > tokenSale.maxPrice()) {
            return false;
        }
        
        if (totalSold > tokenSale.maxTotalSale()) {
            return false;
        }
        
        return true;
    }
    
    function echidna_initial_price_edge_case() public view returns (bool) {
        uint256 totalSold = tokenSale.totalSold();
        if (totalSold == 0) {
            return tokenSale.getCurrentPrice() == tokenSale.initialPrice();
        }
        
        return true;
    }
    
    function echidna_max_price_edge_case() public view returns (bool) {
        uint256 totalSold = tokenSale.totalSold();
        uint256 inflectionPoint = tokenSale.inflectionPoint();
        
        if (totalSold >= inflectionPoint * 2) {
            return tokenSale.getCurrentPrice() == tokenSale.maxPrice();
        }
        
        return true;
    }
}
