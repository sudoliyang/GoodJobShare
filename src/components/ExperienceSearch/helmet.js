import React from 'react';
import Helmet from 'react-helmet';
import { formatTitle } from 'utils/helmetHelper';
import getScale from 'utils/numberUtils';
import { imgHost, SITE_NAME } from '../../constants/helmetData';

const searchTypeMap = {
  work: '工作經驗',
  interview: '面試經驗',
  intern: '實習經驗',
};

const sortByMap = {
  created_at: '最新',
  popularity: '熱門',
};

export default ({ searchType, searchQuery, sort, page, count, url }) => {
  // TODO 將邏輯拆成 1. 公司職稱搜尋 2. 非搜尋，減少 if/else
  const scale = getScale(count);
  const searchTypeName = searchType
    .sort()
    .reduce((names, type) => {
      if (searchTypeMap[type]) {
        names.push(searchTypeMap[type]);
      }
      return names;
    }, [])
    .join('、');

  // default helmet info
  let title = '查詢面試、工作、實習經驗';
  let description = `馬上查詢超過 ${scale} 篇面試、工作及實習經驗分享，讓我們一起把面試準備的更好，也更瞭解公司內部的真實樣貌，找到更適合自己的好工作！`;

  // if searchQuery is given and number of result > 0, then show job / company name
  if (searchQuery && count > 0) {
    const tmpStr = `${searchQuery}的${searchTypeName}分享`;
    title = `${tmpStr}，第 ${page} 頁`;
    description = `馬上查看共 ${count} 篇有關${tmpStr}，讓我們一起把面試準備的更好，也更瞭解公司內部的真實樣貌，找到更適合自己的好工作！`;
  } else if (sort) {
    // if searchQuery is not given, but sortBy is given, then show 最新/熱門
    title = `${sortByMap[sort]}${searchTypeName}分享 - 第 ${page} 頁`;
    description = `馬上查詢超過 ${scale} 篇${searchTypeName}分享，讓我們一起把面試準備的更好，也更瞭解公司內部的真實樣貌，找到更適合自己的好工作！`;
  }
  return (
    <Helmet
      title={title}
      meta={[
        { name: 'description', content: description },
        { property: 'og:title', content: formatTitle(title, SITE_NAME) },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        {
          property: 'og:image',
          content: `${imgHost}/og/experience-search.jpg`,
        },
      ]}
      link={[{ rel: 'canonical', href: url }]}
    />
  );
};
