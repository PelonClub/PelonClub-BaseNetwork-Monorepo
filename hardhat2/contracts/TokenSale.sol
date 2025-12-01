/*
 /$$$$$$$           /$$                            /$$$$$$  /$$           /$$      
| $$__  $$         | $$                           /$$__  $$| $$          | $$      
| $$  \ $$ /$$$$$$ | $$  /$$$$$$  /$$$$$$$       | $$  \__/| $$ /$$   /$$| $$$$$$$ 
| $$$$$$$//$$__  $$| $$ /$$__  $$| $$__  $$      | $$      | $$| $$  | $$| $$__  $$
| $$____/| $$$$$$$$| $$| $$  \ $$| $$  \ $$      | $$      | $$| $$  | $$| $$  \ $$
| $$     | $$_____/| $$| $$  | $$| $$  | $$      | $$    $$| $$| $$  | $$| $$  | $$
| $$     |  $$$$$$$| $$|  $$$$$$/| $$  | $$      |  $$$$$$/| $$|  $$$$$$/| $$$$$$$/
|__/      \_______/|__/ \______/ |__/  |__/       \______/ |__/ \______/ |_______/ 

@title TokenSale
@author baeza.eth (King Of The Pelones)
@notice Token Sale Contract for PelonClubToken - Allows users to purchase PELON tokens using USDC
@dev This contract implements a token sale mechanism with bonding curve pricing and anti-whale protection:
     - Sigmoid bonding curve: Price increases dynamically based on tokens sold (starts at initialPrice, approaches maxPrice)
     - Initial price: 0.000003 USDC per PELON token (1 USDC = 333,333.33 PELON) - configurable
     - Maximum price: Configurable upper bound for the bonding curve
     - Inflection point: Point where the curve is steepest (configurable)
     - Maximum tokens per wallet limit (anti-whale mechanism)
     - Maximum total tokens to sell: 200B PELON tokens
     - Owner can configure bonding curve parameters, limits, pause/unpause, and withdraw funds
     - Uses OpenZeppelin contracts for security (Ownable, ReentrancyGuard, Pausable)

https://pelon.club
carlos@pelon.club
https://github.com/PelonClub
https://x.com/PelonClub
https://t.me/PelonClub
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract TokenSale is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdcToken;
    IERC20 public immutable pelonToken;

    uint256 public immutable initialPrice;
    uint256 public maxPrice;
    uint256 public curveSteepness;
    uint256 public inflectionPoint;

    uint256 public maxTokensPerWallet;
    uint256 public maxTotalSale;
    uint256 public totalSold;

    address public immutable fundsReceiptWallet;

    mapping(address => uint256) public tokensPurchased;

    event TokensPurchased(
        address indexed buyer,
        uint256 usdcAmount,
        uint256 pelonAmount
    );
    event BondingCurveParametersUpdated();
    event MaxTokensPerWalletUpdated(uint256 newMax);
    event MaxTotalSaleUpdated(uint256 newMax);
    event USDCWithdrawn(address indexed to, uint256 amount);
    event TokensWithdrawn(address indexed to, address indexed token, uint256 amount);
    event SalePaused(address account);
    event SaleUnpaused(address account);

    constructor(
        address _usdcToken,
        address _pelonToken,
        uint256 _initialPrice,
        uint256 _maxPrice,
        uint256 _curveSteepness,
        uint256 _inflectionPoint,
        uint256 _maxTokensPerWallet,
        uint256 _maxTotalSale,
        address _fundsReceiptWallet
    ) Ownable(msg.sender) {
        require(_usdcToken != address(0), "TokenSale: USDC address cannot be zero");
        require(_pelonToken != address(0), "TokenSale: PELON address cannot be zero");
        require(_initialPrice > 0, "TokenSale: Initial price must be greater than zero");
        require(_maxPrice > 0, "TokenSale: Max price must be greater than zero");
        require(_initialPrice < _maxPrice, "TokenSale: Initial price must be less than max price");
        require(_curveSteepness > 0, "TokenSale: Curve steepness must be greater than zero");
        require(_inflectionPoint > 0, "TokenSale: Inflection point must be greater than zero");
        require(_maxTokensPerWallet > 0, "TokenSale: Max tokens per wallet must be greater than zero");
        require(_maxTotalSale > 0, "TokenSale: Max total sale must be greater than zero");
        require(_fundsReceiptWallet != address(0), "TokenSale: Funds receipt wallet cannot be zero");

        usdcToken = IERC20(_usdcToken);
        pelonToken = IERC20(_pelonToken);
        initialPrice = _initialPrice;
        maxPrice = _maxPrice;
        curveSteepness = _curveSteepness;
        inflectionPoint = _inflectionPoint;
        maxTokensPerWallet = _maxTokensPerWallet;
        maxTotalSale = _maxTotalSale;
        fundsReceiptWallet = _fundsReceiptWallet;
        totalSold = 0;
    }

    function _calculatePrice() internal view returns (uint256) {
        if (totalSold == 0) return initialPrice;
        if (totalSold >= inflectionPoint * 2) return maxPrice;
        
        // Fórmula sigmoide aproximada usando operaciones simples para eficiencia de gas
        // price = initialPrice + (maxPrice - initialPrice) * (totalSold^2) / (inflectionPoint^2 + totalSold^2)
        uint256 priceRange = maxPrice - initialPrice;
        // Multiplicar primero para evitar pérdida de precisión (divide-before-multiply fix)
        uint256 soldSquared = totalSold * totalSold;
        uint256 inflectionSquared = inflectionPoint * inflectionPoint;
        uint256 numerator = priceRange * soldSquared;
        uint256 denominator = inflectionSquared + soldSquared;
        require(denominator > 0, "TokenSale: Invalid curve parameters");
        // Dividir al final para mantener precisión
        uint256 sigmoidValue = numerator / denominator;
        
        return initialPrice + sigmoidValue;
    }

    function buyTokens(uint256 usdcAmount) external nonReentrant whenNotPaused {
        require(usdcAmount > 0, "TokenSale: USDC amount must be greater than zero");

        uint256 currentPrice = _calculatePrice();
        uint256 pelonAmount = (usdcAmount * 1e30) / currentPrice;

        require(pelonAmount > 0, "TokenSale: Calculated PELON amount is zero");

        uint256 newTotal = tokensPurchased[msg.sender] + pelonAmount;
        require(
            newTotal <= maxTokensPerWallet,
            "TokenSale: Purchase would exceed wallet limit"
        );

        require(
            totalSold + pelonAmount <= maxTotalSale,
            "TokenSale: Purchase would exceed total sale limit"
        );

        uint256 contractBalance = pelonToken.balanceOf(address(this));
        require(
            contractBalance >= pelonAmount,
            "TokenSale: Insufficient tokens in contract"
        );

        usdcToken.safeTransferFrom(msg.sender, fundsReceiptWallet, usdcAmount);

        tokensPurchased[msg.sender] = newTotal;
        totalSold += pelonAmount;

        pelonToken.safeTransfer(msg.sender, pelonAmount);

        emit TokensPurchased(msg.sender, usdcAmount, pelonAmount);
    }

    function setMaxTokensPerWallet(uint256 _maxTokensPerWallet) external onlyOwner {
        require(
            _maxTokensPerWallet > 0,
            "TokenSale: Max tokens per wallet must be greater than zero"
        );
        maxTokensPerWallet = _maxTokensPerWallet;
        emit MaxTokensPerWalletUpdated(_maxTokensPerWallet);
    }

    function setMaxTotalSale(uint256 _maxTotalSale) external onlyOwner {
        require(
            _maxTotalSale > 0,
            "TokenSale: Max total sale must be greater than zero"
        );
        maxTotalSale = _maxTotalSale;
        emit MaxTotalSaleUpdated(_maxTotalSale);
    }

    function setMaxPrice(uint256 _maxPrice) external onlyOwner {
        require(_maxPrice > 0, "TokenSale: Max price must be greater than zero");
        require(
            initialPrice < _maxPrice,
            "TokenSale: Max price must be greater than initial price"
        );
        maxPrice = _maxPrice;
        emit BondingCurveParametersUpdated();
    }

    function setCurveSteepness(uint256 _curveSteepness) external onlyOwner {
        require(
            _curveSteepness > 0,
            "TokenSale: Curve steepness must be greater than zero"
        );
        curveSteepness = _curveSteepness;
        emit BondingCurveParametersUpdated();
    }

    function setInflectionPoint(uint256 _inflectionPoint) external onlyOwner {
        require(
            _inflectionPoint > 0,
            "TokenSale: Inflection point must be greater than zero"
        );
        inflectionPoint = _inflectionPoint;
        emit BondingCurveParametersUpdated();
    }

    function getCurrentPrice() external view returns (uint256) {
        return _calculatePrice();
    }

    function pause() external onlyOwner {
        _pause();
        emit SalePaused(msg.sender);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit SaleUnpaused(msg.sender);
    }

    function withdrawRemainingTokens(address token) external onlyOwner {
        require(token != address(0), "TokenSale: Token address cannot be zero");
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "TokenSale: No tokens to withdraw");
        tokenContract.safeTransfer(owner(), balance);
        emit TokensWithdrawn(owner(), token, balance);
    }

    function getPelonAmount(uint256 usdcAmount) external view returns (uint256) {
        if (usdcAmount == 0) return 0;
        uint256 currentPrice = _calculatePrice();
        return (usdcAmount * 1e30) / currentPrice;
    }

    function getRemainingTokens() external view returns (uint256) {
        uint256 remaining = maxTotalSale - totalSold;
        uint256 contractBalance = pelonToken.balanceOf(address(this));
        return remaining < contractBalance ? remaining : contractBalance;
    }

    function canPurchase(
        address wallet,
        uint256 usdcAmount
    ) external view returns (bool canBuy, string memory reason) {
        if (paused()) {
            return (false, "Sale is paused");
        }

        if (usdcAmount == 0) {
            return (false, "USDC amount must be greater than zero");
        }

        uint256 currentPrice = _calculatePrice();
        uint256 pelonAmount = (usdcAmount * 1e30) / currentPrice;
        if (pelonAmount == 0) {
            return (false, "Calculated PELON amount is zero");
        }

        uint256 newTotal = tokensPurchased[wallet] + pelonAmount;
        if (newTotal > maxTokensPerWallet) {
            return (false, "Would exceed wallet limit");
        }

        if (totalSold + pelonAmount > maxTotalSale) {
            return (false, "Would exceed total sale limit");
        }

        uint256 contractBalance = pelonToken.balanceOf(address(this));
        if (contractBalance < pelonAmount) {
            return (false, "Insufficient tokens in contract");
        }

        return (true, "");
    }
}

