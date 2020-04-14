import PropTypes from 'prop-types';
import React from 'react';
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  PocketIcon,
  PocketShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from 'react-share';
import './ShareButtons.scss';

const ShareButtons = ({ shareParameters, tags }) => <section className="share-buttons__wrapper">
  <div>
    <TwitterShareButton className={`share-button twitter`}
                        url={shareParameters.parameters.url}
                        title={shareParameters.parameters.title}
                        via={shareParameters.twitterUser.split(`@`).join(``)}
                        hashtags={tags}>
      <TwitterIcon round={true} />
    </TwitterShareButton>
    <FacebookShareButton className={`share-button facebook`} url={shareParameters.parameters.url}>
      <FacebookIcon round={true} />
    </FacebookShareButton>
    <LinkedinShareButton className={`share-button linkedin`} url={shareParameters.parameters.url} title={shareParameters.parameters.title}>
      <LinkedinIcon round={true} />
    </LinkedinShareButton>
    <WhatsappShareButton className={`share-button whatsapp`} url={shareParameters.parameters.url} title={shareParameters.parameters.title}>
      <WhatsappIcon round={true} />
    </WhatsappShareButton>
    <PocketShareButton className={`share-button pocket`} url={shareParameters.parameters.url} title={shareParameters.parameters.title}>
      <PocketIcon round={true} />
    </PocketShareButton>
    <EmailShareButton className={`share-button email`}
                      url={shareParameters.parameters.url}
                      subject={shareParameters.parameters.title}
                      body={``}>
      <EmailIcon round={true} />
    </EmailShareButton>
  </div>
</section>;

ShareButtons.propTypes = {
  shareParameters: PropTypes.shape({
    twitterUser: PropTypes.string,
    parameters: PropTypes.shape({
      url: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    }),
  }).isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
};

ShareButtons.defaultProps = {
  tags: [],
};

export default ShareButtons;