// Just for external links
import { isProduction } from '@/configuration';
import Routes from '@/lib/constants/Routes';

const DOCS = 'https://docs.giveth.io/';
const GIVDROP_DOC = DOCS + 'giveconomy/givdrop/';
const DISCOURSE = 'https://forum.giveth.io/';
const TYPEFORM = 'https://giveth.typeform.com/';

const links = {
	REPORT_ISSUE: TYPEFORM + 'issue-bug',
	REPORT_FAILED_DONATION: TYPEFORM + 'failed-donation',
	ASK_QUESTION: TYPEFORM + 'question',
	FEATURE_REQUEST: TYPEFORM + 'featurerequest',
	FEEDBACK: TYPEFORM + 'feedback',
	SUPPORT_US: Routes.Donate + '/the-giveth-community-of-makers',
	GIVETH_MATCHING: Routes.Donate + '/Giveth-Matching-Pool-0',
	PROJECT_VERIFICATION: TYPEFORM + 'verification',
	DISCORD: 'https://discord.giveth.io',
	DISCOURSE,
	BLOG: 'https://blog.giveth.io/',
	NEWS: 'https://news.giveth.io/',
	GIVBACK_TOKENS_FORUM: DISCOURSE + 't/givbacks-token-list/253',
	GITHUB: 'https://github.com/Giveth/',
	TELEGRAM: 'https://t.me/Givethio',
	MEDIUM: 'https://blog.giveth.io',
	TWITTER: 'https://twitter.com/giveth',
	YOUTUBE: 'https://www.youtube.com/givethio',
	REDDIT: 'https://reddit.com/r/giveth',
	INSTAGRAM: 'https://www.instagram.com/giveth.io/',
	LINKEDIN: 'https://www.linkedin.com/company/givethio/',
	DOCS,
	GIVFARM_DOCS: DOCS + 'giveconomy/givfarm',
	GIVSTREAM_DOCS: DOCS + 'giveconomy/givstream',
	GIVBACK_DOC: DOCS + 'giveconomy/givbacks',
	GIVPOWER_DOC: DOCS + 'giveconomy/givpower',
	GIVDROP_DOC,
	CLAIM_GIVDROP_DOC: GIVDROP_DOC + '#claiming-your-givdrop',
	NICE_DOC: DOCS + 'giveconomy/niceToken',
	COVENANT_DOC: DOCS + 'whatisgiveth/covenant/',
	GIVETH_DOCS: DOCS + 'whatisgiveth/',
	FUNDRAISING_DOCS: DOCS + 'whatisgiveth/fundraisingGuide',
	HISTORY: DOCS + 'whatisgiveth/history',
	OUR_MISSION: DOCS + 'whatisgiveth/#our-mission',
	USER_DOCS: DOCS + 'dapps/',
	DEVELOPER_DOCS: DOCS + 'dapps/givethioinstallation',
	CAMPAIGN_DOCS: DOCS + 'dapps/entitiesAndRoles/#campaigns',
	TRACES_DOCS: DOCS + 'dapps/entitiesAndRoles/#traces',
	MAKE_TRACEABLE_DOCS: DOCS + 'dapps/makeTraceableProject',
	VERIFICATION_DOCS: DOCS + 'dapps/projectVerification',
	CANCELLED_PROJECTS_DOCS: DOCS + 'dapps/listedUnlisted/#cancelled-projects',
	RECURRING_DONATION_DOCS: DOCS + 'dapps/recurringDonation',
	Torus_MM_DOCS: DOCS + 'dapps/importTorusMM/',
	TRACE: 'https://trace.giveth.io/',
	SWAG: 'https://swag.giveth.io/',
	COMMONS_STACK: 'https://commonsstack.org/',
	RECRUITEE: 'https://giveth.recruitee.com/',
	JOINGIVFRENS: TYPEFORM + 'regenfarms',
	DISCORD_SUPPORT: 'https://discord.gg/TeWHtAjNQT',
	CALENDAR:
		'https://calendar.google.com/calendar/u/1?cid=Z2l2ZXRoZG90aW9AZ21haWwuY29t',
	ADD_TO_CALENDAR:
		'https://calendar.google.com/event?action=TEMPLATE&tmeid=dWZydnNoNjVmb2NvNDNrZ2htMmtzaDNydGZfMjAyMjA2MDlUMTUwMDAwWiBnaXZldGhkb3Rpb0Bt&tmsrc=givethdotio%40gmail.com&scp=ALL',
	GIV_BRIDGE: 'https://omni.gnosischain.com/bridge',
	PASSPORT: 'https://passport.gitcoin.co',
	QF_DOC: DOCS + 'quadraticfunding',
	MULTISIG_GUIDE: DOCS + 'dapps/multisigs',
	ACROSS_BRIDGE:
		'https://across.to?ref=0x9cd1E4A6b3361abcCC90C7F8E788ac246d194303',
	ALLO_PROTOCOL: 'https://docs.allo.gitcoin.co/',
	GIVERNANCE_VOTING: 'https://snapshot.org/#/giv.eth',
	SUPERFLUID_DASHBOARD: 'https://app.superfluid.finance/',
	STAKE_TOGETHER_MAINNET:
		'https://app.staketogether.org/en/usd/ethereum/product/staking/eth-staking?projectAddress=0xf102fe6d6cf7f98c7c4ca45eb082caaaaa951d52',
	STAKE_TOGETHER_OPTIMISM:
		'https://app.staketogether.org/en/usd/optimism/product/staking/eth-restaking?projectAddress=0x93E79499b00a2fdAAC38e6005B0ad8E88b177346',
};

if (!isProduction) {
	links.SUPPORT_US = Routes.Donate + '/giveth-2021:-retreat-to-the-future';
	links.GIVETH_MATCHING = Routes.Donate + '/matching-pool-test-0';
}

export default links;
