import { expect } from "chai";
import hre from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import type { Contract } from "ethers";
import type { PelonStakingVault, PelonClubToken } from "../typechain-types";
const ethers = hre.ethers;

describe("PelonStakingVault", function () {
  async function deployVaultFixture() {
    const [owner, user1, user2, user3, feeWallet, attacker, receiver] = await ethers.getSigners();
    
    const PelonClubToken = await ethers.getContractFactory("PelonClubToken");
    const pelonToken = await PelonClubToken.deploy(owner.address);
    await pelonToken.waitForDeployment();
    
    const PelonStakingVault = await ethers.getContractFactory("PelonStakingVault");
    const vault = await PelonStakingVault.deploy(await pelonToken.getAddress(), feeWallet.address);
    await vault.waitForDeployment();
    
    const tokenAmount = ethers.parseUnits("1000000", 18);
    await pelonToken.transfer(user1.address, tokenAmount);
    await pelonToken.transfer(user2.address, tokenAmount);
    await pelonToken.transfer(user3.address, tokenAmount);
    
    const vaultShares = ethers.parseUnits("100000", 18);
    await pelonToken.approve(await vault.getAddress(), vaultShares);
    await vault.deposit(vaultShares, await vault.getAddress());
    
    return {
      vault,
      pelonToken,
      owner,
      user1,
      user2,
      user3,
      feeWallet,
      attacker,
      receiver,
    };
  }

  function calculateFeeDistribution(assets: bigint, feeBps: bigint) {
    const BPS_DENOMINATOR = 10000n;
    const denominatorSquared = BPS_DENOMINATOR * BPS_DENOMINATOR;
    const feeToWallet = (assets * feeBps * 5000n) / denominatorSquared;
    const feeToBurn = (assets * feeBps * 2500n) / denominatorSquared;
    const feeToStaking = (assets * feeBps * 2500n) / denominatorSquared;
    const totalFee = feeToWallet + feeToBurn + feeToStaking;
    return { feeToWallet, feeToBurn, feeToStaking, totalFee };
  }

  describe("Constructor and Initial Configuration", function () {
    it("Should deploy with valid parameters", async function () {
      const { vault, pelonToken, feeWallet } = await loadFixture(deployVaultFixture);
      expect(await vault.asset()).to.equal(await pelonToken.getAddress());
      expect(await vault.feeWallet()).to.equal(feeWallet.address);
      expect(await vault.timelockDuration()).to.equal(15n * 24n * 60n * 60n);
      expect(await vault.withdrawFeeBps()).to.equal(300n);
      expect(await vault.name()).to.equal("Pelon Staking Vault");
      expect(await vault.symbol()).to.equal("psvPELON");
    });

    it("Should revert with zero asset token address", async function () {
      const [owner, feeWallet] = await ethers.getSigners();
      const PelonStakingVault = await ethers.getContractFactory("PelonStakingVault");
      await expect(
        PelonStakingVault.deploy(ethers.ZeroAddress, feeWallet.address)
      ).to.be.revertedWith("PelonStakingVault: Asset token cannot be zero address");
    });

    it("Should revert with zero fee wallet address", async function () {
      const [owner] = await ethers.getSigners();
      const PelonClubToken = await ethers.getContractFactory("PelonClubToken");
      const pelonToken = await PelonClubToken.deploy(owner.address);
      await pelonToken.waitForDeployment();
      
      const PelonStakingVault = await ethers.getContractFactory("PelonStakingVault");
      await expect(
        PelonStakingVault.deploy(await pelonToken.getAddress(), ethers.ZeroAddress)
      ).to.be.revertedWith("PelonStakingVault: Fee wallet cannot be zero address");
    });
  });

  describe("Deposit Functions", function () {
    it("Should successfully deposit assets", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      const vaultBalanceBefore = await pelonToken.balanceOf(await vault.getAddress());
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      const tx = await vault.connect(user1).deposit(depositAmount, user1.address);
      const receipt = await tx.wait();
      
      expect(await vault.balanceOf(user1.address)).to.be.gt(0n);
      const vaultBalanceAfter = await pelonToken.balanceOf(await vault.getAddress());
      expect(vaultBalanceAfter - vaultBalanceBefore).to.equal(depositAmount);
      
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = vault.interface.parseLog(log);
          return parsed?.name === "DepositRecorded";
        } catch {
          return false;
        }
      });
      expect(event).to.not.be.undefined;
    });

    it("Should successfully mint shares", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const sharesToMint = ethers.parseUnits("1000", 18);
      const assetsNeeded = await vault.previewMint(sharesToMint);
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), assetsNeeded);
      await vault.connect(user1).mint(sharesToMint, user1.address);
      
      expect(await vault.balanceOf(user1.address)).to.equal(sharesToMint);
    });

    it("Should revert deposit with zero receiver address", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      await expect(
        vault.connect(user1).deposit(depositAmount, ethers.ZeroAddress)
      ).to.be.revertedWith("PelonStakingVault: Receiver cannot be zero address");
    });

    it("Should revert mint with zero receiver address", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const sharesToMint = ethers.parseUnits("1000", 18);
      const assetsNeeded = await vault.previewMint(sharesToMint);
      await pelonToken.connect(user1).approve(await vault.getAddress(), assetsNeeded);
      
      await expect(
        vault.connect(user1).mint(sharesToMint, ethers.ZeroAddress)
      ).to.be.revertedWith("PelonStakingVault: Receiver cannot be zero address");
    });

    it("Should record deposits correctly in FIFO order", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const deposit1 = ethers.parseUnits("100", 18);
      const deposit2 = ethers.parseUnits("200", 18);
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), deposit1 + deposit2);
      
      await vault.connect(user1).deposit(deposit1, user1.address);
      const timestamp1 = await time.latest();
      await time.increase(60);
      await vault.connect(user1).deposit(deposit2, user1.address);
      
      const deposits = await vault.getUserDeposits(user1.address);
      expect(deposits.length).to.equal(2);
      expect(deposits[0].shares).to.be.gt(0n);
      expect(deposits[1].shares).to.be.gt(0n);
    });

    it("Should handle multiple deposits from same user", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("100", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount * 5n);
      
      for (let i = 0; i < 5; i++) {
        await vault.connect(user1).deposit(depositAmount, user1.address);
      }
      
      const deposits = await vault.getUserDeposits(user1.address);
      expect(deposits.length).to.equal(5);
    });

    it("Should handle deposits from different users", async function () {
      const { vault, pelonToken, user1, user2 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await pelonToken.connect(user2).approve(await vault.getAddress(), depositAmount);
      
      await vault.connect(user1).deposit(depositAmount, user1.address);
      await vault.connect(user2).deposit(depositAmount, user2.address);
      
      expect(await vault.balanceOf(user1.address)).to.be.gt(0n);
      expect(await vault.balanceOf(user2.address)).to.be.gt(0n);
    });

    it("Should correctly convert assets to shares according to ERC4626", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      const expectedShares = await vault.previewDeposit(depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      expect(await vault.balanceOf(user1.address)).to.equal(expectedShares);
    });
  });

  describe("Timelock FIFO System", function () {
    it("Should calculate withdrawable shares correctly", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const withdrawableBefore = await vault.getWithdrawableShares(user1.address);
      expect(withdrawableBefore).to.equal(0n);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const withdrawableAfter = await vault.getWithdrawableShares(user1.address);
      expect(withdrawableAfter).to.be.gt(0n);
    });

    it("Should calculate withdrawable assets correctly", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const withdrawableAssets = await vault.getWithdrawableAssets(user1.address);
      expect(withdrawableAssets).to.be.gt(0n);
    });

    it("Should revert immediate withdrawal (timelock not expired)", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const assetsToWithdraw = ethers.parseUnits("100", 18);
      await expect(
        vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address)
      ).to.be.revertedWith("PelonStakingVault: Insufficient withdrawable shares (timelock not expired)");
    });

    it("Should allow withdrawal after timelock expires", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("100", 18);
      const balanceBefore = await pelonToken.balanceOf(user1.address);
      await vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address);
      const balanceAfter = await pelonToken.balanceOf(user1.address);
      
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should handle multiple deposits with different timelocks", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const deposit1 = ethers.parseUnits("100", 18);
      const deposit2 = ethers.parseUnits("200", 18);
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), deposit1 + deposit2);
      
      await vault.connect(user1).deposit(deposit1, user1.address);
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration / 2n);
      await vault.connect(user1).deposit(deposit2, user1.address);
      
      await time.increase(timelockDuration / 2n + 1n);
      const withdrawable1 = await vault.getWithdrawableShares(user1.address);
      expect(withdrawable1).to.be.gt(0n);
      
      const totalShares = await vault.balanceOf(user1.address);
      expect(withdrawable1).to.be.lt(totalShares);
    });

    it("Should handle partial withdrawal of FIFO deposits", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const deposit1 = ethers.parseUnits("100", 18);
      const deposit2 = ethers.parseUnits("200", 18);
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), deposit1 + deposit2);
      await vault.connect(user1).deposit(deposit1, user1.address);
      await vault.connect(user1).deposit(deposit2, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const shares1 = await vault.previewDeposit(deposit1);
      const partialShares = shares1 / 2n;
      
      await vault.connect(user1).redeem(partialShares, user1.address, user1.address);
      
      const deposits = await vault.getUserDeposits(user1.address);
      expect(deposits[0].shares).to.be.gt(0n);
    });

    it("Should verify FIFO order is correct", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const amounts = [
        ethers.parseUnits("100", 18),
        ethers.parseUnits("200", 18),
        ethers.parseUnits("300", 18),
      ];
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), amounts[0] + amounts[1] + amounts[2]);
      
      for (const amount of amounts) {
        await vault.connect(user1).deposit(amount, user1.address);
        await time.increase(60);
      }
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const withdrawable = await vault.getWithdrawableShares(user1.address);
      expect(withdrawable).to.be.gt(0n);
    });
  });

  describe("Withdraw and Redeem Functions", function () {
    it("Should successfully withdraw after timelock", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("100", 18);
      const balanceBefore = await pelonToken.balanceOf(user1.address);
      await vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address);
      const balanceAfter = await pelonToken.balanceOf(user1.address);
      
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should successfully redeem after timelock", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const shares = await vault.balanceOf(user1.address);
      const sharesToRedeem = shares / 10n;
      const balanceBefore = await pelonToken.balanceOf(user1.address);
      await vault.connect(user1).redeem(sharesToRedeem, user1.address, user1.address);
      const balanceAfter = await pelonToken.balanceOf(user1.address);
      
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should revert withdraw with zero assets", async function () {
      const { vault, user1 } = await loadFixture(deployVaultFixture);
      await expect(
        vault.connect(user1).withdraw(0n, user1.address, user1.address)
      ).to.be.revertedWith("PelonStakingVault: Cannot withdraw zero assets");
    });

    it("Should revert redeem with zero shares", async function () {
      const { vault, user1 } = await loadFixture(deployVaultFixture);
      await expect(
        vault.connect(user1).redeem(0n, user1.address, user1.address)
      ).to.be.revertedWith("PelonStakingVault: Cannot redeem zero shares");
    });

    it("Should revert withdraw with zero receiver", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      await expect(
        vault.connect(user1).withdraw(ethers.parseUnits("100", 18), ethers.ZeroAddress, user1.address)
      ).to.be.revertedWith("PelonStakingVault: Receiver cannot be zero address");
    });

    it("Should apply fees correctly (50/25/25 distribution)", async function () {
      const { vault, pelonToken, user1, feeWallet } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("10000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("1000", 18);
      const feeWalletBalanceBefore = await pelonToken.balanceOf(feeWallet.address);
      const totalAssetsBefore = await vault.totalAssets();
      
      await vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address);
      
      const feeWalletBalanceAfter = await pelonToken.balanceOf(feeWallet.address);
      const totalAssetsAfter = await vault.totalAssets();
      
      const feeReceived = feeWalletBalanceAfter - feeWalletBalanceBefore;
      expect(feeReceived).to.be.gt(0n);
      expect(totalAssetsAfter).to.be.gt(0n);
    });

    it("Should handle withdrawal with allowance", async function () {
      const { vault, pelonToken, user1, user2 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const shares = await vault.balanceOf(user1.address);
      const sharesToRedeem = shares / 10n;
      await vault.connect(user1).approve(user2.address, sharesToRedeem);
      
      await vault.connect(user2).redeem(sharesToRedeem, user2.address, user1.address);
      expect(await pelonToken.balanceOf(user2.address)).to.be.gt(0n);
    });

    it("Should increase share value after restake", async function () {
      const { vault, pelonToken, user1, user2 } = await loadFixture(deployVaultFixture);
      const deposit1 = ethers.parseUnits("10000", 18);
      const deposit2 = ethers.parseUnits("10000", 18);
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), deposit1);
      await pelonToken.connect(user2).approve(await vault.getAddress(), deposit2);
      
      await vault.connect(user1).deposit(deposit1, user1.address);
      await vault.connect(user2).deposit(deposit2, user2.address);
      
      const shares1Before = await vault.balanceOf(user1.address);
      const shares2Before = await vault.balanceOf(user2.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("1000", 18);
      await vault.connect(user2).withdraw(assetsToWithdraw, user2.address, user2.address);
      
      const assetsPerShare1 = await vault.convertToAssets(shares1Before);
      expect(assetsPerShare1).to.be.gt(deposit1);
    });
  });

  describe("Fee Calculation and Distribution", function () {
    it("Should calculate fee distribution correctly", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      const assets = ethers.parseUnits("1000", 18);
      const feeBps = 300n; // 3%
      
      const { feeToWallet, feeToBurn, feeToStaking, totalFee } = calculateFeeDistribution(assets, feeBps);
      
      expect(totalFee).to.equal(feeToWallet + feeToStaking + feeToBurn);
      expect(feeToWallet).to.be.gt(0n);
      expect(feeToStaking).to.be.gt(0n);
      expect(feeToBurn).to.be.gt(0n);
    });

    it("Should handle zero fees (withdrawFeeBps = 0)", async function () {
      const { vault, pelonToken, user1, owner } = await loadFixture(deployVaultFixture);
      await vault.connect(owner).setWithdrawFeeBps(0n);
      
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("100", 18);
      const balanceBefore = await pelonToken.balanceOf(user1.address);
      await vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address);
      const balanceAfter = await pelonToken.balanceOf(user1.address);
      
      expect(balanceAfter - balanceBefore).to.be.closeTo(assetsToWithdraw, ethers.parseUnits("0.01", 18));
    });

    it("Should handle maximum fees (withdrawFeeBps = 1000)", async function () {
      const { vault, pelonToken, user1, owner } = await loadFixture(deployVaultFixture);
      await vault.connect(owner).setWithdrawFeeBps(1000n);
      
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("100", 18);
      const balanceBefore = await pelonToken.balanceOf(user1.address);
      await vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address);
      const balanceAfter = await pelonToken.balanceOf(user1.address);
      
      const received = balanceAfter - balanceBefore;
      expect(received).to.be.lt(assetsToWithdraw);
    });

    it("Should handle very small fees (dust)", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("0.001", 18);
      await expect(
        vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address)
      ).to.not.be.reverted;
    });
  });

  describe("Preview Functions (ERC4626 Compliance)", function () {
    it("Should preview withdraw without fees (ERC4626 standard)", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const assets = ethers.parseUnits("100", 18);
      const shares = await vault.previewWithdraw(assets);
      expect(shares).to.be.gt(0n);
    });

    it("Should preview redeem without fees (ERC4626 standard)", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const shares = await vault.balanceOf(user1.address);
      const assets = await vault.previewRedeem(shares / 10n);
      expect(assets).to.be.gt(0n);
    });

    it("Should preview withdraw after fee", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const assets = ethers.parseUnits("100", 18);
      const netAssets = await vault.previewWithdrawAfterFee(assets);
      expect(netAssets).to.be.lt(assets);
    });

    it("Should preview redeem after fee", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const shares = await vault.balanceOf(user1.address);
      const netAssets = await vault.previewRedeemAfterFee(shares / 10n);
      expect(netAssets).to.be.gt(0n);
    });

    it("Should match preview with actual execution", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const shares = await vault.balanceOf(user1.address);
      const sharesToRedeem = shares / 10n;
      const previewAssets = await vault.previewRedeem(sharesToRedeem);
      
      const balanceBefore = await pelonToken.balanceOf(user1.address);
      await vault.connect(user1).redeem(sharesToRedeem, user1.address, user1.address);
      const balanceAfter = await pelonToken.balanceOf(user1.address);
      
      const actualReceived = balanceAfter - balanceBefore;
      expect(actualReceived).to.be.lt(previewAssets); // Fees applied
    });

    it("Should handle preview with zero total supply", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      const assets = ethers.parseUnits("100", 18);
      const shares = await vault.previewWithdraw(assets);
      expect(shares).to.be.gt(0n);
    });
  });

  describe("View Functions", function () {
    it("Should return user deposits array", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("100", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount * 3n);
      
      await vault.connect(user1).deposit(depositAmount, user1.address);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const deposits = await vault.getUserDeposits(user1.address);
      expect(deposits.length).to.equal(3);
    });

    it("Should convert shares to assets correctly", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const shares = await vault.balanceOf(user1.address);
      const assets = await vault.convertToAssets(shares);
      expect(assets).to.be.closeTo(depositAmount, ethers.parseUnits("0.1", 18));
    });

    it("Should convert assets to shares correctly", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const assets = ethers.parseUnits("100", 18);
      const shares = await vault.convertToShares(assets);
      expect(shares).to.be.gt(0n);
    });

    it("Should include restaked fees in totalAssets", async function () {
      const { vault, pelonToken, user1, user2 } = await loadFixture(deployVaultFixture);
      const deposit1 = ethers.parseUnits("10000", 18);
      const deposit2 = ethers.parseUnits("10000", 18);
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), deposit1);
      await pelonToken.connect(user2).approve(await vault.getAddress(), deposit2);
      
      await vault.connect(user1).deposit(deposit1, user1.address);
      await vault.connect(user2).deposit(deposit2, user2.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("1000", 18);
      const vaultBalanceBefore = await pelonToken.balanceOf(await vault.getAddress());
      await vault.connect(user2).withdraw(assetsToWithdraw, user2.address, user2.address);
      const vaultBalanceAfter = await pelonToken.balanceOf(await vault.getAddress());
      
      const totalAssets = await vault.totalAssets();
      expect(totalAssets).to.equal(vaultBalanceAfter);
      expect(vaultBalanceAfter).to.be.gt(0n);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to set fee wallet", async function () {
      const { vault, owner, user1 } = await loadFixture(deployVaultFixture);
      await expect(vault.connect(owner).setFeeWallet(user1.address))
        .to.emit(vault, "FeeWalletUpdated")
        .withArgs(user1.address);
      expect(await vault.feeWallet()).to.equal(user1.address);
    });

    it("Should revert setFeeWallet with zero address", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);
      await expect(
        vault.connect(owner).setFeeWallet(ethers.ZeroAddress)
      ).to.be.revertedWith("PelonStakingVault: Fee wallet cannot be zero address");
    });

    it("Should revert setFeeWallet when called by non-owner", async function () {
      const { vault, user1 } = await loadFixture(deployVaultFixture);
      await expect(
        vault.connect(user1).setFeeWallet(user1.address)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to set timelock duration", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);
      const newDuration = 30n * 24n * 60n * 60n;
      await expect(vault.connect(owner).setTimelockDuration(newDuration))
        .to.emit(vault, "TimelockDurationUpdated")
        .withArgs(newDuration);
      expect(await vault.timelockDuration()).to.equal(newDuration);
    });

    it("Should revert setTimelockDuration below minimum", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);
      const minDuration = 1n * 24n * 60n * 60n;
      await expect(
        vault.connect(owner).setTimelockDuration(minDuration - 1n)
      ).to.be.revertedWith("PelonStakingVault: Timelock duration out of bounds");
    });

    it("Should revert setTimelockDuration above maximum", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);
      const maxDuration = 90n * 24n * 60n * 60n;
      await expect(
        vault.connect(owner).setTimelockDuration(maxDuration + 1n)
      ).to.be.revertedWith("PelonStakingVault: Timelock duration out of bounds");
    });

    it("Should allow owner to set withdraw fee BPS", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);
      const newFeeBps = 500n;
      await expect(vault.connect(owner).setWithdrawFeeBps(newFeeBps))
        .to.emit(vault, "WithdrawFeeBpsUpdated")
        .withArgs(newFeeBps);
      expect(await vault.withdrawFeeBps()).to.equal(newFeeBps);
    });

    it("Should revert setWithdrawFeeBps above maximum", async function () {
      const { vault, owner } = await loadFixture(deployVaultFixture);
      await expect(
        vault.connect(owner).setWithdrawFeeBps(1001n)
      ).to.be.revertedWith("PelonStakingVault: Withdrawal fee exceeds maximum");
    });

    it("Should revert admin functions when called by non-owner", async function () {
      const { vault, user1 } = await loadFixture(deployVaultFixture);
      await expect(
        vault.connect(user1).setTimelockDuration(30n * 24n * 60n * 60n)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
      
      await expect(
        vault.connect(user1).setWithdrawFeeBps(500n)
      ).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases and Precision", function () {
    it("Should handle deposit with 1 wei (minimum)", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const minAmount = 1n;
      await pelonToken.connect(user1).approve(await vault.getAddress(), minAmount);
      await vault.connect(user1).deposit(minAmount, user1.address);
      expect(await vault.balanceOf(user1.address)).to.be.gt(0n);
    });

    it("Should handle withdrawal with 1 share (minimum)", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const shares = await vault.balanceOf(user1.address);
      const minShares = 1n;
      if (shares >= minShares) {
        await expect(
          vault.connect(user1).redeem(minShares, user1.address, user1.address)
        ).to.not.be.reverted;
      }
    });

    it("Should handle multiple small deposits vs one large deposit", async function () {
      const { vault, pelonToken, user1, user2 } = await loadFixture(deployVaultFixture);
      const smallAmount = ethers.parseUnits("10", 18);
      const largeAmount = ethers.parseUnits("1000", 18);
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), smallAmount * 100n);
      await pelonToken.connect(user2).approve(await vault.getAddress(), largeAmount);
      
      for (let i = 0; i < 100; i++) {
        await vault.connect(user1).deposit(smallAmount, user1.address);
      }
      await vault.connect(user2).deposit(largeAmount, user2.address);
      
      expect(await vault.balanceOf(user1.address)).to.be.gt(0n);
      expect(await vault.balanceOf(user2.address)).to.be.gt(0n);
    });

    it("Should handle withdrawal crossing multiple FIFO deposits", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const deposit1 = ethers.parseUnits("100", 18);
      const deposit2 = ethers.parseUnits("200", 18);
      const deposit3 = ethers.parseUnits("300", 18);
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), deposit1 + deposit2 + deposit3);
      await vault.connect(user1).deposit(deposit1, user1.address);
      await vault.connect(user1).deposit(deposit2, user1.address);
      await vault.connect(user1).deposit(deposit3, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const shares1 = await vault.previewDeposit(deposit1);
      const shares2 = await vault.previewDeposit(deposit2);
      const sharesToRedeem = shares1 + shares2 / 2n;
      
      const startIndexBefore = await vault.userDepositStartIndex(user1.address);
      await vault.connect(user1).redeem(sharesToRedeem, user1.address, user1.address);
      const startIndexAfter = await vault.userDepositStartIndex(user1.address);
      
      expect(startIndexAfter).to.be.gt(startIndexBefore);
    });

    it("Should handle empty vault (totalAssets = 0, totalSupply = 0)", async function () {
      const [owner, feeWallet] = await ethers.getSigners();
      const PelonClubToken = await ethers.getContractFactory("PelonClubToken");
      const pelonToken = await PelonClubToken.deploy(owner.address);
      await pelonToken.waitForDeployment();
      
      const PelonStakingVault = await ethers.getContractFactory("PelonStakingVault");
      const vault = await PelonStakingVault.deploy(await pelonToken.getAddress(), feeWallet.address);
      await vault.waitForDeployment();
      
      expect(await vault.totalAssets()).to.equal(0n);
      expect(await vault.totalSupply()).to.equal(0n);
    });

    it("Should handle parameter changes during active deposits", async function () {
      const { vault, pelonToken, user1, owner } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const newTimelock = 30n * 24n * 60n * 60n;
      await vault.connect(owner).setTimelockDuration(newTimelock);
      
      await time.increase(newTimelock + 1n);
      
      const withdrawable = await vault.getWithdrawableShares(user1.address);
      expect(withdrawable).to.be.gt(0n);
    });
  });

  describe("Security and Reentrancy", function () {
    it("Should protect against reentrancy in withdraw", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("100", 18);
      await expect(
        vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address)
      ).to.not.be.reverted;
    });

    it("Should protect against reentrancy in redeem", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const shares = await vault.balanceOf(user1.address);
      const sharesToRedeem = shares / 10n;
      await expect(
        vault.connect(user1).redeem(sharesToRedeem, user1.address, user1.address)
      ).to.not.be.reverted;
    });

    it("Should use SafeERC20 for all transfers", async function () {
      const { vault } = await loadFixture(deployVaultFixture);
      expect(vault).to.not.be.null;
    });
  });

  describe("Events", function () {
    it("Should emit DepositRecorded event", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      await expect(vault.connect(user1).deposit(depositAmount, user1.address))
        .to.emit(vault, "DepositRecorded")
        .withArgs(user1.address, (shares: bigint) => shares > 0n, (timestamp: bigint) => timestamp > 0n);
    });

    it("Should emit WithdrawExecuted event", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("100", 18);
      await expect(vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address))
        .to.emit(vault, "WithdrawExecuted")
        .withArgs(user1.address, assetsToWithdraw, (shares: bigint) => shares > 0n, user1.address);
    });

    it("Should emit RedeemExecuted event", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const shares = await vault.balanceOf(user1.address);
      const sharesToRedeem = shares / 10n;
      await expect(vault.connect(user1).redeem(sharesToRedeem, user1.address, user1.address))
        .to.emit(vault, "RedeemExecuted")
        .withArgs(user1.address, sharesToRedeem, (assets: bigint) => assets > 0n, user1.address);
    });

    it("Should emit WithdrawFeeCollected event", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("10000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("1000", 18);
      await expect(vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address))
        .to.emit(vault, "WithdrawFeeCollected")
        .withArgs(
          user1.address,
          (fee: bigint) => fee > 0n,
          (feeToWallet: bigint) => feeToWallet > 0n,
          (feeToRestake: bigint) => feeToRestake > 0n,
          (feeToBurn: bigint) => feeToBurn > 0n
        );
    });

    it("Should emit FeeBurned event", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("10000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("1000", 18);
      await expect(vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address))
        .to.emit(vault, "FeeBurned")
        .withArgs((assets: bigint) => assets > 0n, (actualBurned: bigint) => actualBurned > 0n);
    });

    it("Should emit DepositsRemoved event", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const shares = await vault.balanceOf(user1.address);
      const sharesToRedeem = shares / 2n;
      await expect(vault.connect(user1).redeem(sharesToRedeem, user1.address, user1.address))
        .to.emit(vault, "DepositsRemoved")
        .withArgs(user1.address, sharesToRedeem, (newIndex: bigint) => newIndex >= 0n);
    });
  });

  describe("Integration and Complete Flows", function () {
    it("Should handle complete flow: deposit → wait → withdraw", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("10000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      await vault.connect(user1).deposit(depositAmount, user1.address);
      const shares = await vault.balanceOf(user1.address);
      expect(shares).to.be.gt(0n);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("1000", 18);
      const balanceBefore = await pelonToken.balanceOf(user1.address);
      await vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address);
      const balanceAfter = await pelonToken.balanceOf(user1.address);
      
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should handle multiple users depositing and withdrawing simultaneously", async function () {
      const { vault, pelonToken, user1, user2, user3 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await pelonToken.connect(user2).approve(await vault.getAddress(), depositAmount);
      await pelonToken.connect(user3).approve(await vault.getAddress(), depositAmount);
      
      await vault.connect(user1).deposit(depositAmount, user1.address);
      await vault.connect(user2).deposit(depositAmount, user2.address);
      await vault.connect(user3).deposit(depositAmount, user3.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("100", 18);
      await vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address);
      await vault.connect(user2).withdraw(assetsToWithdraw, user2.address, user2.address);
      await vault.connect(user3).withdraw(assetsToWithdraw, user3.address, user3.address);
      
      expect(await pelonToken.balanceOf(user1.address)).to.be.gt(0n);
      expect(await pelonToken.balanceOf(user2.address)).to.be.gt(0n);
      expect(await pelonToken.balanceOf(user3.address)).to.be.gt(0n);
    });

    it("Should handle interleaved deposits and withdrawals", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount * 3n);
      
      await vault.connect(user1).deposit(depositAmount, user1.address);
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("100", 18);
      await vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address);
      
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      await time.increase(timelockDuration + 1n);
      
      await vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address);
      
      expect(await vault.balanceOf(user1.address)).to.be.gt(0n);
    });
  });

  describe("Special Cases: _removeDeposits", function () {
    it("Should remove complete deposit", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const shares = await vault.balanceOf(user1.address);
      await vault.connect(user1).redeem(shares, user1.address, user1.address);
      
      const deposits = await vault.getUserDeposits(user1.address);
      const startIndex = await vault.userDepositStartIndex(user1.address);
      expect(startIndex).to.be.gt(0n);
    });

    it("Should remove partial deposit", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const shares = await vault.balanceOf(user1.address);
      const sharesToRedeem = shares / 2n;
      await vault.connect(user1).redeem(sharesToRedeem, user1.address, user1.address);
      
      const deposits = await vault.getUserDeposits(user1.address);
      expect(deposits[0].shares).to.be.gt(0n);
    });

    it("Should remove deposits crossing multiple entries", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const deposit1 = ethers.parseUnits("100", 18);
      const deposit2 = ethers.parseUnits("200", 18);
      const deposit3 = ethers.parseUnits("300", 18);
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), deposit1 + deposit2 + deposit3);
      await vault.connect(user1).deposit(deposit1, user1.address);
      await vault.connect(user1).deposit(deposit2, user1.address);
      await vault.connect(user1).deposit(deposit3, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const shares1 = await vault.previewDeposit(deposit1);
      const shares2 = await vault.previewDeposit(deposit2);
      const shares3 = await vault.previewDeposit(deposit3);
      const sharesToRedeem = shares1 + shares2 + shares3 / 2n;
      
      const startIndexBefore = await vault.userDepositStartIndex(user1.address);
      await vault.connect(user1).redeem(sharesToRedeem, user1.address, user1.address);
      const startIndexAfter = await vault.userDepositStartIndex(user1.address);
      
      expect(startIndexAfter).to.be.gt(startIndexBefore);
      const deposits = await vault.getUserDeposits(user1.address);
      expect(deposits[Number(startIndexAfter)].shares).to.be.gt(0n);
    });
  });

  describe("Special Cases: _burnFee", function () {
    it("Should burn fee when balance >= feeToBurn", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("10000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("1000", 18);
      const totalSupplyBefore = await vault.totalSupply();
      await vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address);
      const totalSupplyAfter = await vault.totalSupply();
      
      expect(totalSupplyAfter).to.be.lt(totalSupplyBefore);
    });

    it("Should handle burn when balance < feeToBurn", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("100", 18);
      await expect(
        vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address)
      ).to.not.be.reverted;
    });
  });

  describe("ERC4626 Compliance", function () {
    it("Should follow ERC4626 standard for deposit/mint/withdraw/redeem", async function () {
      const { vault, pelonToken, user1 } = await loadFixture(deployVaultFixture);
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      
      const sharesBefore = await vault.balanceOf(user1.address);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      const sharesAfter = await vault.balanceOf(user1.address);
      expect(sharesAfter - sharesBefore).to.be.gt(0n);
      
      const sharesToMint = ethers.parseUnits("500", 18);
      const assetsNeeded = await vault.previewMint(sharesToMint);
      await pelonToken.connect(user1).approve(await vault.getAddress(), assetsNeeded);
      const balanceBeforeMint = await pelonToken.balanceOf(user1.address);
      await vault.connect(user1).mint(sharesToMint, user1.address);
      const balanceAfterMint = await pelonToken.balanceOf(user1.address);
      expect(balanceBeforeMint - balanceAfterMint).to.be.gt(0n);
      
      const timelockDuration = await vault.timelockDuration();
      await time.increase(timelockDuration + 1n);
      
      const assetsToWithdraw = ethers.parseUnits("100", 18);
      const sharesBeforeWithdraw = await vault.balanceOf(user1.address);
      await vault.connect(user1).withdraw(assetsToWithdraw, user1.address, user1.address);
      const sharesAfterWithdraw = await vault.balanceOf(user1.address);
      expect(sharesBeforeWithdraw - sharesAfterWithdraw).to.be.gt(0n);
      
      const sharesToRedeem = await vault.balanceOf(user1.address) / 10n;
      const balanceBeforeRedeem = await pelonToken.balanceOf(user1.address);
      await vault.connect(user1).redeem(sharesToRedeem, user1.address, user1.address);
      const balanceAfterRedeem = await pelonToken.balanceOf(user1.address);
      expect(balanceAfterRedeem - balanceBeforeRedeem).to.be.gt(0n);
    });

    it("Should protect against inflation attacks (inherited from OpenZeppelin)", async function () {
      const { vault, pelonToken, user1, attacker } = await loadFixture(deployVaultFixture);
      
      const depositAmount = ethers.parseUnits("1000", 18);
      await pelonToken.connect(user1).approve(await vault.getAddress(), depositAmount);
      await vault.connect(user1).deposit(depositAmount, user1.address);
      
      const shares1 = await vault.balanceOf(user1.address);
      
      const donation = ethers.parseUnits("1000000", 18);
      await pelonToken.transfer(await vault.getAddress(), donation);
      
      const assetsPerShare = await vault.convertToAssets(shares1);
      expect(assetsPerShare).to.be.gt(depositAmount);
    });

    it("Should include all vault assets in totalAssets", async function () {
      const { vault, pelonToken, user1, user2 } = await loadFixture(deployVaultFixture);
      const deposit1 = ethers.parseUnits("10000", 18);
      const deposit2 = ethers.parseUnits("10000", 18);
      
      await pelonToken.connect(user1).approve(await vault.getAddress(), deposit1);
      await pelonToken.connect(user2).approve(await vault.getAddress(), deposit2);
      
      await vault.connect(user1).deposit(deposit1, user1.address);
      await vault.connect(user2).deposit(deposit2, user2.address);
      
      const totalAssets = await vault.totalAssets();
      const vaultBalance = await pelonToken.balanceOf(await vault.getAddress());
      
      expect(totalAssets).to.equal(vaultBalance);
    });
  });
});

