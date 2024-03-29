require(`dotenv`).config({
  path: `.env.${process.env.NODE_ENV}`,
})

//todos in migration:
// -cms migrar a strapi/sanity
// eslint (gatsby-plugin-eslint?),prettierc i hooks, etc -->
// scss linter (deprecated) --> https://stylelint.io/user-guide/get-started
//background image in articles
// blurr effect in images

const ALGOLIA_QUERIES = require(`./src/utils/algolia/queries/queries`)

const {
  GATSBY_ALGOLIA_APP_ID,
  GATSBY_ALGOLIA_API_KEY,
  GATSBY_GOOGLE_ANALYTICS_ID,
} = process.env

module.exports = {
  trailingSlash: `always`,
  siteMetadata: {
    title: `Bianca Fiore`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `@biancamariola`,
    url: `https://biancafiore.me`,
  },
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-catch-links`,
    `gatsby-plugin-eslint`,
    `gatsby-plugin-netlify-cms`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-netlify-cms-paths`,
    {
      resolve: `gatsby-plugin-react-svg`,
      options: {
        rule: {
          include: /svg-components/,
        },
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `uploads`,
        path: `${__dirname}/static/assets/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets/images`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `languages`,
        path: `${__dirname}/content/languages`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `translations`,
        path: `${__dirname}/content/translations`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `menu`,
        path: `${__dirname}/content/navigation/menu`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `social-networks`, //todo: camelCase
        path: `${__dirname}/content/navigation/social-networks`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `articleTags`,
        path: `${__dirname}/content/tags/article`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `projectTags`,
        path: `${__dirname}/content/tags/project`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `cities`,
        path: `${__dirname}/content/cities`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `authors`,
        path: `${__dirname}/content/authors`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `navigation`,
        path: `${__dirname}/content/navigation`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `projects`,
        path: `${__dirname}/content/projects`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `articles`,
        path: `${__dirname}/content/articles`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/content/pages`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-plugin-netlify-cms-paths`,
          },
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1200,
              withWebp: true,
            },
          },
          {
            resolve: `gatsby-remark-autolink-headers`,
            options: {
              offsetY: `150`,
              icon: `<svg aria-hidden="true" height="20" viewBox="0 0 16 16" width="20"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>`,
              className: `--is-heading`,
              maintainCase: true,
              removeAccents: true,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#d4a259`,
        theme_color: `#d4a259`,
        display: `minimal-ui`,
        icon: `src/assets/images/favicon/favicon.png`,
        // localize: [
        //   {
        //     start_url: `/de/`,
        //     lang: `de`,
        //     name: `Die coole Anwendung`,
        //     short_name: `Coole Anwendung`,
        //     description: `Die Anwendung macht coole Dinge und macht Ihr Leben besser.`,
        //   },
        // ],
      },
    },
    {
      resolve: `gatsby-plugin-react-i18next`,
      options: {
        localeJsonSourceName: `translations`,
        languages: [`en`, `it`, `ca`, `es`],
        defaultLanguage: `en`,
        siteUrl: `https://biancafiore.me`,
        trailingSlash: `always`,
        generateDefaultLanguagePage: true,
      },
    },
    {
      resolve: `gatsby-plugin-algolia`,
      options: {
        appId: GATSBY_ALGOLIA_APP_ID,
        apiKey: GATSBY_ALGOLIA_API_KEY,
        queries: ALGOLIA_QUERIES,
        enablePartialUpdates: true,
        chunkSize: 10000,
      },
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [GATSBY_GOOGLE_ANALYTICS_ID],
      },
    },
    `gatsby-plugin-netlify`,
  ],
};
