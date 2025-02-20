import { parseUnits } from 'viem';
import { IProjectAcceptedToken } from '@/apollo/types/gqlTypes';
import { MAX_TOKEN_ORDER } from '@/lib/constants/tokens';
import { EDonationFailedType } from '@/components/modals/FailedDonation';
import { INetworkIdWithChain } from './common.types';
import { getChainName } from '@/lib/network';
import { formatCrypto } from '@/helpers/number';

export const prepareTokenList = (tokens: IProjectAcceptedToken[]) => {
	const _tokens = [...tokens];
	_tokens.sort((t1, t2) => {
		const t1Order = t1.order || MAX_TOKEN_ORDER;
		const t2Order = t2.order || MAX_TOKEN_ORDER;
		if (t1Order === t2Order) {
			const t1Name = t1.name.toLowerCase();
			const t2Name = t2.name.toLowerCase();
			return t2Name > t1Name ? -1 : 1;
		}
		return t2Order > t1Order ? -1 : 1;
	});
	return _tokens;
};

export const getNetworkNames = (
	networks: INetworkIdWithChain[],
	text: string,
) => {
	return networks.map((network, index) => {
		// Access the network name using networkId or chainType based on the chainType
		const name = getChainName(network.networkId, network.chainType);

		const lastLoop = networks.length === index + 1;
		return (
			<span key={network.networkId}>
				{name}
				{!lastLoop && ' ' + text + ' '}
			</span>
		);
	});
};

export interface ICreateDonation {
	walletAddress: string;
	projectId: number;
	amount: number;
	token: IProjectAcceptedToken;
	anonymous?: boolean;
	chainvineReferred?: string | null;
	symbol: string;
	draftDonationId?: number;
	setFailedModalType: (type: EDonationFailedType) => void;
}

export const calcDonationShare = (
	totalDonation: bigint,
	givethDonationPercent: number,
	decimals = 18,
) => {
	let givethDonation = (totalDonation * BigInt(givethDonationPercent)) / 100n;
	const minDonationAmount = parseUnits('1', decimals - decimals / 3);
	if (givethDonation < minDonationAmount && givethDonationPercent !== 0) {
		givethDonation = minDonationAmount;
	}
	let projectDonation = totalDonation - givethDonation;
	if (projectDonation < minDonationAmount) {
		projectDonation = minDonationAmount;
	}
	return {
		projectDonation: formatCrypto(projectDonation, decimals),

		givethDonation: formatCrypto(givethDonation, decimals),
	};
};
