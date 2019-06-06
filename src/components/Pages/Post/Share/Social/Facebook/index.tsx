import * as React from 'react';

import withWindowOpen from 'components/With/WindowOpen';
import PostShareButton from 'components/Pages/Post/Share/Button';
import styles from './index.module.scss';

export const URL_SHARE_FACEBOOK = 'https://www.facebook.com/sharer/sharer.php/';

interface PostShareSocialFacebookProps {
  url: string;
  windowOpen(props: any): void;
}

export class PostShareSocialFacebook extends React.Component<PostShareSocialFacebookProps> {
  public render() {
    return <PostShareButton title="Share on Twitter" onClick={this.handleClick} className={styles.facebook} />;
  }

  public handleClick = (event: React.SyntheticEvent) => {
    event.preventDefault();
    this.props.windowOpen({
      url: this.getFacebookShareUrl(),
      width: 550,
      height: 296,
      name: 'Facebook share',
    });
  };

  public getFacebookShareUrl() {
    const { url } = this.props;
    return `${URL_SHARE_FACEBOOK}?u=${encodeURIComponent(url)}`;
  }
}

export default withWindowOpen(PostShareSocialFacebook);
