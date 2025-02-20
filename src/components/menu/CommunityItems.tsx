import React, { FC } from 'react';
import Link from 'next/link';
import { GLink } from '@giveth/ui-design-system';

import { useIntl } from 'react-intl';
import { useAppSelector } from '@/features/hooks';
import { ItemRow, ItemTitle } from './common';
import { Item } from './Item';
import Routes from '@/lib/constants/Routes';
import links from '@/lib/constants/links';

export const communityItems = [
	{
		title: 'label.get_a',
		label: 'label.givers_nft',
		href: Routes.NFT,
	},
	{
		title: 'label.community_connection',
		label: 'label.join_us',
		href: Routes.Join,
	},
	{
		title: 'label.why_giveth',
		label: 'label.our_mission',
		href: Routes.AboutUs + '#mission',
	},
	{
		title: 'label.learn_the_basics',
		label: 'label.onboarding_guide',
		href: Routes.Onboarding,
	},
	{
		title: `label.leave_feedback`,
		label: `label.tell_us_how_we_are_doing`,
		href: links.FEEDBACK,
	},
];

export const CommunityItems = () => {
	return (
		<>
			{communityItems.map((item, idx) =>
				item.href !== links.FEEDBACK ? (
					<Link key={idx} href={item.href}>
						<CommunityItem item={item} />
					</Link>
				) : (
					<a
						key={idx}
						href={item.href}
						target='_blank'
						rel='noreferrer noopener'
					>
						<CommunityItem item={item} />
					</a>
				),
			)}
		</>
	);
};
interface ICommunityItemProps {
	item: {
		title: string;
		label: string;
		href: string;
	};
}

export const CommunityItem: FC<ICommunityItemProps> = ({ item }) => {
	const theme = useAppSelector(state => state.general.theme);
	const { formatMessage } = useIntl();

	return (
		<Item baseTheme={theme}>
			<ItemTitle $baseTheme={theme}>
				{formatMessage({ id: item.title })}
			</ItemTitle>
			<ItemRow>
				<GLink>{formatMessage({ id: item.label })}</GLink>
			</ItemRow>
		</Item>
	);
};
