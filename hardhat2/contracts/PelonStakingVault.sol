/*
 /$$$$$$$           /$$                            /$$$$$$  /$$           /$$      
| $$__  $$         | $$                           /$$__  $$| $$          | $$      
| $$  \ $$ /$$$$$$ | $$  /$$$$$$  /$$$$$$$       | $$  \__/| $$ /$$   /$$| $$$$$$$ 
| $$$$$$$//$$__  $$| $$ /$$__  $$| $$__  $$      | $$      | $$| $$  | $$| $$__  $$
| $$____/| $$$$$$$$| $$| $$  \ $$| $$  \ $$      | $$      | $$| $$  | $$| $$  \ $$
| $$     | $$_____/| $$| $$  | $$| $$  | $$      | $$    $$| $$| $$  | $$| $$  | $$
| $$     |  $$$$$$$| $$|  $$$$$$/| $$  | $$      |  $$$$$$/| $$|  $$$$$$/| $$$$$$$/
|__/      \_______/|__/ \______/ |__/  |__/       \______/ |__/ \______/ |_______/ 

@title PelonStakingVault
@author baeza.eth (King Of The Pelones)
@notice ERC4626 Tokenized Vault for PELON Token Staking with Withdrawal Fees and Timelock
@dev This contract implements a minimal, non-upgradeable ERC4626 vault for PELON token staking.
     
     Core Functionality:
     - Users deposit PELON tokens and receive proportional vault shares (CALDERO)
     - Shares are ERC20 tokens that represent ownership in the vault and can be transferred
     - Users can withdraw assets by redeeming shares or withdrawing assets directly
     - Built on OpenZeppelin's ERC4626 with built-in protection against inflation attacks
     
     Fee Mechanism:
     - 3% withdrawal fee (300 basis points) applied to all withdrawals and redemptions
     - Fee is split 50/50:
       * 50% sent to immutable fee wallet (set at deployment)
       * 50% remains in vault, increasing share value for all remaining stakers
     - Fees only apply on withdrawal/redeem, not on deposits
     
     Timelock Protection:
     - 1 day (86400 seconds) minimum lock period after each deposit
     - Timelock is per-user and resets on each new deposit
     - Prevents immediate withdrawals, reducing short-term volatility
     - Timelock checked on withdrawal/redeem operations
     
     Security & Design:
     - Immutable fee wallet (cannot be changed after deployment)
     - No owner controls or admin functions (fully decentralized)
     - Uses SafeERC20 for secure token transfers
     - Minimal implementation reduces attack surface
     - All standard ERC4626 operations supported (deposit, mint, withdraw, redeem)

https://pelon.club
carlos@pelon.club
https://github.com/PelonClub
https://x.com/PelonClub
https://t.me/PelonClub
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PelonStakingVault is ERC4626 {
    using SafeERC20 for IERC20;

    uint256 public constant FEE_BPS = 300;
    uint256 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant MIN_TIMELOCK_DURATION = 1 days;

    address public immutable feeWallet;
    
    mapping(address => uint256) public lastDepositTimestamp;

    constructor(IERC20 assetToken, address _feeWallet)
        ERC20("Pelon Vault: Caldero", "CALDERO")
        ERC4626(assetToken)
    {
        require(address(assetToken) != address(0), "PelonStakingVault: Asset token cannot be zero address");
        require(_feeWallet != address(0), "PelonStakingVault: Fee wallet cannot be zero address");
        feeWallet = _feeWallet;
    }

    function deposit(uint256 assets, address receiver) public override returns (uint256 shares) {
        shares = super.deposit(assets, receiver);
        lastDepositTimestamp[receiver] = block.timestamp;
        return shares;
    }

    function mint(uint256 shares, address receiver) public override returns (uint256 assets) {
        assets = super.mint(shares, receiver);
        lastDepositTimestamp[receiver] = block.timestamp;
        return assets;
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        require(
            block.timestamp >= lastDepositTimestamp[owner] + MIN_TIMELOCK_DURATION,
            "PelonStakingVault: Timelock not expired"
        );
        
        uint256 feeAmount = (assets * FEE_BPS) / BPS_DENOMINATOR;
        
        uint256 netAssets = assets - feeAmount;
        
        uint256 feeToWallet = feeAmount / 2;

        if (caller != owner) {
            _spendAllowance(owner, caller, shares);
        }

        _burn(owner, shares);

        IERC20(asset()).safeTransfer(receiver, netAssets);

        if (feeToWallet > 0) {
            IERC20(asset()).safeTransfer(feeWallet, feeToWallet);
        }
    }
}