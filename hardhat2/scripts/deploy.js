const hre = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deployment de PelonClubToken a Base Mainnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Desplegando con la cuenta:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    throw new Error("❌ La cuenta no tiene ETH. Necesitas fondos para desplegar.");
  }

  console.log("📦 Compilando contrato PelonClubToken...");
  const PelonToken = await ethers.getContractFactory("PelonClubToken");
  
  console.log("🔨 Desplegando PelonClubToken...");
  console.log("   Recipient (recibirá los tokens):", deployer.address);
  console.log("   Total supply: 1,000,000,000,000 PELON tokens\n");
  
  const pelonToken = await PelonToken.deploy(deployer.address);
  
  console.log("⏳ Esperando confirmación de la transacción...");
  await pelonToken.waitForDeployment();
  
  const contractAddress = await pelonToken.getAddress();
  const deploymentTx = pelonToken.deploymentTransaction();
  
  console.log("\n✅ Deployment exitoso!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📄 Contrato desplegado en:");
  console.log("   Dirección:", contractAddress);
  console.log("   Hash de transacción:", deploymentTx?.hash);
  console.log("   Network: Base Mainnet (Chain ID: 8453)");
  console.log("   Recipient:", deployer.address);
  console.log("   Total Supply: 1,000,000,000,000 PELON");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (process.env.ETHERSCAN_API_KEY) {
    console.log("🔍 Verificando contrato en Basescan...");
    try {
      console.log("   Esperando 30 segundos para que Basescan indexe la transacción...");
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [deployer.address],
      });
      
      console.log("✅ Contrato verificado exitosamente en Basescan!");
      console.log("   Ver en: https://basescan.org/address/" + contractAddress + "\n");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ El contrato ya está verificado en Basescan.");
        console.log("   Ver en: https://basescan.org/address/" + contractAddress + "\n");
      } else {
        console.log("⚠️  Error al verificar el contrato:", error.message);
        console.log("   Puedes verificar manualmente con:");
        console.log(`   npx hardhat verify --network baseMainnet ${contractAddress} "${deployer.address}"\n`);
      }
    }
  } else {
    console.log("⚠️  ETHERSCAN_API_KEY no configurado. Omitiendo verificación.");
    console.log("   Para verificar manualmente, ejecuta:");
    console.log(`   npx hardhat verify --network baseMainnet ${contractAddress} "${deployer.address}"\n`);
  }

  console.log("🎉 Deployment completado!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error durante el deployment:");
    console.error(error);
    process.exit(1);
  });

