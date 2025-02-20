import {
	P,
	brandColors,
	Caption,
	GLink,
	H5,
	H6,
	IconExternalLink,
	neutralColors,
	Flex,
} from '@giveth/ui-design-system';
import styled from 'styled-components';
import { FC } from 'react';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import config from '@/configuration';
import TikAnimation from '@/animations/tik.json';
import ErrorAnimation from '@/animations/error.json';
import { AddTokenButton } from '../AddTokenButton';
import LottieControl from '@/components/LottieControl';
import { WrappedSpinner } from '../Spinner';

const AddTokenRow = styled(Flex)`
	margin-top: 16px;
	margin-bottom: 16px;
`;

interface IConfirmSubmitProps {
	title: string;
	txHash?: string;
	rewardTokenSymbol?: string;
	rewardTokenAddress?: Address;
}

export const SubmittedInnerModal: FC<IConfirmSubmitProps> = ({
	title,
	txHash,
	rewardTokenSymbol,
	rewardTokenAddress,
}) => {
	const { chain } = useAccount();
	const chainId = chain?.id;

	return (
		<>
			<Title>{title}</Title>
			<WrappedSpinner size={200} />
			<TxSubmit weight={700}>{txHash && 'Transaction pending'}</TxSubmit>
			<AddTokenRow $alignItems={'center'} $justifyContent={'center'}>
				<AddTokenButton
					chainId={chainId}
					tokenSymbol={rewardTokenSymbol}
					tokenAddress={rewardTokenAddress}
				/>
			</AddTokenRow>
			{txHash && (
				<BlockExplorerLink
					as='a'
					href={`${
						config.EVM_NETWORKS_CONFIG[chainId!]?.blockExplorers
							?.default.url
					}
			/tx/${txHash}`}
					target='_blank'
					size='Big'
				>
					View on{' '}
					{
						config.EVM_NETWORKS_CONFIG[chainId!]?.blockExplorers
							?.default.name
					}
					&nbsp;
					<IconExternalLink size={16} color={'currentColor'} />
				</BlockExplorerLink>
			)}
		</>
	);
};

export const ConfirmedInnerModal: FC<IConfirmSubmitProps> = ({
	title,
	txHash,
	rewardTokenSymbol,
	rewardTokenAddress,
}) => {
	const { chain } = useAccount();
	const chainId = chain?.id;
	return (
		<>
			<Title>{title}</Title>
			<LottieControl
				animationData={TikAnimation}
				size={100}
				loop={false}
			/>
			<TxConfirm weight={700}>Transaction confirmed!</TxConfirm>
			<Info>It may take a few minutes for the UI to update</Info>
			<AddTokenRow $alignItems={'center'} $justifyContent={'center'}>
				<AddTokenButton
					chainId={chainId}
					tokenSymbol={rewardTokenSymbol}
					tokenAddress={rewardTokenAddress}
				/>
			</AddTokenRow>
			<BlockExplorerLink
				as='a'
				href={`${
					config.EVM_NETWORKS_CONFIG[chainId!]?.blockExplorers
						?.default.url
				}
							/tx/${txHash}`}
				target='_blank'
				size='Big'
			>
				View on{' '}
				{
					config.EVM_NETWORKS_CONFIG[chainId!]?.blockExplorers
						?.default.name
				}
				&nbsp;
				<IconExternalLink size={16} color={'currentColor'} />
			</BlockExplorerLink>
		</>
	);
};

interface IErrorProps extends IConfirmSubmitProps {
	message?: string;
}

export const ErrorInnerModal: FC<IErrorProps> = ({
	title,
	txHash,
	message,
}) => {
	const { chain } = useAccount();
	const chainId = chain?.id;

	return (
		<>
			<Title>{title}</Title>
			<LottieControl
				animationData={ErrorAnimation}
				size={60}
				loop={false}
			/>
			<TxFailed weight={700}>Transaction Error!</TxFailed>
			{message && <ErrorMessage>{message}</ErrorMessage>}
			{txHash && (
				<BlockExplorerLink
					as='a'
					href={`${
						config.EVM_NETWORKS_CONFIG[chainId!]?.blockExplorers
							?.default.url
					}
			/tx/${txHash}`}
					target='_blank'
					size='Big'
				>
					View on{' '}
					{
						config.EVM_NETWORKS_CONFIG[chainId!]?.blockExplorers
							?.default.name
					}
					&nbsp;
					<IconExternalLink size={16} color={'currentColor'} />
				</BlockExplorerLink>
			)}
		</>
	);
};

const Title = styled(Caption)`
	padding: 24px;
`;

const ErrorMessage = styled(Caption)`
	padding: 16px;
`;

const TxSubmit = styled(H6)`
	color: ${neutralColors.gray[100]};
	margin-top: 18px;
	margin-bottom: 16px;
`;

const TxFailed = styled(H5)`
	color: ${neutralColors.gray[100]};
	margin-top: 18px;
	margin-bottom: 24px;
`;

const TxConfirm = styled(H5)`
	color: ${neutralColors.gray[100]};
	margin: 12px 0;
`;

const Info = styled(P)`
	margin-bottom: 12px;
`;

const BlockExplorerLink = styled(GLink)`
	display: block;
	width: 100%;
	color: ${brandColors.cyan[500]};
	&:hover {
		color: ${brandColors.cyan[300]};
	}
	padding-bottom: 24px;
`;
