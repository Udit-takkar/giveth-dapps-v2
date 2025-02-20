import styled from 'styled-components';
import React, { FC, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
	B,
	brandColors,
	Button,
	Flex,
	IconCaretDown16,
	IconRefresh16,
	neutralColors,
} from '@giveth/ui-design-system';
// @ts-ignore
import { captureException } from '@sentry/nextjs';
import { Address, Chain, formatUnits, zeroAddress } from 'viem';
import { useBalance } from 'wagmi';
import { setShowWelcomeModal } from '@/features/modal/modal.slice';
import CheckBox from '@/components/Checkbox';

import { InsufficientFundModal } from '@/components/modals/InsufficientFund';
import config from '@/configuration';

import InlineToast, { EToastType } from '@/components/toasts/InlineToast';
import { EProjectStatus } from '@/apollo/types/gqlEnums';
import { client } from '@/apollo/apolloClient';
import { PROJECT_ACCEPTED_TOKENS } from '@/apollo/gql/gqlProjects';
import { showToastError, truncateToDecimalPlaces } from '@/lib/helpers';
import {
	IProjectAcceptedToken,
	IProjectAcceptedTokensGQL,
} from '@/apollo/types/gqlTypes';
import { prepareTokenList } from '@/components/views/donate/helpers';
import GIVBackToast from '@/components/views/donate/GIVBackToast';
import { DonateWrongNetwork } from '@/components/modals/DonateWrongNetwork';
import { useAppDispatch, useAppSelector } from '@/features/hooks';
import DonateToGiveth from '@/components/views/donate/DonateToGiveth';
import SaveGasFees from './SaveGasFees';
import SwitchToAcceptedChain from '@/components/views/donate/SwitchToAcceptedChain';
import { useDonateData } from '@/context/donate.context';
import { useModalCallback } from '@/hooks/useModalCallback';
import DonateQFEligibleNetworks from './DonateQFEligibleNetworks';
import { getActiveRound } from '@/helpers/qf';
import { useGeneralWallet } from '@/providers/generalWalletProvider';
import { ChainType } from '@/types/config';
import { INetworkIdWithChain } from '../common.types';
import DonateModal from './DonateModal';
import QFModal from './QFModal';
import EstimatedMatchingToast from '@/components/views/donate/OnTime/EstimatedMatchingToast';
import TotalDonation from './TotalDonation';
import {
	GLinkStyled,
	IconWrapper,
	Input,
	InputWrapper,
	SelectTokenPlaceHolder,
	SelectTokenWrapper,
} from '../Recurring/RecurringDonationCard';
import { TokenIcon } from '../TokenIcon/TokenIcon';
import { SelectTokenModal } from './SelectTokenModal/SelectTokenModal';
import { Spinner } from '@/components/Spinner';
import { useSolanaBalance } from '@/hooks/useSolanaBalance';

const CryptoDonation: FC = () => {
	const {
		chain,
		walletChainType,
		walletAddress: address,
		isConnected,
	} = useGeneralWallet();

	const { formatMessage } = useIntl();
	const { isSignedIn } = useAppSelector(state => state.user);

	const { project, hasActiveQFRound, selectedOneTimeToken } = useDonateData();
	const dispatch = useAppDispatch();

	const {
		verified,
		id: projectId,
		status,
		addresses,
		title: projectTitle,
	} = project;

	const isActive = status?.name === EProjectStatus.ACTIVE;
	const noDonationSplit = Number(projectId!) === config.GIVETH_PROJECT_ID;
	const [amount, setAmount] = useState(0n);
	const [erc20List, setErc20List] = useState<IProjectAcceptedToken[]>();
	const [anonymous, setAnonymous] = useState<boolean>(false);
	const [amountError, setAmountError] = useState<boolean>(false);
	const [showDonateModal, setShowDonateModal] = useState(false);
	const [showInsufficientModal, setShowInsufficientModal] = useState(false);
	const [showChangeNetworkModal, setShowChangeNetworkModal] = useState(false);
	const [acceptedTokens, setAcceptedTokens] =
		useState<IProjectAcceptedToken[]>();
	const [acceptedChains, setAcceptedChains] = useState<INetworkIdWithChain[]>(
		[],
	);
	const [donationToGiveth, setDonationToGiveth] = useState(
		noDonationSplit ? 0 : 5,
	);
	const [showQFModal, setShowQFModal] = useState(false);
	const [showSelectTokenModal, setShowSelectTokenModal] = useState(false);

	const { modalCallback: signInThenDonate } = useModalCallback(() =>
		setShowDonateModal(true),
	);

	const {
		data: evmBalance,
		refetch: evmRefetch,
		isRefetching: evmIsRefetching,
	} = useBalance({
		token:
			selectedOneTimeToken?.address === zeroAddress
				? undefined
				: selectedOneTimeToken?.address,
		address:
			walletChainType === ChainType.EVM
				? (address as Address)
				: undefined,
	});

	const {
		data: solanaBalance,
		refetch: solanaRefetch,
		isRefetching: solanaIsRefetching,
	} = useSolanaBalance({
		token: selectedOneTimeToken?.address,
		address:
			walletChainType === ChainType.SOLANA
				? address || undefined
				: undefined,
	});

	const tokenDecimals = selectedOneTimeToken?.decimals || 18;
	const projectIsGivBackEligible = !!verified;
	const { activeStartedRound } = getActiveRound(project.qfRounds);
	const networkId = (chain as Chain)?.id;

	const isOnEligibleNetworks =
		networkId && activeStartedRound?.eligibleNetworks?.includes(networkId);

	useEffect(() => {
		if (
			(networkId ||
				(walletChainType && walletChainType !== ChainType.EVM)) &&
			acceptedTokens
		) {
			const acceptedEvmTokensNetworkIds = new Set<Number>();
			const acceptedNonEvmTokenChainTypes = new Set<ChainType>();

			acceptedTokens.forEach(t => {
				if (
					t.chainType === ChainType.EVM ||
					t.chainType === undefined
				) {
					acceptedEvmTokensNetworkIds.add(t.networkId);
				} else {
					acceptedNonEvmTokenChainTypes.add(t.chainType);
				}
			});

			const addressesChainTypes = new Set(
				addresses?.map(({ chainType }) => chainType),
			);

			const filteredTokens = acceptedTokens.filter(token => {
				switch (walletChainType) {
					case ChainType.EVM:
						return (
							token.networkId === networkId &&
							addresses?.some(
								token =>
									token.networkId === networkId &&
									token.chainType === walletChainType,
							)
						);
					case ChainType.SOLANA:
						return (
							addressesChainTypes.has(ChainType.SOLANA) &&
							token.chainType === walletChainType &&
							token.networkId === config.SOLANA_CONFIG.networkId
						);
					default:
						return false;
				}
			});
			const acceptedChainsWithChaintypeAndNetworkId: INetworkIdWithChain[] =
				[];
			addresses?.forEach(a => {
				if (
					a.chainType === undefined ||
					a.chainType === ChainType.EVM
				) {
					if (acceptedEvmTokensNetworkIds.has(a.networkId!)) {
						acceptedChainsWithChaintypeAndNetworkId.push({
							networkId: a.networkId!,
							chainType: ChainType.EVM,
						});
					}
				} else if (acceptedNonEvmTokenChainTypes.has(a.chainType)) {
					acceptedChainsWithChaintypeAndNetworkId.push({
						networkId: a.networkId!,
						chainType: a.chainType!,
					});
				}
			});

			setAcceptedChains(acceptedChainsWithChaintypeAndNetworkId);
			if (filteredTokens.length < 1) {
				setShowChangeNetworkModal(true);
			}
			const tokens = prepareTokenList(filteredTokens);
			setErc20List(tokens);
		}
	}, [networkId, acceptedTokens, walletChainType, addresses]);

	useEffect(() => {
		client
			.query({
				query: PROJECT_ACCEPTED_TOKENS,
				variables: { projectId: Number(projectId) },
				fetchPolicy: 'no-cache',
			})
			.then((res: IProjectAcceptedTokensGQL) => {
				setAcceptedTokens(res.data.getProjectAcceptTokens);
			})
			.catch((error: unknown) => {
				showToastError(error);
				captureException(error, {
					tags: {
						section: 'Crypto Donation UseEffect',
					},
				});
			});
	}, []);

	useEffect(() => {
		setAmount(0n);
	}, [selectedOneTimeToken, isConnected, address, networkId]);

	const selectedTokenBalance =
		(walletChainType == ChainType.EVM
			? evmBalance?.value
			: solanaBalance) || 0n;
	const refetch =
		walletChainType === ChainType.EVM ? evmRefetch : solanaRefetch;
	const isRefetching =
		walletChainType === ChainType.EVM
			? evmIsRefetching
			: solanaIsRefetching;

	const handleDonate = () => {
		if (amount > selectedTokenBalance) {
			return setShowInsufficientModal(true);
		}
		if (
			hasActiveQFRound &&
			!isOnEligibleNetworks &&
			selectedOneTimeToken?.chainType === ChainType.EVM
		) {
			setShowQFModal(true);
		} else if (!isSignedIn) {
			signInThenDonate();
		} else {
			setShowDonateModal(true);
		}
	};

	const donationDisabled =
		!isActive || !amount || !selectedOneTimeToken || amountError;

	const donateWithoutMatching = () => {
		if (isSignedIn) {
			setShowDonateModal(true);
		} else {
			signInThenDonate();
		}
	};

	return (
		<MainContainer>
			{showQFModal && (
				<QFModal
					donateWithoutMatching={donateWithoutMatching}
					setShowModal={setShowQFModal}
				/>
			)}
			{showChangeNetworkModal && acceptedChains && (
				<DonateWrongNetwork
					setShowModal={setShowChangeNetworkModal}
					acceptedChains={acceptedChains}
				/>
			)}
			{showInsufficientModal && (
				<InsufficientFundModal
					setShowModal={setShowInsufficientModal}
				/>
			)}
			{showDonateModal && selectedOneTimeToken && amount && (
				<DonateModal
					setShowModal={setShowDonateModal}
					token={selectedOneTimeToken}
					amount={amount}
					donationToGiveth={donationToGiveth}
					anonymous={anonymous}
					givBackEligible={
						projectIsGivBackEligible &&
						selectedOneTimeToken.isGivbackEligible
					}
				/>
			)}
			{walletChainType && (
				<SwitchToAcceptedChain
					acceptedChains={acceptedChains}
					setShowChangeNetworkModal={setShowChangeNetworkModal}
				/>
			)}
			<SaveGasFees acceptedChains={acceptedChains} />
			<Flex $flexDirection='column' gap='8px'>
				<InputWrapper>
					<SelectTokenWrapper
						$alignItems='center'
						$justifyContent='space-between'
						onClick={() => setShowSelectTokenModal(true)}
					>
						{selectedOneTimeToken ? (
							<Flex gap='8px' $alignItems='center'>
								<TokenIcon
									symbol={selectedOneTimeToken.symbol}
									size={24}
								/>
								<TokenSymbol>
									{selectedOneTimeToken.symbol}
								</TokenSymbol>
							</Flex>
						) : (
							<SelectTokenPlaceHolder>
								{formatMessage({
									id: 'label.select_token',
								})}
							</SelectTokenPlaceHolder>
						)}
						<IconCaretDown16 />
					</SelectTokenWrapper>
					<Input
						amount={amount}
						setAmount={setAmount}
						disabled={selectedOneTimeToken === undefined}
						decimals={selectedOneTimeToken?.decimals}
					/>
				</InputWrapper>
				<Flex gap='4px'>
					<GLinkStyled
						size='Small'
						onClick={() => setAmount(selectedTokenBalance)}
					>
						{formatMessage({
							id: 'label.available',
						})}
						:{' '}
						{truncateToDecimalPlaces(
							formatUnits(selectedTokenBalance, tokenDecimals),
							tokenDecimals / 3,
						)}
					</GLinkStyled>
					<IconWrapper onClick={() => !isRefetching && refetch()}>
						{isRefetching ? (
							<Spinner size={16} />
						) : (
							<IconRefresh16 />
						)}
					</IconWrapper>
				</Flex>
			</Flex>
			{hasActiveQFRound && !isOnEligibleNetworks && walletChainType && (
				<DonateQFEligibleNetworks />
			)}
			{hasActiveQFRound && isOnEligibleNetworks && (
				<EstimatedMatchingToast
					projectData={project}
					token={selectedOneTimeToken}
					amount={amount}
				/>
			)}
			{!noDonationSplit ? (
				<DonateToGiveth
					setDonationToGiveth={setDonationToGiveth}
					donationToGiveth={donationToGiveth}
					title={
						formatMessage({ id: 'label.donation_to' }) + ' Giveth'
					}
				/>
			) : (
				<br />
			)}
			{selectedOneTimeToken && (
				<GIVBackToast
					projectEligible={projectIsGivBackEligible}
					tokenEligible={selectedOneTimeToken.isGivbackEligible}
				/>
			)}
			{!noDonationSplit ? (
				<TotalDonation
					donationToGiveth={donationToGiveth}
					totalDonation={amount}
					projectTitle={projectTitle}
					token={selectedOneTimeToken}
					isActive={!donationDisabled}
				/>
			) : (
				<EmptySpace />
			)}
			{!isActive && (
				<InlineToast
					type={EToastType.Warning}
					message={formatMessage({
						id: 'label.this_project_is_not_active',
					})}
				/>
			)}
			{isConnected && (
				<MainButton
					id='Donate_Final'
					label={formatMessage({ id: 'label.donate' })}
					disabled={donationDisabled}
					size='medium'
					onClick={handleDonate}
				/>
			)}
			{!isConnected && (
				<MainButton
					label={formatMessage({
						id: 'component.button.connect_wallet',
					})}
					onClick={() => dispatch(setShowWelcomeModal(true))}
				/>
			)}
			<CheckBoxContainer>
				<CheckBox
					label={formatMessage({
						id: 'label.make_it_anonymous',
					})}
					checked={anonymous}
					onChange={() => setAnonymous(!anonymous)}
					size={14}
				/>
				<div>
					{formatMessage({
						id: 'component.tooltip.donate_anonymously',
					})}
				</div>
			</CheckBoxContainer>
			{showSelectTokenModal && (
				<SelectTokenModal
					setShowModal={setShowSelectTokenModal}
					tokens={erc20List}
					acceptCustomToken={
						project.organization?.supportCustomTokens
					}
				/>
			)}
		</MainContainer>
	);
};

const EmptySpace = styled.div`
	margin-top: 70px;
`;

const MainContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 60%;
	justify-content: space-between;
	text-align: left;
`;

const TokenSymbol = styled(B)`
	white-space: nowrap;
`;

interface IInputBox {
	$error: boolean;
	$focused: boolean;
}

const MainButton = styled(Button)`
	width: 100%;
	background-color: ${props =>
		props.disabled ? brandColors.giv[200] : brandColors.giv[500]};
	color: white;
	text-transform: uppercase;
`;

export const CheckBoxContainer = styled.div`
	margin-top: 16px;
	> div:nth-child(2) {
		color: ${neutralColors.gray[900]};
		font-size: 12px;
		margin-top: 3px;
		margin-left: 24px;
	}
`;

export default CryptoDonation;
