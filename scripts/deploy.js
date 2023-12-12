const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  [buyer, seller, inspector, lender] = await ethers.getSigners()

  // Deploy Real Estate
  const RealEstate = await ethers.getContractFactory("RealEstate")
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()
  console.log(`Deployed Real Estate contract at: ${realEstate.address}`)

  console.log("Minting 3 properties...\n")

  let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmQJc3tWrenPYqqHHWFVTTNxBww3Zagyr2udhPGCYn6mze?filename=1.json")
  await transaction.wait()

  transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmcpphVWNwi5BvKS5ztxjHVwTmz1ueJPTYKVjghLF1RE6b?filename=2.json")
  await transaction.wait()

  transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmS9iosc3ux7vC2D7ijWHhvW3LsjoEnMbcfLpDCiqQoZWf?filename=3.json")
  await transaction.wait()

  // Deploy Escrow
  const Escrow = await ethers.getContractFactory("Escrow")
  const escrow = await Escrow.deploy(
      realEstate.address,
      seller.address,
      inspector.address,
      lender.address
  )
  await escrow.deployed()
  console.log(`Deployed Escrow contract at: ${escrow.address}`)

  for (let i=0; i<3;i ++) {
    let transaction = await realEstate.connect(seller).approve(escrow.address, i + 1)
    await transaction.wait()
  }

  // Listing properties...
  transaction = await escrow.connect(seller).list(1, buyer.address, tokens(20), tokens(10))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(2, buyer.address, tokens(15), tokens(5))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(3, buyer.address, tokens(10), tokens(5))
  await transaction.wait()

  console.log("Finished!")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
