import { captureException } from '@sentry/nextjs';
import { Address, erc20Abi } from 'viem';
import { readContracts } from '@wagmi/core';
import config from '@/configuration';
import { wagmiConfig } from '@/wagmiConfigs';
import { getReadContractResult } from '../contracts';
declare let window: any;

const getTokenImage = (symbol: string): string | undefined => {
	let _symbol = symbol.toLowerCase();

	// GIV test token, DRGIV, DRGIV2, DRGIV3, ...
	if (_symbol.startsWith('drgiv')) _symbol = 'giv';
	// TestFox, etc
	else if (_symbol.startsWith('test')) _symbol = _symbol.slice(4);

	switch (_symbol) {
		case 'giv':
			return 'https://raw.githubusercontent.com/Giveth/giveth-design-assets/master/02-logos/GIV%20Token/GIVToken_200x200.png';
		case 'cult':
			return 'https://raw.githubusercontent.com/Giveth/giveth-dapps-v2/develop/public/images/currencies/cult/64.svg';
		case 'fox':
			return 'https://raw.githubusercontent.com/Giveth/giveth-dapps-v2/develop/public/images/currencies/fox/64.svg';
	}

	return undefined;
};

interface ITokenOptions {
	address: string;
	symbol: string;
	decimals: number;
	image?: string;
}

const fetchTokenInfo = async (
	chainId: number,
	address: Address,
): Promise<ITokenOptions | undefined> => {
	try {
		const tokenInfo = {
			address: address,
			abi: erc20Abi,
			chainId,
		};
		const results = await readContracts(wagmiConfig, {
			contracts: [
				{
					...tokenInfo,
					functionName: 'decimals',
				},
				{
					...tokenInfo,
					functionName: 'symbol',
				},
			],
		});
		const [_decimal, _symbol] = results.map(res =>
			getReadContractResult(res),
		) as [number, string];
		return {
			address: address,
			symbol: _symbol,
			decimals: _decimal,
			image: getTokenImage(_symbol),
		};
	} catch (error) {
		console.error('error in fetchTokenInfo', error);
		captureException(error, {
			tags: {
				section: 'fetchTokenInfo',
			},
		});
	}
	return;
};

export async function addToken(
	chainId: number,
	tokenAddress: Address | undefined, // Default is GIV
): Promise<void> {
	const address =
		tokenAddress || config.EVM_NETWORKS_CONFIG[chainId]?.GIV_TOKEN_ADDRESS;
	if (!address) return;

	const tokenOptions = await fetchTokenInfo(chainId, address);
	const { ethereum } = window;
	if (tokenOptions) {
		await ethereum.request({
			method: 'wallet_watchAsset',
			params: {
				type: 'ERC20',
				options: tokenOptions,
			},
		});
	}
}

export async function addNetwork(network: number): Promise<void> {
	const { ethereum } = window;
	await ethereum.request({
		method: 'wallet_addEthereumChain',
		params: [config.EVM_NETWORKS_CONFIG[network]],
	});
}

export async function switchNetwork(network: number): Promise<void> {
	const { ethereum } = window;
	const { id: chainId } = config.EVM_NETWORKS_CONFIG[network];

	try {
		const res = await ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId }],
		});
		if (res) {
			addNetwork(network);
		}
	} catch (switchError: any) {
		// This error code indicates that the chain has not been added to MetaMask.
		if (switchError) {
			addNetwork(network);
		}
		captureException(switchError, {
			tags: {
				section: 'switchNetwork',
			},
		});
	}
}

export async function addToken_old(
	tokenAddress: string,
	tokenSymbol: string,
	tokenDecimals: number,
	tokenImage: string,
) {
	const { ethereum } = window;
	try {
		// wasAdded is a boolean. Like any RPC method, an error may be thrown.
		const wasAdded = await ethereum.request({
			method: 'wallet_watchAsset',
			params: {
				type: 'ERC20', // Initially only supports ERC20, but eventually more!
				options: {
					address: tokenAddress, // The address that the token is at.
					symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
					decimals: tokenDecimals, // The number of decimals in the token
					image: tokenImage, // A string url of the token logo
				},
			},
		});

		if (wasAdded) {
			console.log('Thanks for your interest!');
		} else {
			console.log('Your loss!');
		}
	} catch (error) {
		console.log(error);
		captureException(error, {
			tags: {
				section: 'addToken',
			},
		});
	}
}
