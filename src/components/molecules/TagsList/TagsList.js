import { Link } from 'gatsby'
import { useI18next } from 'gatsby-plugin-react-i18next'
import PropTypes from 'prop-types'
import slugify from '../../../utils/slugify/slugify'
import React from 'react'

const TagsList = ({ tags }) => {
  const {
    i18n: { language: locale },
  } = useI18next()

  return (
    <ul className={`tags__list`}>
      {tags.map(({ name: tag, type }, index) => {
        let previousFirstLetter, currentFirstLetter
        if (index < tags.length) {
          currentFirstLetter = tags[index].name.charAt(0)
          if (index > 0) {
            previousFirstLetter = tags[index - 1].name.charAt(0)
          }
        }
        return (
          <li className={`tag__item`} key={tag}>
            {previousFirstLetter !== currentFirstLetter && (
              <h2 className={`tags__glossary__letter ${currentFirstLetter}`}>
                {currentFirstLetter}
              </h2>
            )}
            <Link key={tag} to={`/${locale}/tags/${slugify(tag)}`}>
              {tag}
            </Link>
          </li>
        )
      })}
    </ul>
  )
};

TagsList.propTypes = {
  tags: PropTypes.objectOf(PropTypes.object).isRequired,
};

TagsList.defaultProps = {};

export default TagsList;
