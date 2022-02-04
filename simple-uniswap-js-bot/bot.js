const ethers = require('ethers');

const addresses = {
  WETH: '0xblahblahblah',
  factory: '0xblahblahblah',
  router: '0xblahblahblah',
  recipient: '0xblahblahblah'
}

const mnemonic = 'your mnemonic here';

const provider = new ethers.providers.WebSocketProvider('Infura websocket url to mainnet');
const wallet = ethers.Wallet.fromMnemonic(mnemonic);
const account = wallet.connect(provider);
const router = new ethers.Contract(
  addresses.router,
  ['function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)', 'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'],
  account
);

const factory = new ethers.Contract(
    addresses.factory,
    ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'], account
);

factory.on('PairCreated', async (token0, token1) => {

  let tokenIn, tokenOut;
  if(token0 === addresses.WETH) {
    tokenIn = token0;
    tokenOut = token1;
  }

  if(token1 === addresses.WETH) {
    tokenIn = token1;
    tokenOut = token0;
  }

  if(typeof tokenIn === 'undefined') {
    return;
  }

  const amountIn = ethers.utils.parseUnits('0.1', 'ether');
  const amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
  const amountOutMin = amounts[1].sub(amounts[1].div(10));
  const tx = await router.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    [tokenIn, tokenOut],
    addresses.recipient,
    Date.now() + 1000 * 60 * 10
  );
});
