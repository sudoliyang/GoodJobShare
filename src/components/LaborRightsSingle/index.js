import React from 'react';
import Helmet from 'react-helmet';
import ImmutablePropTypes from 'react-immutable-proptypes';

import Container from './Container';
import BackButton from './BackButton';
import Body from './Body';
import HidingText from './HidingText';
import Description from './Description';
import MarkdownParser from './MarkdownParser';
import Feedback from './Feedback';
import Pagers from './Pagers';
import CallToAction from './CallToAction';
import Seperator from './Seperator';

import { status, fetchLaborRightsIfNeeded } from '../../actions/laborRights';
import styles from './LaborRightsSingle.module.css';

class LaborRightsSingle extends React.Component {
  static fetchData({ store }) {
    return store.dispatch(fetchLaborRightsIfNeeded());
  }

  componentDidMount() {
    this.props.fetchLaborRightsIfNeeded();
  }

  render() {
    const {
      title,
      description,
      content,
      coverUrl,
    } = this.props.item ? this.props.item.toJS() : {};
    const {
      seoTitle = title || '',
      seoDescription,
      hidingText,
    } = this.props.item ? this.props.item.toJS() : {};
    return (
      <main>
        <Helmet
          title={`${seoTitle} | 工時薪資透明化運動`}
          meta={[
            { name: 'description', content: seoDescription },
            { property: 'og:image', content: coverUrl },
          ]}
        />
        {
          this.props.status === status.FETCHING &&
            <Container>
              <h1 className={`headingL ${styles.header}`}>
                LOADING
              </h1>
            </Container>
        }
        {
          this.props.status === status.ERROR &&
            <Container>
              <h1 className={`headingL ${styles.header}`}>
                {this.props.error.toString()}
              </h1>
            </Container>
        }
        {
          this.props.status === status.FETCHED &&
            <Container>
              <BackButton />
              <h1 className={`headingL ${styles.header}`}>
                {title}
              </h1>
              <Body>
                <HidingText content={hidingText} />
                <Description content={description} />
                <MarkdownParser content={content} />
                <Feedback />
                <Seperator />
                <Pagers
                  prev={this.props.prev}
                  next={this.props.next}
                />
              </Body>
              <CallToAction />
            </Container>
        }
      </main>
    );
  }
}

LaborRightsSingle.propTypes = {
  item: ImmutablePropTypes.map,
  prev: ImmutablePropTypes.map,
  next: ImmutablePropTypes.map,
  fetchLaborRightsIfNeeded: React.PropTypes.func.isRequired,
  status: React.PropTypes.string.isRequired,
  error: React.PropTypes.instanceOf(Error),
};

export default LaborRightsSingle;