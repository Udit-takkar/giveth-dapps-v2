import { NextRouter } from 'next/router';
import {
	ECampaignFilterField,
	ECampaignType,
	EProjectsFilter,
	ICampaign,
} from '@/apollo/types/types';
import Routes from '@/lib/constants/Routes';

export function campaignLinkGenerator(campaign: ICampaign) {
	if (
		campaign.type === ECampaignType.WITHOUT_PROJECTS ||
		campaign.landingLink
	)
		return campaign.landingLink;

	let params = new URLSearchParams('');
	if (campaign.type === ECampaignType.MANUALLY_SELECTED)
		params.append('campaign', campaign.slug);

	if (campaign.type === ECampaignType.SORT_FIELD)
		params.append('sort', campaign.sortingField);

	if (campaign.type === ECampaignType.FILTER_FIELDS) {
		campaign.filterFields.forEach(filter => {
			switch (filter) {
				case ECampaignFilterField.Verified:
					params.append('filter', EProjectsFilter.VERIFIED);
					break;
				case ECampaignFilterField.GivingBlock:
					params.append('filter', EProjectsFilter.GIVING_BLOCK);
					break;
				case ECampaignFilterField.BoostedWithGivPower:
					params.append(
						'filter',
						EProjectsFilter.BOOSTED_WITH_GIVPOWER,
					);
					break;
				case ECampaignFilterField.AcceptFundOnMainnet:
					params.append(
						'filter',
						EProjectsFilter.ACCEPT_FUND_ON_MAINNET,
					);
					break;
				case ECampaignFilterField.AcceptFundOnGnosis:
					params.append(
						'filter',
						EProjectsFilter.ACCEPT_FUND_ON_GNOSIS,
					);
					break;
				case ECampaignFilterField.AcceptFundOnPolygon:
					params.append(
						'filter',
						EProjectsFilter.ACCEPT_FUND_ON_POLYGON,
					);
					break;
				case ECampaignFilterField.AcceptFundOnCelo:
					params.append(
						'filter',
						EProjectsFilter.ACCEPT_FUND_ON_CELO,
					);
					break;
				case ECampaignFilterField.AcceptFundOnArbitrum:
					params.append(
						'filter',
						EProjectsFilter.ACCEPT_FUND_ON_ARBITRUM,
					);
					break;
				case ECampaignFilterField.AcceptFundOnBase:
					params.append(
						'filter',
						EProjectsFilter.ACCEPT_FUND_ON_BASE,
					);
					break;
				case ECampaignFilterField.AcceptFundOnOptimism:
					params.append(
						'filter',
						EProjectsFilter.ACCEPT_FUND_ON_OPTIMISM,
					);
					break;
				case ECampaignFilterField.AcceptFundOnSolana:
					params.append(
						'filter',
						EProjectsFilter.ACCEPT_FUND_ON_SOLANA,
					);
					break;
				case ECampaignFilterField.AcceptFundOnZKEVM:
					params.append(
						'filter',
						EProjectsFilter.ACCEPT_FUND_ON_ZKEVM,
					);
					break;
				default:
					break;
			}
		});
	}

	const query = params.toString();
	return `${Routes.AllProjects}${query ? `?${query}` : ''}`;
}

export function removeQueryParam(
	asPath: string,
	params: string[],
	fullURl: boolean = false,
) {
	const [url, oldQuery] = asPath.split('?');
	const urlParams = new URLSearchParams(oldQuery);
	params.forEach(param => {
		urlParams.delete(param);
	});
	const newQuery = urlParams.toString();
	if (fullURl) {
		return newQuery ? `${url}?${newQuery}` : url;
	}
	return newQuery ? `?${newQuery}` : '';
}

export function removeQueryParamAndRedirect(
	router: NextRouter,
	params: string[],
) {
	const newPath = removeQueryParam(router.asPath, params, true); // Get full URL
	if (router.isReady) router.replace(newPath, undefined, { shallow: true });
}

export const convertIPFSToHTTPS = (url: string) => {
	return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
};
