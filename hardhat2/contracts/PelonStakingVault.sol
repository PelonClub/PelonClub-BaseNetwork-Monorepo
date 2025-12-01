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
@notice ERC4626 Staking Vault for PELON Tokens - Allows users to stake PELON tokens and receive vault shares (psvPELON)
@dev This contract implements an ERC4626 tokenized vault for PELON token staking with timelock and withdrawal fees:
     - Users can deposit PELON tokens and receive proportional vault shares (psvPELON)
     - Users can withdraw their staked PELON tokens by redeeming their vault shares
     - Uses OpenZeppelin's ERC4626 implementation which includes:
       * Protection against inflation attacks
       * Standard vault operations (deposit, mint, withdraw, redeem)
       * Automatic share calculation based on asset balance
     - The vault token (psvPELON) represents shares in the vault and can be transferred independently
     - Timelock: Each deposit has a configurable timelock period before it can be withdrawn (FIFO system)
       * Default: 15 days, modifiable by owner (min: 1 day, max: 90 days)
     - Withdrawal Fee: Configurable fee on withdrawals and redemptions, split 50/25/25: fee wallet, staking contract, and burning
       * Default: 3% (300 BPS), modifiable by owner (max: 10% = 1000 BPS)
       * 50% of fee is transferred directly to fee wallet
       * 25% of fee is transferred directly to staking contract WITHOUT minting shares - This increases the value per share
         for all existing holders, as totalAssets() increases while totalSupply() remains constant, effectively
         providing a compounding reward mechanism that benefits all stakers
       * 25% is burned (PELON tokens and equivalent psvPELON shares)
     - Both withdraw() and redeem() have timelock restrictions and apply the withdrawal fee
     - Optimized FIFO deposit removal using index-based system for gas efficiency
     - Both previewWithdraw() and previewRedeem() show assets before fee (per ERC4626 standard)
     - withdraw() and redeem() apply the fee internally, returning net assets to the user

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
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract PelonStakingVault is ERC4626, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_WITHDRAW_FEE_BPS = 1000;

    uint256 public constant MIN_TIMELOCK_DURATION = 1 days;

    uint256 public constant MAX_TIMELOCK_DURATION = 90 days;

    uint256 private constant BPS_DENOMINATOR = 10000;

    uint256 private constant MAX_DEPOSIT_ITERATIONS = 500;

    uint256 private constant MAX_DEPOSITS_PER_USER = 1000;

    uint256 public timelockDuration;

    uint256 public withdrawFeeBps;

    address public feeWallet;

    struct UserDeposit {
        uint256 shares;
        uint256 timestamp;
    }

    mapping(address => UserDeposit[]) public userDeposits;

    mapping(address => uint256) public userDepositStartIndex;

    event FeeWalletUpdated(address indexed newWallet);

    event WithdrawFeeCollected(address indexed user, uint256 feeAmount, uint256 feeToWallet, uint256 feeToRestake, uint256 feeToBurn);

    event DepositRecorded(address indexed user, uint256 shares, uint256 timestamp);

    event TimelockDurationUpdated(uint256 indexed newDuration);

    event WithdrawFeeBpsUpdated(uint256 indexed newFeeBps);

    event DepositsRemoved(address indexed user, uint256 shares, uint256 newStartIndex);

    event FeeBurned(uint256 assets, uint256 actualBurned);

    event WithdrawExecuted(address indexed user, uint256 assets, uint256 shares, address indexed receiver);

    event RedeemExecuted(address indexed user, uint256 shares, uint256 assets, address indexed receiver);

    constructor(IERC20 assetToken, address _feeWallet)
        ERC20("Pelon Staking Vault", "psvPELON")
        ERC4626(assetToken)
        Ownable(msg.sender)
    {
        require(address(assetToken) != address(0), "PelonStakingVault: Asset token cannot be zero address");
        require(_feeWallet != address(0), "PelonStakingVault: Fee wallet cannot be zero address");
        feeWallet = _feeWallet;
        timelockDuration = 15 days;
        withdrawFeeBps = 300;
    }

    function setFeeWallet(address newFeeWallet) external onlyOwner {
        require(newFeeWallet != address(0), "PelonStakingVault: Fee wallet cannot be zero address");
        feeWallet = newFeeWallet;
        emit FeeWalletUpdated(newFeeWallet);
    }

    function setTimelockDuration(uint256 duration) external onlyOwner {
        require(
            duration >= MIN_TIMELOCK_DURATION && duration <= MAX_TIMELOCK_DURATION,
            "PelonStakingVault: Timelock duration out of bounds"
        );
        timelockDuration = duration;
        emit TimelockDurationUpdated(duration);
    }

    function setWithdrawFeeBps(uint256 feeBps) external onlyOwner {
        require(
            feeBps <= MAX_WITHDRAW_FEE_BPS,
            "PelonStakingVault: Withdrawal fee exceeds maximum"
        );
        withdrawFeeBps = feeBps;
        emit WithdrawFeeBpsUpdated(feeBps);
    }

    function deposit(uint256 assets, address receiver) public override returns (uint256 shares) {
        require(receiver != address(0), "PelonStakingVault: Receiver cannot be zero address");
        shares = super.deposit(assets, receiver);
        _recordDeposit(receiver, shares);
        return shares;
    }

    function mint(uint256 shares, address receiver) public override returns (uint256 assets) {
        require(receiver != address(0), "PelonStakingVault: Receiver cannot be zero address");
        assets = super.mint(shares, receiver);
        _recordDeposit(receiver, shares);
        return assets;
    }

    function withdraw(uint256 assets, address receiver, address ownerAddress) public override nonReentrant returns (uint256 shares) {
        require(assets > 0, "PelonStakingVault: Cannot withdraw zero assets");
        require(receiver != address(0), "PelonStakingVault: Receiver cannot be zero address");
        
        _checkTimelock(ownerAddress, assets);

        shares = previewWithdraw(assets);
        
        (uint256 feeToWallet, uint256 feeToBurn, uint256 feeToStaking, uint256 totalFee) = _calculateFeeDistribution(assets);
        uint256 netAssets = assets - totalFee;

        if (msg.sender != ownerAddress) {
            _spendAllowance(ownerAddress, msg.sender, shares);
        }

        _burn(ownerAddress, shares);
        _removeDeposits(ownerAddress, shares);

        if (totalFee > 0) {
            if (feeToWallet > 0) {
                IERC20(asset()).safeTransfer(feeWallet, feeToWallet);
            }

            if (feeToStaking > 0) {
                IERC20(asset()).safeTransfer(address(this), feeToStaking);
            }

            if (feeToBurn > 0) {
                _burnFee(feeToBurn);
            }

            emit WithdrawFeeCollected(ownerAddress, totalFee, feeToWallet, feeToStaking, feeToBurn);
        }

        IERC20(asset()).safeTransfer(receiver, netAssets);
        emit WithdrawExecuted(ownerAddress, assets, shares, receiver);

        return shares;
    }

    function redeem(uint256 shares, address receiver, address ownerAddress) public override nonReentrant returns (uint256 assets) {
        require(shares > 0, "PelonStakingVault: Cannot redeem zero shares");
        require(receiver != address(0), "PelonStakingVault: Receiver cannot be zero address");
        
        _checkTimelockForShares(ownerAddress, shares);

        assets = previewRedeem(shares);
        
        (uint256 feeToWallet, uint256 feeToBurn, uint256 feeToStaking, uint256 totalFee) = _calculateFeeDistribution(assets);
        uint256 assetsAfterFee = assets - totalFee;

        if (msg.sender != ownerAddress) {
            _spendAllowance(ownerAddress, msg.sender, shares);
        }

        _burn(ownerAddress, shares);
        _removeDeposits(ownerAddress, shares);

        if (totalFee > 0) {
            if (feeToWallet > 0) {
                IERC20(asset()).safeTransfer(feeWallet, feeToWallet);
            }

            if (feeToStaking > 0) {
                IERC20(asset()).safeTransfer(address(this), feeToStaking);
            }

            if (feeToBurn > 0) {
                _burnFee(feeToBurn);
            }

            emit WithdrawFeeCollected(ownerAddress, totalFee, feeToWallet, feeToStaking, feeToBurn);
        }

        IERC20(asset()).safeTransfer(receiver, assetsAfterFee);
        emit RedeemExecuted(ownerAddress, shares, assets, receiver);

        return assets;
    }

    function getWithdrawableShares(address user) public view returns (uint256 withdrawableShares) {
        uint256 currentTime = block.timestamp;
        UserDeposit[] storage deposits = userDeposits[user];
        uint256 startIndex = userDepositStartIndex[user];
        
        for (uint256 i = startIndex; i < deposits.length; i++) {
            if (currentTime >= deposits[i].timestamp + timelockDuration) {
                withdrawableShares += deposits[i].shares;
            } else {
                break;
            }
        }
        return withdrawableShares;
    }

    function getWithdrawableAssets(address user) public view returns (uint256 withdrawableAssets) {
        uint256 withdrawableShares = getWithdrawableShares(user);
        if (withdrawableShares > 0) {
            withdrawableAssets = convertToAssets(withdrawableShares);
        }
    }

    function previewWithdraw(uint256 assets) public view override returns (uint256 shares) {
        return super.previewWithdraw(assets);
    }

    function previewRedeem(uint256 shares) public view override returns (uint256 assets) {
        assets = super.previewRedeem(shares);
        return assets;
    }

    function previewWithdrawAfterFee(uint256 assets) public view returns (uint256 netAssets) {
        uint256 fee = (assets * withdrawFeeBps) / BPS_DENOMINATOR;
        netAssets = assets - fee;
    }

    function previewRedeemAfterFee(uint256 shares) public view returns (uint256 netAssets) {
        uint256 assets = previewRedeem(shares);
        uint256 fee = (assets * withdrawFeeBps) / BPS_DENOMINATOR;
        netAssets = assets - fee;
    }

    function getUserDeposits(address user) external view returns (UserDeposit[] memory) {
        return userDeposits[user];
    }

    function _recordDeposit(address user, uint256 shares) internal {
        if (shares > 0) {
            uint256 currentLength = userDeposits[user].length;
            uint256 startIndex = userDepositStartIndex[user];
            uint256 activeDeposits = currentLength - startIndex;
            
            require(
                activeDeposits < MAX_DEPOSITS_PER_USER,
                "PelonStakingVault: Maximum deposits per user exceeded"
            );
            
            userDeposits[user].push(UserDeposit({
                shares: shares,
                timestamp: block.timestamp
            }));
            emit DepositRecorded(user, shares, block.timestamp);
        }
    }

    function _burnFee(uint256 assets) internal {
        if (assets > 0) {
            uint256 balance = IERC20(asset()).balanceOf(address(this));
            uint256 burnAmount = assets > balance ? balance : assets;
            if (burnAmount > 0) {
                uint256 sharesToBurn = convertToShares(burnAmount);
                if (sharesToBurn > 0) {
                    _burn(address(this), sharesToBurn);
                }
                ERC20Burnable(asset()).burn(burnAmount);
                emit FeeBurned(assets, burnAmount);
            }
        }
    }

    function _checkTimelock(address ownerAddress, uint256 assets) internal view {
        uint256 requiredShares = previewWithdraw(assets);
        uint256 withdrawableShares = getWithdrawableShares(ownerAddress);
        
        require(
            withdrawableShares >= requiredShares,
            "PelonStakingVault: Insufficient withdrawable shares (timelock not expired)"
        );
    }

    function _checkTimelockForShares(address ownerAddress, uint256 shares) internal view {
        uint256 withdrawableShares = getWithdrawableShares(ownerAddress);
        
        require(
            withdrawableShares >= shares,
            "PelonStakingVault: Insufficient withdrawable shares (timelock not expired)"
        );
    }

    function _removeDeposits(address ownerAddress, uint256 shares) internal {
        UserDeposit[] storage deposits = userDeposits[ownerAddress];
        uint256 startIndex = userDepositStartIndex[ownerAddress];
        uint256 sharesToRemove = shares;
        uint256 currentTime = block.timestamp;
        uint256 iterations = 0;

        while (sharesToRemove > 0 && startIndex < deposits.length && iterations < MAX_DEPOSIT_ITERATIONS) {
            UserDeposit storage currentDeposit = deposits[startIndex];

            if (currentDeposit.shares <= sharesToRemove) {
                sharesToRemove -= currentDeposit.shares;
                startIndex++;
            } else {
                currentDeposit.shares -= sharesToRemove;
                sharesToRemove = 0;
            }
            
            unchecked {
                iterations++;
            }
        }

        require(sharesToRemove <= 0, "PelonStakingVault: Insufficient eligible deposits");
        
        userDepositStartIndex[ownerAddress] = startIndex;
        
        emit DepositsRemoved(ownerAddress, shares, startIndex);
    }

    function _calculateFeeDistribution(uint256 assets) 
        internal 
        view 
        returns (uint256 feeToWallet, uint256 feeToBurn, uint256 feeToStaking, uint256 totalFee) 
    {
        uint256 denominatorSquared = BPS_DENOMINATOR * BPS_DENOMINATOR;
        
        feeToWallet = (assets * withdrawFeeBps * 5000) / denominatorSquared;
        feeToBurn = (assets * withdrawFeeBps * 2500) / denominatorSquared;
        feeToStaking = (assets * withdrawFeeBps * 2500) / denominatorSquared;
        totalFee = feeToWallet + feeToBurn + feeToStaking;
    }
}
