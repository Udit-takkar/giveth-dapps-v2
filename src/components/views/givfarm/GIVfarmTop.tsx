import { useEffect, useState } from 'react';
import { Col, IconGIVFarm, Row, Flex } from '@giveth/ui-design-system';
import { useIntl } from 'react-intl';
import { useAccount } from 'wagmi';
import config from '@/configuration';

import {
	GIVfarmTopContainer,
	Subtitle,
	Title,
	GIVfarmRewardCard,
} from '../../GIVeconomyPages/GIVfarm.sc';
import useGIVTokenDistroHelper from '@/hooks/useGIVTokenDistroHelper';
import { useFarms } from '@/context/farm.context';
import { TopInnerContainer } from '../../GIVeconomyPages/commons';

export const GIVfarmTop = () => {
	const { formatMessage } = useIntl();
	const [rewardLiquidPart, setRewardLiquidPart] = useState(0n);
	const [rewardStream, setRewardStream] = useState(0n);
	const { givTokenDistroHelper } = useGIVTokenDistroHelper();
	const { chainsInfo } = useFarms();
	const { chain } = useAccount();
	const chainId = chain?.id;

	useEffect(() => {
		if (!chainId) return;
		setRewardLiquidPart(
			givTokenDistroHelper.getLiquidPart(
				chainsInfo[chainId]?.totalInfo || 0n,
			),
		);
		setRewardStream(
			givTokenDistroHelper.getStreamPartTokenPerWeek(
				chainsInfo[chainId]?.totalInfo || 0n,
			),
		);
	}, [chainsInfo, givTokenDistroHelper, chainId]);

	return (
		<GIVfarmTopContainer>
			<TopInnerContainer>
				<Row style={{ alignItems: 'flex-end' }}>
					<Col xs={12} sm={7} xl={8}>
						<Flex $alignItems='baseline' gap='16px'>
							<Title>GIVfarm</Title>
							<IconGIVFarm size={64} />
						</Flex>
						<Subtitle size='medium'>
							{formatMessage({
								id: 'label.stake_tokens_in_the_givfarm',
							})}
						</Subtitle>
					</Col>
					<Col xs={12} sm={5} xl={4}>
						<GIVfarmRewardCard
							cardName='GIVfarm'
							title={formatMessage({
								id: 'label.your_givfarm_rewards',
							})}
							liquidAmount={rewardLiquidPart}
							stream={rewardStream}
							network={chainId}
							targetNetworks={[
								{
									networkId: config.MAINNET_NETWORK_NUMBER,
									chainType: config.MAINNET_CONFIG.chainType,
								},
								{
									networkId: config.GNOSIS_NETWORK_NUMBER,
									chainType: config.GNOSIS_CONFIG.chainType,
								},
								{
									networkId: config.OPTIMISM_NETWORK_NUMBER,
									chainType: config.OPTIMISM_CONFIG.chainType,
								},
							]}
						/>
					</Col>
				</Row>
			</TopInnerContainer>
		</GIVfarmTopContainer>
	);
};
