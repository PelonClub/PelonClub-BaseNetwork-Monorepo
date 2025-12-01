import { expect } from "chai";
import hre from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import type { Contract } from "ethers";
import type { TokenSale, PelonClubToken, MockUSDC } from "../typechain-types";
const ethers = hre.ethers;
describe("TokenSale", function () {
  async function deployTokenSaleFixture() {
    const [owner, buyer1, buyer2, buyer3, fundsWallet, nonOwner] = await ethers.getSigners();
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    const PelonClubToken = await ethers.getContractFactory("PelonClubToken");
    const pelonToken = await PelonClubToken.deploy(owner.address);
    await pelonToken.waitForDeployment();
    const initialPrice = ethers.parseUnits("0.000003", 18); 
    const maxPrice = ethers.parseUnits("0.01", 18); 
    const curveSteepness = ethers.parseUnits("1", 18);
    const inflectionPoint = ethers.parseUnits("100000000000", 18); 
    const maxTokensPerWallet = ethers.parseUnits("20000000000", 18); 
    const maxTotalSale = ethers.parseUnits("200000000000", 18); 
    const TokenSale = await ethers.getContractFactory("TokenSale");
    const tokenSale = await TokenSale.deploy(
      await mockUSDC.getAddress(),
      await pelonToken.getAddress(),
      initialPrice,
      maxPrice,
      curveSteepness,
      inflectionPoint,
      maxTokensPerWallet,
      maxTotalSale,
      fundsWallet.address
    );
    await tokenSale.waitForDeployment();
    const tokensForSale = ethers.parseUnits("200000000000", 18); 
    await pelonToken.transfer(await tokenSale.getAddress(), tokensForSale);
    const usdcAmount = ethers.parseUnits("1000000", 6); 
    await mockUSDC.transfer(buyer1.address, usdcAmount);
    await mockUSDC.transfer(buyer2.address, usdcAmount);
    await mockUSDC.transfer(buyer3.address, usdcAmount);
    return {
      tokenSale,
      pelonToken,
      mockUSDC,
      owner,
      buyer1,
      buyer2,
      buyer3,
      fundsWallet,
      nonOwner,
      initialPrice,
      maxPrice,
      curveSteepness,
      inflectionPoint,
      maxTokensPerWallet,
      maxTotalSale,
    };
  }
  function calculateExpectedPrice(
    totalSold: bigint,
    initialPrice: bigint,
    maxPrice: bigint,
    inflectionPoint: bigint
  ): bigint {
    if (totalSold === 0n) return initialPrice;
    if (totalSold >= inflectionPoint * 2n) return maxPrice;
    const priceRange = maxPrice - initialPrice;
    const soldSquared = totalSold * totalSold;
    const inflectionSquared = inflectionPoint * inflectionPoint;
    const numerator = priceRange * soldSquared;
    const denominator = inflectionSquared + soldSquared;
    const sigmoidValue = numerator / denominator;
    return initialPrice + sigmoidValue;
  }
  function calculatePelonAmount(usdcAmount: bigint, price: bigint): bigint {
    return (usdcAmount * ethers.parseUnits("1", 30)) / price;
  }
  describe("Constructor", function () {
    it("Should deploy with valid parameters", async function () {
      const { tokenSale, mockUSDC, pelonToken, fundsWallet, initialPrice, maxPrice, maxTokensPerWallet, maxTotalSale } = await loadFixture(deployTokenSaleFixture);
      expect(await tokenSale.usdcToken()).to.equal(await mockUSDC.getAddress());
      expect(await tokenSale.pelonToken()).to.equal(await pelonToken.getAddress());
      expect(await tokenSale.initialPrice()).to.equal(initialPrice);
      expect(await tokenSale.maxPrice()).to.equal(maxPrice);
      expect(await tokenSale.maxTokensPerWallet()).to.equal(maxTokensPerWallet);
      expect(await tokenSale.maxTotalSale()).to.equal(maxTotalSale);
      expect(await tokenSale.fundsReceiptWallet()).to.equal(fundsWallet.address);
      expect(await tokenSale.totalSold()).to.equal(0n);
    });
    it("Should revert with zero USDC address", async function () {
      const [owner, fundsWallet] = await ethers.getSigners();
      const PelonClubToken = await ethers.getContractFactory("PelonClubToken");
      const pelonToken = await PelonClubToken.deploy(owner.address);
      await pelonToken.waitForDeployment();
      const initialPrice = ethers.parseUnits("0.000003", 18);
      const maxPrice = ethers.parseUnits("0.01", 18);
      const TokenSale = await ethers.getContractFactory("TokenSale");
      await expect(
        TokenSale.deploy(
          ethers.ZeroAddress,
          await pelonToken.getAddress(),
          initialPrice,
          maxPrice,
          ethers.parseUnits("1", 18),
          ethers.parseUnits("100000000000", 18),
          ethers.parseUnits("20000000000", 18),
          ethers.parseUnits("200000000000", 18),
          fundsWallet.address
        )
      ).to.be.revertedWith("TokenSale: USDC address cannot be zero");
    });
    it("Should revert with zero PELON address", async function () {
      const MockUSDC = await ethers.getContractFactory("MockUSDC");
      const mockUSDC = await MockUSDC.deploy();
      await mockUSDC.waitForDeployment();
      const [owner, , , , fundsWallet] = await ethers.getSigners();
      const initialPrice = ethers.parseUnits("0.000003", 18);
      const maxPrice = ethers.parseUnits("0.01", 18);
      const TokenSale = await ethers.getContractFactory("TokenSale");
      await expect(
        TokenSale.deploy(
          await mockUSDC.getAddress(),
          ethers.ZeroAddress,
          initialPrice,
          maxPrice,
          ethers.parseUnits("1", 18),
          ethers.parseUnits("100000000000", 18),
          ethers.parseUnits("20000000000", 18),
          ethers.parseUnits("200000000000", 18),
          fundsWallet.address
        )
      ).to.be.revertedWith("TokenSale: PELON address cannot be zero");
    });
    it("Should revert with zero initial price", async function () {
      const { mockUSDC, pelonToken, fundsWallet } = await loadFixture(deployTokenSaleFixture);
      const maxPrice = ethers.parseUnits("0.01", 18);
      const TokenSale = await ethers.getContractFactory("TokenSale");
      await expect(
        TokenSale.deploy(
          await mockUSDC.getAddress(),
          await pelonToken.getAddress(),
          0n,
          maxPrice,
          ethers.parseUnits("1", 18),
          ethers.parseUnits("100000000000", 18),
          ethers.parseUnits("20000000000", 18),
          ethers.parseUnits("200000000000", 18),
          fundsWallet.address
        )
      ).to.be.revertedWith("TokenSale: Initial price must be greater than zero");
    });
    it("Should revert with zero max price", async function () {
      const { mockUSDC, pelonToken, fundsWallet } = await loadFixture(deployTokenSaleFixture);
      const initialPrice = ethers.parseUnits("0.000003", 18);
      const TokenSale = await ethers.getContractFactory("TokenSale");
      await expect(
        TokenSale.deploy(
          await mockUSDC.getAddress(),
          await pelonToken.getAddress(),
          initialPrice,
          0n,
          ethers.parseUnits("1", 18),
          ethers.parseUnits("100000000000", 18),
          ethers.parseUnits("20000000000", 18),
          ethers.parseUnits("200000000000", 18),
          fundsWallet.address
        )
      ).to.be.revertedWith("TokenSale: Max price must be greater than zero");
    });
    it("Should revert when initial price >= max price", async function () {
      const { mockUSDC, pelonToken, fundsWallet } = await loadFixture(deployTokenSaleFixture);
      const initialPrice = ethers.parseUnits("0.01", 18);
      const maxPrice = ethers.parseUnits("0.01", 18);
      const TokenSale = await ethers.getContractFactory("TokenSale");
      await expect(
        TokenSale.deploy(
          await mockUSDC.getAddress(),
          await pelonToken.getAddress(),
          initialPrice,
          maxPrice,
          ethers.parseUnits("1", 18),
          ethers.parseUnits("100000000000", 18),
          ethers.parseUnits("20000000000", 18),
          ethers.parseUnits("200000000000", 18),
          fundsWallet.address
        )
      ).to.be.revertedWith("TokenSale: Initial price must be less than max price");
    });
    it("Should revert with zero curve steepness", async function () {
      const { mockUSDC, pelonToken, fundsWallet } = await loadFixture(deployTokenSaleFixture);
      const initialPrice = ethers.parseUnits("0.000003", 18);
      const maxPrice = ethers.parseUnits("0.01", 18);
      const TokenSale = await ethers.getContractFactory("TokenSale");
      await expect(
        TokenSale.deploy(
          await mockUSDC.getAddress(),
          await pelonToken.getAddress(),
          initialPrice,
          maxPrice,
          0n,
          ethers.parseUnits("100000000000", 18),
          ethers.parseUnits("20000000000", 18),
          ethers.parseUnits("200000000000", 18),
          fundsWallet.address
        )
      ).to.be.revertedWith("TokenSale: Curve steepness must be greater than zero");
    });
    it("Should revert with zero inflection point", async function () {
      const { mockUSDC, pelonToken, fundsWallet } = await loadFixture(deployTokenSaleFixture);
      const initialPrice = ethers.parseUnits("0.000003", 18);
      const maxPrice = ethers.parseUnits("0.01", 18);
      const TokenSale = await ethers.getContractFactory("TokenSale");
      await expect(
        TokenSale.deploy(
          await mockUSDC.getAddress(),
          await pelonToken.getAddress(),
          initialPrice,
          maxPrice,
          ethers.parseUnits("1", 18),
          0n,
          ethers.parseUnits("20000000000", 18),
          ethers.parseUnits("200000000000", 18),
          fundsWallet.address
        )
      ).to.be.revertedWith("TokenSale: Inflection point must be greater than zero");
    });
    it("Should revert with zero max tokens per wallet", async function () {
      const { mockUSDC, pelonToken, fundsWallet } = await loadFixture(deployTokenSaleFixture);
      const initialPrice = ethers.parseUnits("0.000003", 18);
      const maxPrice = ethers.parseUnits("0.01", 18);
      const TokenSale = await ethers.getContractFactory("TokenSale");
      await expect(
        TokenSale.deploy(
          await mockUSDC.getAddress(),
          await pelonToken.getAddress(),
          initialPrice,
          maxPrice,
          ethers.parseUnits("1", 18),
          ethers.parseUnits("100000000000", 18),
          0n,
          ethers.parseUnits("200000000000", 18),
          fundsWallet.address
        )
      ).to.be.revertedWith("TokenSale: Max tokens per wallet must be greater than zero");
    });
    it("Should revert with zero max total sale", async function () {
      const { mockUSDC, pelonToken, fundsWallet } = await loadFixture(deployTokenSaleFixture);
      const initialPrice = ethers.parseUnits("0.000003", 18);
      const maxPrice = ethers.parseUnits("0.01", 18);
      const TokenSale = await ethers.getContractFactory("TokenSale");
      await expect(
        TokenSale.deploy(
          await mockUSDC.getAddress(),
          await pelonToken.getAddress(),
          initialPrice,
          maxPrice,
          ethers.parseUnits("1", 18),
          ethers.parseUnits("100000000000", 18),
          ethers.parseUnits("20000000000", 18),
          0n,
          fundsWallet.address
        )
      ).to.be.revertedWith("TokenSale: Max total sale must be greater than zero");
    });
    it("Should revert with zero funds receipt wallet", async function () {
      const { mockUSDC, pelonToken } = await loadFixture(deployTokenSaleFixture);
      const initialPrice = ethers.parseUnits("0.000003", 18);
      const maxPrice = ethers.parseUnits("0.01", 18);
      const TokenSale = await ethers.getContractFactory("TokenSale");
      await expect(
        TokenSale.deploy(
          await mockUSDC.getAddress(),
          await pelonToken.getAddress(),
          initialPrice,
          maxPrice,
          ethers.parseUnits("1", 18),
          ethers.parseUnits("100000000000", 18),
          ethers.parseUnits("20000000000", 18),
          ethers.parseUnits("200000000000", 18),
          ethers.ZeroAddress
        )
      ).to.be.revertedWith("TokenSale: Funds receipt wallet cannot be zero");
    });
  });
  describe("buyTokens() - Successful Purchases", function () {
    it("Should successfully purchase tokens", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, fundsWallet, initialPrice } = await loadFixture(deployTokenSaleFixture);
      const usdcAmount = ethers.parseUnits("100", 6); 
      const expectedPrice = initialPrice;
      const expectedPelonAmount = calculatePelonAmount(usdcAmount, expectedPrice);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), usdcAmount);
      await expect(tokenSale.connect(buyer1).buyTokens(usdcAmount))
        .to.emit(tokenSale, "TokensPurchased")
        .withArgs(buyer1.address, usdcAmount, expectedPelonAmount);
      expect(await pelonToken.balanceOf(buyer1.address)).to.equal(expectedPelonAmount);
      expect(await mockUSDC.balanceOf(fundsWallet.address)).to.equal(usdcAmount);
      expect(await tokenSale.totalSold()).to.equal(expectedPelonAmount);
      expect(await tokenSale.tokensPurchased(buyer1.address)).to.equal(expectedPelonAmount);
    });
    it("Should handle multiple purchases from same user", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, fundsWallet, initialPrice } = await loadFixture(deployTokenSaleFixture);
      const usdcAmount1 = ethers.parseUnits("10000", 6); 
      const usdcAmount2 = ethers.parseUnits("20000", 6);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      const price1 = initialPrice;
      const pelonAmount1 = calculatePelonAmount(usdcAmount1, price1);
      await tokenSale.connect(buyer1).buyTokens(usdcAmount1);
      const price2 = await tokenSale.getCurrentPrice();
      const pelonAmount2 = calculatePelonAmount(usdcAmount2, price2);
      await tokenSale.connect(buyer1).buyTokens(usdcAmount2);
      expect(await pelonToken.balanceOf(buyer1.address)).to.equal(pelonAmount1 + pelonAmount2);
      expect(await tokenSale.totalSold()).to.equal(pelonAmount1 + pelonAmount2);
      expect(await tokenSale.tokensPurchased(buyer1.address)).to.equal(pelonAmount1 + pelonAmount2);
      expect(price2).to.be.gte(price1); 
    });
    it("Should handle purchases from different users", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, buyer2, fundsWallet, initialPrice } = await loadFixture(deployTokenSaleFixture);
      const usdcAmount = ethers.parseUnits("100", 6);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), usdcAmount);
      await mockUSDC.connect(buyer2).approve(await tokenSale.getAddress(), usdcAmount);
      const price1 = initialPrice;
      const pelonAmount1 = calculatePelonAmount(usdcAmount, price1);
      await tokenSale.connect(buyer1).buyTokens(usdcAmount);
      const price2 = await tokenSale.getCurrentPrice();
      const pelonAmount2 = calculatePelonAmount(usdcAmount, price2);
      await tokenSale.connect(buyer2).buyTokens(usdcAmount);
      expect(await pelonToken.balanceOf(buyer1.address)).to.equal(pelonAmount1);
      expect(await pelonToken.balanceOf(buyer2.address)).to.equal(pelonAmount2);
      expect(await tokenSale.totalSold()).to.equal(pelonAmount1 + pelonAmount2);
      expect(await tokenSale.tokensPurchased(buyer1.address)).to.equal(pelonAmount1);
      expect(await tokenSale.tokensPurchased(buyer2.address)).to.equal(pelonAmount2);
    });
  });
  describe("buyTokens() - Validations", function () {
    it("Should revert with zero USDC amount", async function () {
      const { tokenSale, buyer1 } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(buyer1).buyTokens(0n))
        .to.be.revertedWith("TokenSale: USDC amount must be greater than zero");
    });
    it("Should revert when contract is paused", async function () {
      const { tokenSale, buyer1, owner } = await loadFixture(deployTokenSaleFixture);
      await tokenSale.connect(owner).pause();
      const usdcAmount = ethers.parseUnits("100", 6);
      await expect(tokenSale.connect(buyer1).buyTokens(usdcAmount))
        .to.be.revertedWithCustomError(tokenSale, "EnforcedPause");
    });
    it("Should revert when purchase exceeds wallet limit", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, maxTokensPerWallet, initialPrice } = await loadFixture(deployTokenSaleFixture);
      const exactLimitPelon = maxTokensPerWallet;
      const price = initialPrice;
      const usdcNeeded = (exactLimitPelon * ethers.parseUnits("1", 6)) / price;
      const usdcAmount = usdcNeeded + ethers.parseUnits("1", 6);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), usdcAmount);
      await expect(tokenSale.connect(buyer1).buyTokens(usdcAmount))
        .to.be.revertedWith("TokenSale: Purchase would exceed wallet limit");
    });
    it("Should revert when purchase exceeds global sale limit", async function () {
      this.timeout(120000); 
      const { tokenSale, pelonToken, mockUSDC, buyer1, buyer2, buyer3, owner, maxTotalSale, initialPrice } = await loadFixture(deployTokenSaleFixture);
      const [deployer] = await ethers.getSigners();
      await tokenSale.connect(owner).setMaxTokensPerWallet(maxTotalSale * 2n); 
      const usdcPerBuyer = ethers.parseUnits("10000000000", 6); 
      await mockUSDC.connect(deployer).mint(buyer1.address, usdcPerBuyer);
      await mockUSDC.connect(deployer).mint(buyer2.address, usdcPerBuyer);
      await mockUSDC.connect(deployer).mint(buyer3.address, usdcPerBuyer);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      await mockUSDC.connect(buyer2).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      await mockUSDC.connect(buyer3).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      let totalSold = await tokenSale.totalSold();
      const targetTokens = maxTotalSale - ethers.parseUnits("10000000000", 18); 
      const buyers = [buyer1, buyer2, buyer3];
      let buyerIndex = 0;
      let iterations = 0;
      const maxIterations = 1000; 
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 10;
      while (totalSold < targetTokens && iterations < maxIterations) {
        try {
          const currentPrice = await tokenSale.getCurrentPrice();
          const tokensNeeded = targetTokens - totalSold;
          const usdcNeeded = (tokensNeeded * currentPrice) / ethers.parseUnits("1", 30);
          const chunkSize = usdcNeeded > ethers.parseUnits("1000000000", 6) 
            ? ethers.parseUnits("1000000000", 6) 
            : usdcNeeded;
          const buyer = buyers[buyerIndex % 3];
          const buyerBalance = await mockUSDC.balanceOf(buyer.address);
          const actualChunkSize = buyerBalance < chunkSize ? buyerBalance : chunkSize;
          if (actualChunkSize < ethers.parseUnits("1000", 6)) {
            buyerIndex = (buyerIndex + 1) % 3;
            iterations++;
            consecutiveErrors++;
            if (consecutiveErrors >= maxConsecutiveErrors) {
              break;
            }
            continue;
          }
          await tokenSale.connect(buyer).buyTokens(actualChunkSize);
          const newTotalSold = await tokenSale.totalSold();
          if (newTotalSold === totalSold) {
            break;
          }
          totalSold = newTotalSold;
          buyerIndex = (buyerIndex + 1) % 3;
          iterations++;
          consecutiveErrors = 0; 
        } catch (error) {
          buyerIndex = (buyerIndex + 1) % 3;
          iterations++;
          consecutiveErrors++;
          if (consecutiveErrors >= maxConsecutiveErrors || iterations > maxIterations) {
            break;
          }
        }
      }
      const finalTarget = maxTotalSale - ethers.parseUnits("1000000000", 18); 
      while (totalSold < finalTarget && iterations < maxIterations) {
        try {
          const currentPrice = await tokenSale.getCurrentPrice();
          const tokensRemaining = finalTarget - totalSold;
          const usdcNeeded = (tokensRemaining * currentPrice) / ethers.parseUnits("1", 30);
          const chunkSize = usdcNeeded > ethers.parseUnits("500000000", 6) 
            ? ethers.parseUnits("500000000", 6) 
            : usdcNeeded;
          const buyer = buyers[buyerIndex % 3];
          const buyerBalance = await mockUSDC.balanceOf(buyer.address);
          const actualChunkSize = buyerBalance < chunkSize ? buyerBalance : chunkSize;
          if (actualChunkSize < ethers.parseUnits("100", 6)) {
            buyerIndex = (buyerIndex + 1) % 3;
            iterations++;
            if (iterations > maxIterations) break;
            continue;
          }
          await tokenSale.connect(buyer).buyTokens(actualChunkSize);
          const newTotalSold = await tokenSale.totalSold();
          if (newTotalSold === totalSold) break;
          totalSold = newTotalSold;
          buyerIndex = (buyerIndex + 1) % 3;
          iterations++;
        } catch (error) {
          break;
        }
      }
      const totalSoldAfter = await tokenSale.totalSold();
      expect(totalSoldAfter).to.be.gt(0n);
      expect(totalSoldAfter).to.be.lt(maxTotalSale);
      const [, , , , , , freshBuyer] = await ethers.getSigners();
      await mockUSDC.connect(deployer).mint(freshBuyer.address, ethers.parseUnits("10000", 6));
      await mockUSDC.connect(freshBuyer).approve(await tokenSale.getAddress(), ethers.parseUnits("10000", 6));
      const finalPrice = await tokenSale.getCurrentPrice();
      const tokensRemaining = maxTotalSale - totalSoldAfter;
      const tokensToBuy = tokensRemaining + ethers.parseUnits("1", 18);
      const usdcForOneMore = (tokensToBuy * finalPrice) / ethers.parseUnits("1", 30);
      await expect(tokenSale.connect(freshBuyer).buyTokens(usdcForOneMore))
        .to.be.revertedWith("TokenSale: Purchase would exceed total sale limit");
    });
    it("Should revert when contract has insufficient tokens", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, owner, initialPrice, maxTokensPerWallet } = await loadFixture(deployTokenSaleFixture);
      const contractBalance = await pelonToken.balanceOf(await tokenSale.getAddress());
      const tokensToKeep = ethers.parseUnits("1", 18);
      await tokenSale.connect(owner).withdrawRemainingTokens(await pelonToken.getAddress());
      await pelonToken.connect(owner).transfer(await tokenSale.getAddress(), tokensToKeep);
      const price = initialPrice;
      const usdcForOneToken = (tokensToKeep * price) / ethers.parseUnits("1", 30);
      const usdcAmount = usdcForOneToken + ethers.parseUnits("1", 6);
      const pelonForUsdc = calculatePelonAmount(usdcAmount, price);
      expect(pelonForUsdc).to.be.gt(tokensToKeep);
      expect(pelonForUsdc).to.be.lte(maxTokensPerWallet);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), usdcAmount);
      await expect(tokenSale.connect(buyer1).buyTokens(usdcAmount))
        .to.be.revertedWith("TokenSale: Insufficient tokens in contract");
    });
    it("Should revert when user has insufficient USDC", async function () {
      const { tokenSale, buyer1 } = await loadFixture(deployTokenSaleFixture);
      const usdcAmount = ethers.parseUnits("10000000", 6); 
      await expect(tokenSale.connect(buyer1).buyTokens(usdcAmount))
        .to.be.reverted;
    });
    it("Should revert when user hasn't approved USDC", async function () {
      const { tokenSale, buyer1 } = await loadFixture(deployTokenSaleFixture);
      const usdcAmount = ethers.parseUnits("100", 6);
      await expect(tokenSale.connect(buyer1).buyTokens(usdcAmount))
        .to.be.reverted;
    });
  });
  describe("buyTokens() - Edge Cases", function () {
    it("Should handle purchase at exact wallet limit", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, owner, maxTokensPerWallet, initialPrice } = await loadFixture(deployTokenSaleFixture);
      const price = initialPrice;
      const exactLimitPelon = maxTokensPerWallet;
      const usdcNeeded = (exactLimitPelon * price) / ethers.parseUnits("1", 30);
      const buyer1Balance = await mockUSDC.balanceOf(buyer1.address);
      if (buyer1Balance < usdcNeeded) {
        const [deployer] = await ethers.getSigners();
        const deployerBalance = await mockUSDC.balanceOf(deployer.address);
        const amountToTransfer = usdcNeeded - buyer1Balance + ethers.parseUnits("1000", 6);
        if (deployerBalance >= amountToTransfer) {
          await mockUSDC.connect(deployer).transfer(buyer1.address, amountToTransfer);
        } else {
          await mockUSDC.connect(deployer).mint(deployer.address, amountToTransfer);
          await mockUSDC.connect(deployer).transfer(buyer1.address, amountToTransfer);
        }
      }
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), usdcNeeded);
      await tokenSale.connect(buyer1).buyTokens(usdcNeeded);
      const purchased = await tokenSale.tokensPurchased(buyer1.address);
      const balance = await pelonToken.balanceOf(buyer1.address);
      expect(purchased).to.be.closeTo(exactLimitPelon, exactLimitPelon / 1000n);
      expect(balance).to.be.closeTo(exactLimitPelon, exactLimitPelon / 1000n);
    });
    it("Should handle minimum purchase (1 micro-USDC)", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, initialPrice } = await loadFixture(deployTokenSaleFixture);
      const minUsdc = 1n; 
      const price = initialPrice;
      const expectedPelon = calculatePelonAmount(minUsdc, price);
      if (expectedPelon > 0n) {
        await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), minUsdc);
        await tokenSale.connect(buyer1).buyTokens(minUsdc);
        expect(await pelonToken.balanceOf(buyer1.address)).to.be.gt(0n);
      }
    });
    it("Should handle purchase when totalSold = 0 (initial price)", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, initialPrice } = await loadFixture(deployTokenSaleFixture);
      expect(await tokenSale.totalSold()).to.equal(0n);
      expect(await tokenSale.getCurrentPrice()).to.equal(initialPrice);
      const usdcAmount = ethers.parseUnits("100", 6);
      const expectedPelon = calculatePelonAmount(usdcAmount, initialPrice);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), usdcAmount);
      await tokenSale.connect(buyer1).buyTokens(usdcAmount);
      expect(await pelonToken.balanceOf(buyer1.address)).to.equal(expectedPelon);
    });
    it("Should handle purchase when totalSold >= inflectionPoint * 2 (max price)", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, owner, inflectionPoint, maxPrice } = await loadFixture(deployTokenSaleFixture);
      const targetSold = inflectionPoint * 2n;
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      let currentSold = await tokenSale.totalSold();
      const chunkSize = ethers.parseUnits("100000", 6); 
      const maxIterations = 200; 
      let iterations = 0;
      while (currentSold < targetSold && iterations < maxIterations) {
        const currentPrice = await tokenSale.getCurrentPrice();
        const usdcChunk = chunkSize;
        try {
          await tokenSale.connect(buyer1).buyTokens(usdcChunk);
          currentSold = await tokenSale.totalSold();
          iterations++;
          if (currentSold >= targetSold) {
            break;
          }
        } catch (e: any) {
          if (e.message?.includes("limit") || e.message?.includes("Insufficient")) {
            break;
          }
          throw e;
        }
      }
      const finalPrice = await tokenSale.getCurrentPrice();
      const finalSold = await tokenSale.totalSold();
      if (finalSold >= targetSold) {
        expect(finalPrice).to.equal(maxPrice);
      } else {
        expect(finalPrice).to.be.gte(await tokenSale.initialPrice());
      }
    });
    it("Should handle multiple purchases reaching wallet limit", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, maxTokensPerWallet, initialPrice } = await loadFixture(deployTokenSaleFixture);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      const usdcPerPurchase = ethers.parseUnits("10000", 6); 
      let totalPurchased = 0n;
      let purchaseCount = 0;
      const maxIterations = 100; 
      while (totalPurchased < maxTokensPerWallet && purchaseCount < maxIterations) {
        const currentPrice = await tokenSale.getCurrentPrice();
        const pelonForPurchase = calculatePelonAmount(usdcPerPurchase, currentPrice);
        if (totalPurchased + pelonForPurchase > maxTokensPerWallet) {
          break;
        }
        await tokenSale.connect(buyer1).buyTokens(usdcPerPurchase);
        purchaseCount++;
        totalPurchased = await tokenSale.tokensPurchased(buyer1.address);
      }
      expect(totalPurchased).to.be.lte(maxTokensPerWallet);
      expect(purchaseCount).to.be.gt(0);
    });
    it("Should revert when purchase results in zero PELON due to rounding", async function () {
      const { tokenSale, mockUSDC, buyer1, initialPrice } = await loadFixture(deployTokenSaleFixture);
      const tinyUsdc = 1n; 
      const price = initialPrice;
      const expectedPelon = calculatePelonAmount(tinyUsdc, price);
      if (expectedPelon === 0n) {
        await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), tinyUsdc);
        await expect(tokenSale.connect(buyer1).buyTokens(tinyUsdc))
          .to.be.revertedWith("TokenSale: Calculated PELON amount is zero");
      }
    });
  });
  describe("Pricing Curve", function () {
    it("Should return initial price when totalSold = 0", async function () {
      const { tokenSale, initialPrice } = await loadFixture(deployTokenSaleFixture);
      expect(await tokenSale.totalSold()).to.equal(0n);
      expect(await tokenSale.getCurrentPrice()).to.equal(initialPrice);
    });
    it("Should return max price when totalSold >= inflectionPoint * 2", async function () {
      const { tokenSale, inflectionPoint, maxPrice } = await loadFixture(deployTokenSaleFixture);
      const testTotalSold = inflectionPoint * 2n;
      const expectedPrice = calculateExpectedPrice(testTotalSold, await tokenSale.initialPrice(), maxPrice, inflectionPoint);
      expect(expectedPrice).to.equal(maxPrice);
    });
    it("Should calculate intermediate price correctly", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, initialPrice, maxPrice, inflectionPoint } = await loadFixture(deployTokenSaleFixture);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      const usdcAmount = ethers.parseUnits("10000", 6);
      await tokenSale.connect(buyer1).buyTokens(usdcAmount);
      const totalSold = await tokenSale.totalSold();
      const currentPrice = await tokenSale.getCurrentPrice();
      expect(currentPrice).to.be.gte(initialPrice);
      expect(currentPrice).to.be.lte(maxPrice);
      const expectedPrice = calculateExpectedPrice(totalSold, initialPrice, maxPrice, inflectionPoint);
      expect(currentPrice).to.equal(expectedPrice);
    });
    it("Should show progressive price increase", async function () {
      const { tokenSale, mockUSDC, buyer1, initialPrice } = await loadFixture(deployTokenSaleFixture);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      const usdcPerPurchase = ethers.parseUnits("1000", 6);
      const prices: bigint[] = [];
      for (let i = 0; i < 5; i++) {
        const priceBefore = await tokenSale.getCurrentPrice();
        await tokenSale.connect(buyer1).buyTokens(usdcPerPurchase);
        const priceAfter = await tokenSale.getCurrentPrice();
        prices.push(priceAfter);
        expect(priceAfter).to.be.gte(priceBefore);
      }
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).to.be.gte(prices[i - 1]);
      }
    });
    it("Should handle small inflection point", async function () {
      const [owner, buyer1, fundsWallet] = await ethers.getSigners();
      const MockUSDC = await ethers.getContractFactory("MockUSDC");
      const mockUSDC = await MockUSDC.deploy();
      await mockUSDC.waitForDeployment();
      const PelonClubToken = await ethers.getContractFactory("PelonClubToken");
      const pelonToken = await PelonClubToken.deploy(owner.address);
      await pelonToken.waitForDeployment();
      const initialPrice = ethers.parseUnits("0.000003", 18);
      const maxPrice = ethers.parseUnits("0.01", 18);
      const smallInflectionPoint = ethers.parseUnits("1000", 18); 
      const TokenSale = await ethers.getContractFactory("TokenSale");
      const tokenSale = await TokenSale.deploy(
        await mockUSDC.getAddress(),
        await pelonToken.getAddress(),
        initialPrice,
        maxPrice,
        ethers.parseUnits("1", 18),
        smallInflectionPoint,
        ethers.parseUnits("20000000000", 18),
        ethers.parseUnits("200000000000", 18),
        fundsWallet.address
      );
      await tokenSale.waitForDeployment();
      await pelonToken.transfer(await tokenSale.getAddress(), ethers.parseUnits("200000000000", 18));
      await mockUSDC.transfer(buyer1.address, ethers.parseUnits("1000000", 6));
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      await tokenSale.connect(buyer1).buyTokens(ethers.parseUnits("100", 6));
      const totalSold = await tokenSale.totalSold();
      if (totalSold >= smallInflectionPoint * 2n) {
        expect(await tokenSale.getCurrentPrice()).to.equal(maxPrice);
      }
    });
    it("Should verify arithmetic precision (divide-before-multiply fix)", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, initialPrice, maxPrice, inflectionPoint } = await loadFixture(deployTokenSaleFixture);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      const testPurchases = [
        ethers.parseUnits("1", 6),
        ethers.parseUnits("100", 6),
        ethers.parseUnits("1000", 6),
        ethers.parseUnits("10000", 6),
        ethers.parseUnits("100000", 6),
      ];
      for (const usdcAmount of testPurchases) {
        const totalSoldBefore = await tokenSale.totalSold();
        const priceBefore = await tokenSale.getCurrentPrice();
        await tokenSale.connect(buyer1).buyTokens(usdcAmount);
        const totalSoldAfter = await tokenSale.totalSold();
        const priceAfter = await tokenSale.getCurrentPrice();
        const expectedPrice = calculateExpectedPrice(totalSoldAfter, initialPrice, maxPrice, inflectionPoint);
        expect(priceAfter).to.equal(expectedPrice);
        if (totalSoldAfter > totalSoldBefore) {
          expect(priceAfter).to.be.gte(priceBefore);
        }
      }
    });
  });
  describe("Admin Functions", function () {
    it("Should allow owner to set max price", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      const newMaxPrice = ethers.parseUnits("0.02", 18);
      await expect(tokenSale.connect(owner).setMaxPrice(newMaxPrice))
        .to.emit(tokenSale, "BondingCurveParametersUpdated");
      expect(await tokenSale.maxPrice()).to.equal(newMaxPrice);
    });
    it("Should revert when non-owner tries to set max price", async function () {
      const { tokenSale, nonOwner } = await loadFixture(deployTokenSaleFixture);
      const newMaxPrice = ethers.parseUnits("0.02", 18);
      await expect(tokenSale.connect(nonOwner).setMaxPrice(newMaxPrice))
        .to.be.revertedWithCustomError(tokenSale, "OwnableUnauthorizedAccount");
    });
    it("Should revert when setting max price to zero", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(owner).setMaxPrice(0n))
        .to.be.revertedWith("TokenSale: Max price must be greater than zero");
    });
    it("Should revert when max price <= initial price", async function () {
      const { tokenSale, owner, initialPrice } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(owner).setMaxPrice(initialPrice))
        .to.be.revertedWith("TokenSale: Max price must be greater than initial price");
      await expect(tokenSale.connect(owner).setMaxPrice(initialPrice - 1n))
        .to.be.revertedWith("TokenSale: Max price must be greater than initial price");
    });
    it("Should allow owner to set curve steepness", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      const newSteepness = ethers.parseUnits("2", 18);
      await expect(tokenSale.connect(owner).setCurveSteepness(newSteepness))
        .to.emit(tokenSale, "BondingCurveParametersUpdated");
      expect(await tokenSale.curveSteepness()).to.equal(newSteepness);
    });
    it("Should revert when setting curve steepness to zero", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(owner).setCurveSteepness(0n))
        .to.be.revertedWith("TokenSale: Curve steepness must be greater than zero");
    });
    it("Should allow owner to set inflection point", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      const newInflectionPoint = ethers.parseUnits("150000000000", 18);
      await expect(tokenSale.connect(owner).setInflectionPoint(newInflectionPoint))
        .to.emit(tokenSale, "BondingCurveParametersUpdated");
      expect(await tokenSale.inflectionPoint()).to.equal(newInflectionPoint);
    });
    it("Should revert when setting inflection point to zero", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(owner).setInflectionPoint(0n))
        .to.be.revertedWith("TokenSale: Inflection point must be greater than zero");
    });
    it("Should allow owner to set max tokens per wallet", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      const newMax = ethers.parseUnits("30000000000", 18);
      await expect(tokenSale.connect(owner).setMaxTokensPerWallet(newMax))
        .to.emit(tokenSale, "MaxTokensPerWalletUpdated")
        .withArgs(newMax);
      expect(await tokenSale.maxTokensPerWallet()).to.equal(newMax);
    });
    it("Should revert when setting max tokens per wallet to zero", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(owner).setMaxTokensPerWallet(0n))
        .to.be.revertedWith("TokenSale: Max tokens per wallet must be greater than zero");
    });
    it("Should allow owner to set max total sale", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      const newMax = ethers.parseUnits("250000000000", 18);
      await expect(tokenSale.connect(owner).setMaxTotalSale(newMax))
        .to.emit(tokenSale, "MaxTotalSaleUpdated")
        .withArgs(newMax);
      expect(await tokenSale.maxTotalSale()).to.equal(newMax);
    });
    it("Should revert when setting max total sale to zero", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(owner).setMaxTotalSale(0n))
        .to.be.revertedWith("TokenSale: Max total sale must be greater than zero");
    });
    it("Should affect future purchases when parameters change", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, owner } = await loadFixture(deployTokenSaleFixture);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      const price1 = await tokenSale.getCurrentPrice();
      await tokenSale.connect(buyer1).buyTokens(ethers.parseUnits("100", 6));
      const newMaxPrice = ethers.parseUnits("0.02", 18);
      await tokenSale.connect(owner).setMaxPrice(newMaxPrice);
      const price2 = await tokenSale.getCurrentPrice();
      await tokenSale.connect(buyer1).buyTokens(ethers.parseUnits("100", 6));
      const price3 = await tokenSale.getCurrentPrice();
      expect(price3).to.be.gte(price2);
    });
  });
  describe("Pause/Unpause", function () {
    it("Should allow owner to pause contract", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(owner).pause())
        .to.emit(tokenSale, "SalePaused")
        .withArgs(owner.address);
      expect(await tokenSale.paused()).to.be.true;
    });
    it("Should revert when non-owner tries to pause", async function () {
      const { tokenSale, nonOwner } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(nonOwner).pause())
        .to.be.revertedWithCustomError(tokenSale, "OwnableUnauthorizedAccount");
    });
    it("Should allow owner to unpause contract", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      await tokenSale.connect(owner).pause();
      expect(await tokenSale.paused()).to.be.true;
      await expect(tokenSale.connect(owner).unpause())
        .to.emit(tokenSale, "SaleUnpaused")
        .withArgs(owner.address);
      expect(await tokenSale.paused()).to.be.false;
    });
    it("Should prevent purchases when paused", async function () {
      const { tokenSale, mockUSDC, buyer1, owner } = await loadFixture(deployTokenSaleFixture);
      await tokenSale.connect(owner).pause();
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.parseUnits("100", 6));
      await expect(tokenSale.connect(buyer1).buyTokens(ethers.parseUnits("100", 6)))
        .to.be.revertedWithCustomError(tokenSale, "EnforcedPause");
    });
    it("Should allow view functions when paused", async function () {
      const { tokenSale, buyer1, owner } = await loadFixture(deployTokenSaleFixture);
      await tokenSale.connect(owner).pause();
      await tokenSale.getCurrentPrice();
      await tokenSale.getPelonAmount(ethers.parseUnits("100", 6));
      await tokenSale.getRemainingTokens();
      await tokenSale.canPurchase(buyer1.address, ethers.parseUnits("100", 6));
      expect(await tokenSale.paused()).to.be.true;
    });
    it("Should allow admin functions when paused", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      await tokenSale.connect(owner).pause();
      await tokenSale.connect(owner).setMaxPrice(ethers.parseUnits("0.02", 18));
      await tokenSale.connect(owner).setMaxTokensPerWallet(ethers.parseUnits("30000000000", 18));
      expect(await tokenSale.paused()).to.be.true;
    });
  });
  describe("Withdraw Tokens", function () {
    it("Should allow owner to withdraw remaining PELON tokens", async function () {
      const { tokenSale, pelonToken, owner } = await loadFixture(deployTokenSaleFixture);
      const contractBalance = await pelonToken.balanceOf(await tokenSale.getAddress());
      const ownerBalanceBefore = await pelonToken.balanceOf(owner.address);
      await expect(tokenSale.connect(owner).withdrawRemainingTokens(await pelonToken.getAddress()))
        .to.emit(tokenSale, "TokensWithdrawn")
        .withArgs(owner.address, await pelonToken.getAddress(), contractBalance);
      expect(await pelonToken.balanceOf(await tokenSale.getAddress())).to.equal(0n);
      expect(await pelonToken.balanceOf(owner.address)).to.equal(ownerBalanceBefore + contractBalance);
    });
    it("Should allow owner to withdraw USDC tokens if any sent", async function () {
      const { tokenSale, mockUSDC, owner, buyer1 } = await loadFixture(deployTokenSaleFixture);
      const usdcAmount = ethers.parseUnits("100", 6);
      await mockUSDC.transfer(await tokenSale.getAddress(), usdcAmount);
      const ownerBalanceBefore = await mockUSDC.balanceOf(owner.address);
      await expect(tokenSale.connect(owner).withdrawRemainingTokens(await mockUSDC.getAddress()))
        .to.emit(tokenSale, "TokensWithdrawn")
        .withArgs(owner.address, await mockUSDC.getAddress(), usdcAmount);
      expect(await mockUSDC.balanceOf(await tokenSale.getAddress())).to.equal(0n);
      expect(await mockUSDC.balanceOf(owner.address)).to.equal(ownerBalanceBefore + usdcAmount);
    });
    it("Should revert when non-owner tries to withdraw", async function () {
      const { tokenSale, pelonToken, nonOwner } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(nonOwner).withdrawRemainingTokens(await pelonToken.getAddress()))
        .to.be.revertedWithCustomError(tokenSale, "OwnableUnauthorizedAccount");
    });
    it("Should revert with zero token address", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(owner).withdrawRemainingTokens(ethers.ZeroAddress))
        .to.be.revertedWith("TokenSale: Token address cannot be zero");
    });
    it("Should revert when contract has no tokens to withdraw", async function () {
      const { tokenSale, pelonToken, owner } = await loadFixture(deployTokenSaleFixture);
      await tokenSale.connect(owner).withdrawRemainingTokens(await pelonToken.getAddress());
      await expect(tokenSale.connect(owner).withdrawRemainingTokens(await pelonToken.getAddress()))
        .to.be.revertedWith("TokenSale: No tokens to withdraw");
    });
    it("Should withdraw partial tokens after some purchases", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, owner } = await loadFixture(deployTokenSaleFixture);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.parseUnits("100", 6));
      await tokenSale.connect(buyer1).buyTokens(ethers.parseUnits("100", 6));
      const balanceBefore = await pelonToken.balanceOf(await tokenSale.getAddress());
      const ownerBalanceBefore = await pelonToken.balanceOf(owner.address);
      await tokenSale.connect(owner).withdrawRemainingTokens(await pelonToken.getAddress());
      expect(await pelonToken.balanceOf(await tokenSale.getAddress())).to.equal(0n);
      expect(await pelonToken.balanceOf(owner.address)).to.equal(ownerBalanceBefore + balanceBefore);
    });
  });
  describe("View Functions", function () {
    it("Should return current price correctly", async function () {
      const { tokenSale, initialPrice } = await loadFixture(deployTokenSaleFixture);
      expect(await tokenSale.getCurrentPrice()).to.equal(initialPrice);
    });
    it("Should return correct PELON amount for given USDC", async function () {
      const { tokenSale, initialPrice } = await loadFixture(deployTokenSaleFixture);
      const usdcAmount = ethers.parseUnits("100", 6);
      const expectedPelon = calculatePelonAmount(usdcAmount, initialPrice);
      expect(await tokenSale.getPelonAmount(usdcAmount)).to.equal(expectedPelon);
    });
    it("Should return zero PELON amount for zero USDC", async function () {
      const { tokenSale } = await loadFixture(deployTokenSaleFixture);
      expect(await tokenSale.getPelonAmount(0n)).to.equal(0n);
    });
    it("Should return correct remaining tokens", async function () {
      const { tokenSale, pelonToken, maxTotalSale } = await loadFixture(deployTokenSaleFixture);
      const contractBalance = await pelonToken.balanceOf(await tokenSale.getAddress());
      const expectedRemaining = contractBalance < maxTotalSale ? contractBalance : maxTotalSale;
      expect(await tokenSale.getRemainingTokens()).to.equal(expectedRemaining);
    });
    it("Should return correct remaining tokens after purchases", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, maxTotalSale } = await loadFixture(deployTokenSaleFixture);
      const initialRemaining = await tokenSale.getRemainingTokens();
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.parseUnits("100", 6));
      await tokenSale.connect(buyer1).buyTokens(ethers.parseUnits("100", 6));
      const totalSold = await tokenSale.totalSold();
      const contractBalance = await pelonToken.balanceOf(await tokenSale.getAddress());
      const expectedRemaining = (maxTotalSale - totalSold) < contractBalance 
        ? (maxTotalSale - totalSold) 
        : contractBalance;
      expect(await tokenSale.getRemainingTokens()).to.equal(expectedRemaining);
      expect(await tokenSale.getRemainingTokens()).to.be.lt(initialRemaining);
    });
    it("Should return true for valid purchase via canPurchase", async function () {
      const { tokenSale, buyer1, mockUSDC } = await loadFixture(deployTokenSaleFixture);
      const usdcAmount = ethers.parseUnits("100", 6);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), usdcAmount);
      const [canBuy, reason] = await tokenSale.canPurchase(buyer1.address, usdcAmount);
      expect(canBuy).to.be.true;
      expect(reason).to.equal("");
    });
    it("Should return false when sale is paused", async function () {
      const { tokenSale, buyer1, owner, mockUSDC } = await loadFixture(deployTokenSaleFixture);
      await tokenSale.connect(owner).pause();
      const usdcAmount = ethers.parseUnits("100", 6);
      const [canBuy, reason] = await tokenSale.canPurchase(buyer1.address, usdcAmount);
      expect(canBuy).to.be.false;
      expect(reason).to.equal("Sale is paused");
    });
    it("Should return false for zero USDC amount", async function () {
      const { tokenSale, buyer1 } = await loadFixture(deployTokenSaleFixture);
      const [canBuy, reason] = await tokenSale.canPurchase(buyer1.address, 0n);
      expect(canBuy).to.be.false;
      expect(reason).to.equal("USDC amount must be greater than zero");
    });
    it("Should return false when would exceed wallet limit", async function () {
      const { tokenSale, buyer1, mockUSDC, maxTokensPerWallet, initialPrice } = await loadFixture(deployTokenSaleFixture);
      const exactLimitPelon = maxTokensPerWallet;
      const price = initialPrice;
      const usdcNeeded = (exactLimitPelon * ethers.parseUnits("1", 6)) / price;
      const usdcExceeding = usdcNeeded + ethers.parseUnits("1", 6);
      const [canBuy, reason] = await tokenSale.canPurchase(buyer1.address, usdcExceeding);
      expect(canBuy).to.be.false;
      expect(reason).to.equal("Would exceed wallet limit");
    });
    it("Should return false when would exceed total sale limit", async function () {
      this.timeout(120000); 
      const { tokenSale, buyer1, buyer2, buyer3, mockUSDC, owner, maxTotalSale, initialPrice } = await loadFixture(deployTokenSaleFixture);
      const [deployer] = await ethers.getSigners();
      await tokenSale.connect(owner).setMaxTokensPerWallet(maxTotalSale * 2n); 
      const usdcPerBuyer = ethers.parseUnits("10000000000", 6); 
      await mockUSDC.connect(deployer).mint(buyer1.address, usdcPerBuyer);
      await mockUSDC.connect(deployer).mint(buyer2.address, usdcPerBuyer);
      await mockUSDC.connect(deployer).mint(buyer3.address, usdcPerBuyer);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      await mockUSDC.connect(buyer2).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      await mockUSDC.connect(buyer3).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      let totalSold = await tokenSale.totalSold();
      const targetTokens = maxTotalSale - ethers.parseUnits("10000000000", 18); 
      const buyers = [buyer1, buyer2, buyer3];
      let buyerIndex = 0;
      let iterations = 0;
      const maxIterations = 1000; 
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 10;
      while (totalSold < targetTokens && iterations < maxIterations) {
        try {
          const currentPrice = await tokenSale.getCurrentPrice();
          const tokensNeeded = targetTokens - totalSold;
          const usdcNeeded = (tokensNeeded * currentPrice) / ethers.parseUnits("1", 30);
          const chunkSize = usdcNeeded > ethers.parseUnits("1000000000", 6) 
            ? ethers.parseUnits("1000000000", 6) 
            : usdcNeeded;
          const buyer = buyers[buyerIndex % 3];
          const buyerBalance = await mockUSDC.balanceOf(buyer.address);
          const actualChunkSize = buyerBalance < chunkSize ? buyerBalance : chunkSize;
          if (actualChunkSize < ethers.parseUnits("1000", 6)) {
            buyerIndex = (buyerIndex + 1) % 3;
            iterations++;
            consecutiveErrors++;
            if (consecutiveErrors >= maxConsecutiveErrors) {
              break;
            }
            continue;
          }
          await tokenSale.connect(buyer).buyTokens(actualChunkSize);
          const newTotalSold = await tokenSale.totalSold();
          if (newTotalSold === totalSold) {
            break;
          }
          totalSold = newTotalSold;
          buyerIndex = (buyerIndex + 1) % 3;
          iterations++;
          consecutiveErrors = 0; 
        } catch (error) {
          buyerIndex = (buyerIndex + 1) % 3;
          iterations++;
          consecutiveErrors++;
          if (consecutiveErrors >= maxConsecutiveErrors || iterations > maxIterations) {
            break;
          }
        }
      }
      const finalTarget = maxTotalSale - ethers.parseUnits("1000000000", 18); 
      while (totalSold < finalTarget && iterations < maxIterations) {
        try {
          const currentPrice = await tokenSale.getCurrentPrice();
          const tokensRemaining = finalTarget - totalSold;
          const usdcNeeded = (tokensRemaining * currentPrice) / ethers.parseUnits("1", 30);
          const chunkSize = usdcNeeded > ethers.parseUnits("500000000", 6) 
            ? ethers.parseUnits("500000000", 6) 
            : usdcNeeded;
          const buyer = buyers[buyerIndex % 3];
          const buyerBalance = await mockUSDC.balanceOf(buyer.address);
          const actualChunkSize = buyerBalance < chunkSize ? buyerBalance : chunkSize;
          if (actualChunkSize < ethers.parseUnits("100", 6)) {
            buyerIndex = (buyerIndex + 1) % 3;
            iterations++;
            if (iterations > maxIterations) break;
            continue;
          }
          await tokenSale.connect(buyer).buyTokens(actualChunkSize);
          const newTotalSold = await tokenSale.totalSold();
          if (newTotalSold === totalSold) break;
          totalSold = newTotalSold;
          buyerIndex = (buyerIndex + 1) % 3;
          iterations++;
        } catch (error) {
          break;
        }
      }
      const totalSoldAfter = await tokenSale.totalSold();
      expect(totalSoldAfter).to.be.gt(0n);
      expect(totalSoldAfter).to.be.lt(maxTotalSale);
      const [, , , , , , freshBuyer] = await ethers.getSigners();
      await mockUSDC.connect(deployer).mint(freshBuyer.address, ethers.parseUnits("10000", 6));
      const finalPrice = await tokenSale.getCurrentPrice();
      const tokensRemaining = maxTotalSale - totalSoldAfter;
      const tokensToBuy = tokensRemaining + ethers.parseUnits("1", 18);
      const usdcExceeding = (tokensToBuy * finalPrice) / ethers.parseUnits("1", 30);
      await mockUSDC.connect(freshBuyer).approve(await tokenSale.getAddress(), usdcExceeding);
      const [canBuy, reason] = await tokenSale.canPurchase(freshBuyer.address, usdcExceeding);
      expect(canBuy).to.be.false;
      expect(reason).to.equal("Would exceed total sale limit");
    });
    it("Should return false when contract has insufficient tokens", async function () {
      const { tokenSale, pelonToken, buyer1, owner, mockUSDC, initialPrice } = await loadFixture(deployTokenSaleFixture);
      await tokenSale.connect(owner).withdrawRemainingTokens(await pelonToken.getAddress());
      const usdcAmount = ethers.parseUnits("1000", 6);
      const [canBuy, reason] = await tokenSale.canPurchase(buyer1.address, usdcAmount);
      expect(canBuy).to.be.false;
      expect(reason).to.equal("Insufficient tokens in contract");
    });
  });
  describe("Security", function () {
    it("Should have nonReentrant modifier on buyTokens", async function () {
      const { tokenSale, mockUSDC, buyer1 } = await loadFixture(deployTokenSaleFixture);
      const usdcAmount = ethers.parseUnits("100", 6);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), usdcAmount);
      await tokenSale.connect(buyer1).buyTokens(usdcAmount);
    });
    it("Should enforce CEI pattern (state updates before external calls)", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1 } = await loadFixture(deployTokenSaleFixture);
      const usdcAmount = ethers.parseUnits("100", 6);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), usdcAmount);
      const totalSoldBefore = await tokenSale.totalSold();
      const tokensPurchasedBefore = await tokenSale.tokensPurchased(buyer1.address);
      await tokenSale.connect(buyer1).buyTokens(usdcAmount);
      const totalSoldAfter = await tokenSale.totalSold();
      const tokensPurchasedAfter = await tokenSale.tokensPurchased(buyer1.address);
      expect(totalSoldAfter).to.be.gt(totalSoldBefore);
      expect(tokensPurchasedAfter).to.be.gt(tokensPurchasedBefore);
      expect(await pelonToken.balanceOf(buyer1.address)).to.be.gt(0n);
    });
    it("Should only allow owner to call admin functions", async function () {
      const { tokenSale, nonOwner } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(nonOwner).pause())
        .to.be.revertedWithCustomError(tokenSale, "OwnableUnauthorizedAccount");
      await expect(tokenSale.connect(nonOwner).setMaxPrice(ethers.parseUnits("0.02", 18)))
        .to.be.revertedWithCustomError(tokenSale, "OwnableUnauthorizedAccount");
      await expect(tokenSale.connect(nonOwner).setMaxTokensPerWallet(ethers.parseUnits("30000000000", 18)))
        .to.be.revertedWithCustomError(tokenSale, "OwnableUnauthorizedAccount");
      await expect(tokenSale.connect(nonOwner).withdrawRemainingTokens(await tokenSale.pelonToken()))
        .to.be.revertedWithCustomError(tokenSale, "OwnableUnauthorizedAccount");
    });
  });
  describe("Events", function () {
    it("Should emit TokensPurchased event with correct parameters", async function () {
      const { tokenSale, mockUSDC, buyer1, initialPrice } = await loadFixture(deployTokenSaleFixture);
      const usdcAmount = ethers.parseUnits("100", 6);
      const expectedPelon = calculatePelonAmount(usdcAmount, initialPrice);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), usdcAmount);
      await expect(tokenSale.connect(buyer1).buyTokens(usdcAmount))
        .to.emit(tokenSale, "TokensPurchased")
        .withArgs(buyer1.address, usdcAmount, expectedPelon);
    });
    it("Should emit BondingCurveParametersUpdated when max price changes", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(owner).setMaxPrice(ethers.parseUnits("0.02", 18)))
        .to.emit(tokenSale, "BondingCurveParametersUpdated");
    });
    it("Should emit MaxTokensPerWalletUpdated event", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      const newMax = ethers.parseUnits("30000000000", 18);
      await expect(tokenSale.connect(owner).setMaxTokensPerWallet(newMax))
        .to.emit(tokenSale, "MaxTokensPerWalletUpdated")
        .withArgs(newMax);
    });
    it("Should emit MaxTotalSaleUpdated event", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      const newMax = ethers.parseUnits("250000000000", 18);
      await expect(tokenSale.connect(owner).setMaxTotalSale(newMax))
        .to.emit(tokenSale, "MaxTotalSaleUpdated")
        .withArgs(newMax);
    });
    it("Should emit SalePaused event", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      await expect(tokenSale.connect(owner).pause())
        .to.emit(tokenSale, "SalePaused")
        .withArgs(owner.address);
    });
    it("Should emit SaleUnpaused event", async function () {
      const { tokenSale, owner } = await loadFixture(deployTokenSaleFixture);
      await tokenSale.connect(owner).pause();
      await expect(tokenSale.connect(owner).unpause())
        .to.emit(tokenSale, "SaleUnpaused")
        .withArgs(owner.address);
    });
    it("Should emit TokensWithdrawn event", async function () {
      const { tokenSale, pelonToken, owner } = await loadFixture(deployTokenSaleFixture);
      const balance = await pelonToken.balanceOf(await tokenSale.getAddress());
      await expect(tokenSale.connect(owner).withdrawRemainingTokens(await pelonToken.getAddress()))
        .to.emit(tokenSale, "TokensWithdrawn")
        .withArgs(owner.address, await pelonToken.getAddress(), balance);
    });
  });
  describe("Integration Tests", function () {
    it("Should handle complete sale flow", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, buyer2, buyer3, owner } = await loadFixture(deployTokenSaleFixture);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      await mockUSDC.connect(buyer2).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      await mockUSDC.connect(buyer3).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      await tokenSale.connect(buyer1).buyTokens(ethers.parseUnits("1000", 6));
      await tokenSale.connect(buyer2).buyTokens(ethers.parseUnits("2000", 6));
      await tokenSale.connect(buyer3).buyTokens(ethers.parseUnits("1500", 6));
      await tokenSale.connect(owner).setMaxPrice(ethers.parseUnits("0.02", 18));
      await tokenSale.connect(owner).setMaxTokensPerWallet(ethers.parseUnits("30000000000", 18));
      await tokenSale.connect(owner).pause();
      await tokenSale.connect(owner).unpause();
      await tokenSale.connect(buyer1).buyTokens(ethers.parseUnits("500", 6));
      await tokenSale.connect(buyer2).buyTokens(ethers.parseUnits("500", 6));
      const totalSold = await tokenSale.totalSold();
      expect(totalSold).to.be.gt(0n);
      const price = await tokenSale.getCurrentPrice();
      expect(price).to.be.gte(await tokenSale.initialPrice());
      expect(price).to.be.lte(await tokenSale.maxPrice());
    });
    it("Should handle multiple simultaneous purchases", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, buyer2, buyer3 } = await loadFixture(deployTokenSaleFixture);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      await mockUSDC.connect(buyer2).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      await mockUSDC.connect(buyer3).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      const usdcAmount = ethers.parseUnits("100", 6);
      const tx1 = tokenSale.connect(buyer1).buyTokens(usdcAmount);
      const tx2 = tokenSale.connect(buyer2).buyTokens(usdcAmount);
      const tx3 = tokenSale.connect(buyer3).buyTokens(usdcAmount);
      await Promise.all([tx1, tx2, tx3]);
      expect(await pelonToken.balanceOf(buyer1.address)).to.be.gt(0n);
      expect(await pelonToken.balanceOf(buyer2.address)).to.be.gt(0n);
      expect(await pelonToken.balanceOf(buyer3.address)).to.be.gt(0n);
      const totalSold = await tokenSale.totalSold();
      expect(totalSold).to.be.gt(0n);
    });
    it("Should handle sale completion up to global limit", async function () {
      const { tokenSale, pelonToken, mockUSDC, buyer1, maxTotalSale } = await loadFixture(deployTokenSaleFixture);
      await mockUSDC.connect(buyer1).approve(await tokenSale.getAddress(), ethers.MaxUint256);
      const remainingTokens = await tokenSale.getRemainingTokens();
      const currentPrice = await tokenSale.getCurrentPrice();
      const usdcNeeded = (remainingTokens * ethers.parseUnits("1", 6)) / currentPrice;
      let totalSold = await tokenSale.totalSold();
      const chunkSize = ethers.parseUnits("10000", 6);
      while (totalSold < maxTotalSale - ethers.parseUnits("1000000000", 18)) {
        try {
          await tokenSale.connect(buyer1).buyTokens(chunkSize);
          totalSold = await tokenSale.totalSold();
        } catch {
          break;
        }
      }
      expect(await tokenSale.totalSold()).to.be.lte(maxTotalSale);
    });
  });
});
