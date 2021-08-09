import Markdown from 'markdown-to-jsx';
import PropTypes from 'prop-types';
import { useLatestArticles } from '../../../utils/hooks/useLatestArticles';
import HomeLatestArticleCard from '../../atoms/HomeLatestArticleCard/HomeLatestArticleCard';
import './HomeLatestArticles.scss';

const HomeLatestArticles = ({ title }) => {
  const latestArticles = useLatestArticles();

  return <section className={`home__latest-articles__wrapper`}>
    <div className={`wrapper`}>
      <Markdown className={`home__latest-articles__title`}
                options={{ wrapper: `h2`, forceWrapper: true }}>
        {title}
      </Markdown>
      <ul className={`home__latest-articles__list`}>
        {latestArticles.map(({ node: article }) => (
          <HomeLatestArticleCard key={article.frontmatter.content.title} {...article} />
        ))}
      </ul>
    </div>
  </section>;
};

HomeLatestArticles.propTypes = {
  title: PropTypes.string.isRequired
};

HomeLatestArticles.defaultProps = {};

export default HomeLatestArticles;
