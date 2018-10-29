import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import R from 'ramda';
import qs from 'qs';
import { compose, withHandlers, setStatic, lifecycle } from 'recompose';
import ReactGA from 'react-ga';
import ReactPixel from 'react-facebook-pixel';

import Loader from 'common/Loader';
import { Section, Wrapper, Heading, P } from 'common/base';
import FanPageBlock from 'common/FanPageBlock';
import Pagination from 'common/Pagination';
import { pathnameSelector, querySelector } from 'common/routing/selectors';

import styles from './ExperienceSearch.module.css';
import Searchbar from './Searchbar';
import ExperienceBlock from './ExperienceBlock';
import { fetchExperiences as fetchExperiencesAction } from '../../actions/experienceSearch';
import { formatCanonicalPath } from '../../utils/helmetHelper';
import PIXEL_CONTENT_CATEGORY from '../../constants/pixelConstants';
import { PAGE_COUNT } from '../../constants/experienceSearch';
import { isFetching } from '../../constants/status';
import Filter from './Filter';
import { Banner1, Banner2 } from './Banners';
import renderHelmet from './helmet';
import { queryParser, toQsString } from './helper';
import { GA_CATEGORY, GA_ACTION } from '../../constants/gaConstants';
import withRouteParameter from './withRouteParameter';

const SORT = {
  CREATED_AT: 'created_at',
  POPULARITY: 'popularity',
};

const BANNER_LOCATION = 10;

const toBlocks = R.map(experience => (
  <ExperienceBlock key={experience._id} data={experience} size="l" backable />
));

const injectBannerAt = N =>
  R.addIndex(R.chain)((row, i) => {
    if (i === N - 1) {
      return [<Banner2 key="banner" />, row];
    }
    return row;
  });

const renderBlocks = R.pipe(
  toBlocks,
  injectBannerAt(BANNER_LOCATION)
);

class ExperienceSearch extends Component {
  static propTypes = {
    experienceSearch: ImmutablePropTypes.map.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }),
    loadingStatus: PropTypes.string,
    changeSearchTypeAndSort: PropTypes.func.isRequired,
    changeSearchQueryAndSearchBy: PropTypes.func.isRequired,
    searchBy: PropTypes.string.isRequired,
    searchQuery: PropTypes.string.isRequired,
    sort: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    searchType: PropTypes.array.isRequired,
  };

  getCanonicalUrl = () => {
    const { searchType, searchQuery, searchBy, sort, page } = this.props;

    const params = {
      type: R.join(',')(searchType) || 'interview,work',
      q: searchQuery || '',
      s_by: searchBy || 'job_title',
      sort: sort || 'created_at',
      p: page || 1,
    };
    const str = qs.stringify(params, { sort: (a, b) => a.localeCompare(b) });
    const url = formatCanonicalPath(`${this.props.location.pathname}?${str}`);
    return url;
  };

  handleSearchTypeChange = ({ searchType, sort }) => {
    this.props.changeSearchTypeAndSort({ searchType, sort });
  };

  handleSearchbarKeywordClick = ({ keyword, searchBy }) => {
    this.props.changeSearchQueryAndSearchBy({
      searchQuery: keyword,
      searchBy,
    });
    this.searchTrack({ searchBy, keyword });
  };

  handleSearchBy = ({ searchQuery, searchBy }) => {
    this.props.changeSearchQueryAndSearchBy({ searchQuery, searchBy });
    this.searchTrack({ searchBy, searchQuery });
  };

  handleSearchbarSubmit = ({ searchBy, searchQuery }) => {
    this.props.changeSearchQueryAndSearchBy({ searchQuery, searchBy });
    this.searchTrack({ searchBy, searchQuery });
  };

  searchTrack = ({ searchBy, searchQuery }) => {
    ReactGA.event({
      category: GA_CATEGORY.SEARCH_EXPERIENCE,
      action: `${GA_ACTION.SEARCH_BY}_${searchBy}`,
      value: searchQuery,
    });

    ReactPixel.track('Search', {
      search_string: searchQuery,
      content_category: PIXEL_CONTENT_CATEGORY.SEARCH_EXPERIENCES,
    });
  };

  handleSortClick = ({ searchType, sort }) => {
    this.props.changeSearchTypeAndSort({ searchType, sort });

    if (sort === SORT.CREATED_AT) {
      ReactGA.event({
        category: GA_CATEGORY.SEARCH_EXPERIENCE,
        action: GA_ACTION.CLICK_LATEST,
      });
    } else if (sort === SORT.POPULARITY) {
      ReactGA.event({
        category: GA_CATEGORY.SEARCH_EXPERIENCE,
        action: GA_ACTION.CLICK_POPULAR,
      });
    }
  };

  // 給 Pagination 建立分頁的連結用
  createPageLinkTo = nextPage => {
    const pathname = pathnameSelector(this.props);
    const { searchBy, searchQuery, sort, searchType } = this.props;

    const queryString = toQsString({
      sort,
      searchBy,
      searchQuery,
      searchType,
      page: nextPage,
    });

    return {
      pathname,
      search: `?${queryString}`,
    };
  };

  render() {
    const { experienceSearch, loadingStatus } = this.props;
    const data = experienceSearch.toJS();
    const experiences = data.experiences || [];
    const experienceCount = experienceSearch.get('experienceCount');

    const { searchQuery, searchBy, sort, searchType, page } = this.props;
    const url = this.getCanonicalUrl();

    return (
      <Section Tag="main" pageTop paddingBottom>
        {renderHelmet({
          searchType,
          searchQuery,
          sort,
          page,
          count: experienceCount,
          url,
        })}
        <Wrapper size="l">
          <div className={styles.container}>
            <aside className={styles.aside}>
              <Filter
                sort={sort}
                searchType={searchType}
                onSeachTypeChange={this.handleSearchTypeChange}
                onSortClick={this.handleSortClick}
                className={styles.filter}
              />
              <Banner1 className={styles.banner} />
            </aside>

            <section className={styles.content}>
              <Searchbar
                className={styles.searcbarLarge}
                keywords={data.keywords}
                searchBy={searchBy}
                searchQuery={searchQuery}
                onKeywordClick={this.handleSearchbarKeywordClick}
                onSearchByChange={this.handleSearchBy}
                onSubmit={this.handleSearchbarSubmit}
              />

              {data.searchQuery &&
                data.experienceCount > 0 && (
                  <div className={styles.searchResult}>
                    <Heading size="m" bold>
                      「{data.searchQuery}
                      」的面試經驗、工作經驗
                    </Heading>
                  </div>
                )}

              <Pagination
                totalCount={data.experienceCount}
                unit={PAGE_COUNT}
                currentPage={page}
                createPageLinkTo={this.createPageLinkTo}
              />

              {data.searchQuery &&
                data.experienceCount === 0 &&
                !isFetching(loadingStatus) && (
                  <P size="l" bold className={styles.searchNoResult}>
                    尚未有「
                    {data.searchQuery}
                    」的經驗分享
                  </P>
                )}
              {isFetching(loadingStatus) ? (
                <Loader size="s" />
              ) : (
                renderBlocks(experiences)
              )}

              <Pagination
                totalCount={data.experienceCount}
                unit={PAGE_COUNT}
                currentPage={page}
                createPageLinkTo={this.createPageLinkTo}
              />
            </section>
          </div>
        </Wrapper>
        <Wrapper>
          <FanPageBlock className={styles.fanPageBlock} />
        </Wrapper>
      </Section>
    );
  }
}

const ssr = setStatic('fetchData', ({ store: { dispatch }, ...props }) => {
  const { searchBy, searchQuery, sort, page, searchType } = queryParser(
    querySelector(props)
  );

  return dispatch(
    fetchExperiencesAction(
      page,
      PAGE_COUNT,
      sort,
      searchBy,
      searchQuery,
      searchType
    )
  );
});

const queryData = lifecycle({
  componentDidMount() {
    const { fetchExperiences, getNewSearchBy } = this.props;
    const { searchBy, searchQuery, sort, page, searchType } = this.props;

    fetchExperiences(page, PAGE_COUNT, sort, searchBy, searchQuery, searchType);
    getNewSearchBy(searchBy);
  },
  componentDidUpdate(prevProps) {
    const props = R.props([
      'searchBy',
      'searchQuery',
      'sort',
      'page',
      'searchType',
    ]);
    const propsEq = (a, b) => R.equals(props(a), props(b));
    const { fetchExperiences, getNewSearchBy } = this.props;

    if (!propsEq(this.props, prevProps)) {
      const { searchBy, searchQuery, sort, page, searchType } = this.props;

      fetchExperiences(
        page,
        PAGE_COUNT,
        sort,
        searchBy,
        searchQuery,
        searchType
      );
    }

    if (!R.eqProps('searchBy')(this.props, prevProps)) {
      const { searchBy } = this.props;
      getNewSearchBy(searchBy);
    }
  },
});

const hoc = compose(
  ssr,
  withRouteParameter,
  withHandlers({
    changeSearchTypeAndSort: ({ changeRouteParameter }) => ({
      searchType,
      sort,
    }) => {
      changeRouteParameter({ page: 1, searchType, sort });
    },
    changeSearchQueryAndSearchBy: ({ changeRouteParameter }) => ({
      searchQuery,
      searchBy,
    }) => {
      changeRouteParameter({ page: 1, searchQuery, searchBy });
    },
  }),
  queryData
);

export default hoc(ExperienceSearch);
