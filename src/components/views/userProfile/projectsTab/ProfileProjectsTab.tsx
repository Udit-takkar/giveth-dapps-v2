import { neutralColors, Col, Row, Flex } from '@giveth/ui-design-system';
import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';

import { useIntl } from 'react-intl';
import { IUserProfileView, EOrderBy, IOrder } from '../UserProfile.view';
import { EDirection } from '@/apollo/types/gqlEnums';
import NothingToSee from '@/components/views/userProfile/NothingToSee';
import { client } from '@/apollo/apolloClient';
import { FETCH_USER_PROJECTS } from '@/apollo/gql/gqlUser';
import { IUserProjects } from '@/apollo/types/gqlTypes';
import { IProject } from '@/apollo/types/types';
import Pagination from '@/components/Pagination';
import ProjectCard from '@/components/project-card/ProjectCard';
import { UserContributeTitle, UserProfileTab } from '../common.sc';
import { ProjectsContributeCard } from '@/components/ContributeCard';
import { useProfileContext } from '@/context/profile.context';
import ProjectItem from './ProjectItem';
import { getUserName } from '@/helpers/user';

const itemPerPage = 10;

const ProfileProjectsTab: FC<IUserProfileView> = () => {
	const [loading, setLoading] = useState(false);
	const [projects, setProjects] = useState<IProject[]>([]);
	const [totalCount, setTotalCount] = useState<number>(0);
	const [page, setPage] = useState(0);
	const [order, setOrder] = useState<IOrder>({
		by: EOrderBy.CreationDate,
		direction: EDirection.DESC,
	});
	const { user, myAccount } = useProfileContext();
	const { formatMessage } = useIntl();
	const userName = getUserName(user);

	useEffect(() => {
		if (!user) return;
		const fetchUserProjects = async () => {
			setLoading(true);
			const { data: userProjects } = await client.query({
				query: FETCH_USER_PROJECTS,
				variables: {
					userId: parseFloat(user.id || '') || -1,
					take: itemPerPage,
					skip: page * itemPerPage,
					orderBy: order.by,
					direction: order.direction,
				},
			});
			setLoading(false);
			if (userProjects?.projectsByUserId) {
				const projectsByUserId: IUserProjects =
					userProjects.projectsByUserId;
				setProjects(projectsByUserId.projects);
				setTotalCount(projectsByUserId.totalCount);
			}
		};
		fetchUserProjects().then();
	}, [user, page, order.by, order.direction]);

	return (
		<UserProfileTab>
			{!myAccount && (
				<Row>
					<Col lg={6}>
						<ProjectsContributeCard />
					</Col>
				</Row>
			)}
			{!myAccount && (
				<UserContributeTitle weight={700}>
					{formatMessage(
						{
							id: 'label.user_projects',
						},
						{
							userName,
						},
					)}
				</UserContributeTitle>
			)}
			<ProjectsContainer>
				{!loading && totalCount === 0 ? (
					<NothingWrapper>
						<NothingToSee
							title={`${
								myAccount
									? formatMessage({
											id: 'label.you_havent_created_any_projects_yet',
										})
									: formatMessage({
											id: 'label.this_user_hasnt_created_any_project_yet',
										})
							} `}
						/>
					</NothingWrapper>
				) : myAccount ? (
					<Flex $flexDirection='column' gap='18px'>
						{projects.map(project => (
							<ProjectItem project={project} key={project.id} />
						))}
					</Flex>
				) : (
					<Row>
						{projects.map(project => (
							<Col key={project.id} md={6} lg={4}>
								<ProjectCard project={project} />
							</Col>
						))}
					</Row>
				)}
				{loading && <Loading />}
			</ProjectsContainer>
			<Pagination
				currentPage={page}
				totalCount={totalCount}
				setPage={setPage}
				itemPerPage={itemPerPage}
			/>
		</UserProfileTab>
	);
};

export const ProjectsContainer = styled.div`
	margin-bottom: 40px;
`;

export const Loading = styled(Flex)`
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background-color: ${neutralColors.gray[200]}aa;
`;

const NothingWrapper = styled.div`
	position: relative;
	padding: 100px 0;
`;

export default ProfileProjectsTab;
