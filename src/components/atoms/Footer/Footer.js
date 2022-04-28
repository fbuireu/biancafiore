import { VALID_EMAIL } from '../../../utils/form/validateField';
import { useSocialNetworkItems } from '../../../utils/hooks/useSocialNetworkItems';
import './Footer.scss';

const Footer = () => {
  const footerItems = useSocialNetworkItems();

  return <footer>
    <section className={`footer-wrapper`}>
      <ul className={`footer__list wrapper`}>
        {footerItems.map(({ node: footerItem }) => (
          <li key={footerItem.frontmatter.name} className={`footer__item`}>
            {footerItem.frontmatter.url.match(VALID_EMAIL)
              ? <a href={`mailto:${footerItem.frontmatter.url}`}
                   className={`footer__link`}>{footerItem.frontmatter.name}</a>
              : <a href={footerItem.frontmatter.url}
                   target={`_blank`}
                   className={`footer__link`}
                   rel={`noopener noreferrer`}>{footerItem.frontmatter.name}</a>
            }
          </li>
        ))}
      </ul>
    </section>
  </footer>;
};

Footer.propTypes = {};

Footer.defaultProps = {};

export default Footer;
