import React from 'react';
import PropTypes from 'prop-types';

import { Heading, P } from 'common/base';
import GradientMask from 'common/GradientMask';
import styles from './Article.module.css';
import Aside from './Aside';
import SectionBlock from './SectionBlock';
import QABlock from './QABlock';
import BasicPermissionBlock from '../../../containers/PermissionBlock/BasicPermissionBlockContainer';
import { MAX_WORDS_IF_HIDDEN } from '../../../constants/hideContent';

class Article extends React.Component {
  renderSections = () => {
    const { experience, hideContent } = this.props;
    let toHide = false;
    let currentTotalWords = 0;

    if (hideContent) {
      return (
        <div>
          {experience.sections &&
            experience.sections.map(({ subtitle, content }, idx) => {
              if (toHide) {
                return null;
              }
              currentTotalWords += content.length;
              if (currentTotalWords > MAX_WORDS_IF_HIDDEN) {
                toHide = true;
                const showLength =
                  content.length - (currentTotalWords - MAX_WORDS_IF_HIDDEN);
                const newContent = `${content.substring(0, showLength)}...`;
                return (
                  <GradientMask>
                    <SectionBlock
                      key={idx}
                      subtitle={subtitle}
                      content={newContent}
                    />
                  </GradientMask>
                );
              }
              return (
                <SectionBlock key={idx} subtitle={subtitle} content={content} />
              );
            })}
        </div>
      );
    }
    return (
      <div>
        {experience.sections &&
          experience.sections.map(({ subtitle, content }, idx) => (
            <SectionBlock key={idx} subtitle={subtitle} content={content} />
          ))}
      </div>
    );
  };

  render() {
    const { experience, hideContent } = this.props;
    return (
      <div className={styles.container}>
        <Aside experience={experience} />
        <section className={styles.main}>
          <div className={styles.article}>
            <Heading size="m" className={styles.heading}>
              {experience.title}
            </Heading>
            {this.renderSections()}
          </div>
          {experience.type === 'interview' &&
          experience.interview_qas &&
          experience.interview_qas.length &&
          !hideContent ? (
            <div className={styles.qaWrapper}>
              <P size="l" bold>
                面試問答
              </P>
              {experience.interview_qas.map(({ question, answer }, idx) => (
                <QABlock key={idx} question={question} answer={answer} />
              ))}
            </div>
          ) : null}
          {hideContent ? (
            <BasicPermissionBlock
              rootClassName={styles.permissionBlockArticle}
            />
          ) : null}
        </section>
      </div>
    );
  }
}

Article.propTypes = {
  experience: PropTypes.object.isRequired,
  hideContent: PropTypes.bool.isRequired,
};

export default Article;
