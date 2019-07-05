import * as React from 'react';

import styles from './index.module.scss';
import Tag from 'components/Tag';

interface PopularPostsListProps {
  posts: PostPlain[];
  limit?: number;
  title: string;
}

export default function PopularPostsList({ posts, limit = Infinity, title }: PopularPostsListProps) {
  const allTags = posts.reduce((tags, post) => tags.concat(post.tags), []);
  const byCount = allTags.reduce((accumulator, tag) => {
    if (typeof accumulator[tag] !== 'number') {
      accumulator[tag] = 0;
    }
    accumulator[tag]++;
    return accumulator;
  }, {});
  const tags = Object.keys(byCount)
    .sort((tag1, tag2) => {
      if (byCount[tag1] === byCount[tag2]) {
        return tag1 > tag2 ? 1 : -1;
      }
      return byCount[tag1] > byCount[tag2] ? -1 : 1;
    })
    .slice(0, limit);
  return (
    <div className={styles.popularPosts}>
      <h2>{title}</h2>
      <div className={styles.tags}>
        {tags.map((tag) => (
          <Tag tag={tag} key={tag} />
        ))}
      </div>
    </div>
  );
}