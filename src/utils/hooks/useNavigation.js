import { graphql, useStaticQuery } from 'gatsby';

export const useNavigation = () => {
    const { navigation } = useStaticQuery(graphql`
        query getAllNavigationData {
            navigation: allMarkdownRemark(
                filter: {frontmatter: {key: {eq: "navigation" }}}) {
                edges {
                    node {
                        html
                        frontmatter {
                            menuItems
                        }
                    }
                }
            }
        }
    `);

    return navigation.edges;
};
