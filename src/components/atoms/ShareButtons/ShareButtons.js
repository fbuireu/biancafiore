import PropTypes from 'prop-types'
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
} from 'react-share'
import './ShareButtons.scss'
import React from 'react'

const ShareButtons = ({ shareParameters, tags, classNames }) => {
  return (
    <section className={`${classNames}__share-buttons share-buttons__wrapper`}>
      <div className={`share-buttons__inner`}>
        <TwitterShareButton
          className={`share-button twitter`}
          url={shareParameters.parameters.url}
          title={shareParameters.parameters.title}
          via={shareParameters.author.split(`@`).join(``)}
          hashtags={tags.map((tag) => tag.split(` `).join(``))}
        >
          <TwitterIcon round={true}/>
        </TwitterShareButton>
        <FacebookShareButton
          className={`share-button facebook`}
          url={shareParameters.parameters.url}
        >
          <FacebookIcon round={true}/>
        </FacebookShareButton>
        <LinkedinShareButton
          className={`share-button linkedin`}
          url={shareParameters.parameters.domain}
          summary={shareParameters.parameters.description}
          source={shareParameters.parameters.url}
          title={shareParameters.parameters.title}
        >
          <LinkedinIcon round={true}/>
        </LinkedinShareButton>
        <WhatsappShareButton
          className={`share-button whatsapp`}
          url={shareParameters.parameters.url}
          title={shareParameters.parameters.title}
        >
          <WhatsappIcon round={true}/>
        </WhatsappShareButton>
        <PocketShareButton
          className={`share-button pocket`}
          url={shareParameters.parameters.url}
          title={shareParameters.parameters.title}
        >
          <PocketIcon round={true}/>
        </PocketShareButton>
        <EmailShareButton
          className={`share-button email`}
          url={shareParameters.parameters.url}
          subject={shareParameters.parameters.title}
          body={``}
        >
          <EmailIcon round={true}/>
        </EmailShareButton>
      </div>
    </section>
  )
};

ShareButtons.propTypes = {
  shareParameters: PropTypes.shape({
    author: PropTypes.string,
    parameters: PropTypes.shape({
      domain: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }),
  }).isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  classNames: PropTypes.arrayOf(PropTypes.string),
};

ShareButtons.defaultProps = {
  tags: [],
};

export default ShareButtons;
