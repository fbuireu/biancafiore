import { graphql } from 'gatsby'
import Markdown from 'markdown-to-jsx'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { addComment } from '../../../utils/firebase/addComment'
import { editComment } from '../../../utils/firebase/editComment'
import { getComments } from '../../../utils/firebase/getComments'
import { useScrollPosition } from '../../../utils/hooks/useScrollPosition'
import ReadingProgress from '../../atoms/ReadingProgress/ReadingProgress'
import SEO from '../../atoms/SEO/SEO'
import RelatedArticles from '../../molecules/RelatedArticles/RelatedArticles'
import Billboard from '../../organisms/Billboard/Billboard'
import Layout from '../Layout/Layout'
import './Article.scss'

const Article = ({ data, location }) => {
  const [scroll, setScroll] = useState(0)
  const [articleProperties, setArticleProperties] = useState({})
  const [comments, setComments] = useState([])
  const [commentsLoadingStatus, setCommentsLoadingStatus] = useState({
    initial: true,
    loading: false,
    loaded: false,
    error: false,
  })
  const articleReference = useRef(null)
  const { article } = data
  const {
    article: {
      html,
      excerpt,
      fields: { slug },
      frontmatter: {
        content: { title, summary, tags, relatedArticlesTitle },
        comments: commentsContent,
      },
    },
    author,
    relatedArticles: { edges: relatedArticles },
    site: {
      siteMetadata: { author: metaAuthor, url },
    },
  } = data;

  const shareParameters = {
    author: metaAuthor,
    parameters: {
      domain: url,
      url: `${url}${slug}`,
      title: title,
      description: summary ?? excerpt,
    },
  };

  const handleLoadComments = async () => {
    setCommentsLoadingStatus({
      ...commentsLoadingStatus,
      initial: false,
      loading: true,
    });
    await getComments({ articleSlug: slug, callback: setComments });
  };

  const fetchComments = () => {
    handleLoadComments().then(() => {
      setCommentsLoadingStatus({
        ...commentsLoadingStatus,
        loading: false,
        loaded: true,
      })
    }).catch((error) => {
      console.log(error)
      setCommentsLoadingStatus({
        ...commentsLoadingStatus,
        loading: false,
        error: true,
      })
    })
  };

  useEffect(function initialSetup() {
    setArticleProperties(articleReference.current);
    //fetchComments();
  }, []);

  const handleComments = async ({ comment }) => {
    await addComment({
      comment: {
        slug: slug,
        ...comment,
      },
    });
    await fetchComments();
  };

  const handleReplies = async ({ reply }) => {
    await editComment({
      comment: {
        ...reply,
        slug: slug,
      },
    })
    await fetchComments()
  }

  useScrollPosition(
    function setScrollPosition ({ currentPosition }) {
      let { y: currentYPosition } = currentPosition

      setScroll(currentYPosition)
    },
    [scroll],
  )

  return (
    <Layout>
      <SEO title={title}/>
      <Billboard
        author={author}
        tags={tags}
        location={location}
        shareParameters={shareParameters}
        {...article}
      />
      <section className={`wrapper article__wrapper`}>
        <article ref={articleReference}>
          <Markdown>{html}</Markdown>
        </article>
        {/*<Comments comments={comments}*/}
        {/*          commentsLoadingStatus={commentsLoadingStatus}*/}
        {/*          handleComments={handleComments}*/}
        {/*          handleReplies={handleReplies}*/}
        {/*          commentsContent={commentsContent}*/}
        {/*/>*/}
      </section>
      <RelatedArticles
        relatedArticles={relatedArticles}
        relatedArticlesTitle={relatedArticlesTitle}
      />
      <ReadingProgress scroll={scroll} articleProperties={articleProperties}/>
    </Layout>
  )
};

export const articleData = graphql`
    query getArticleInformation(
        $slug: String!
        $author: String
        $tags: [String!]
    ) {
        article: markdownRemark(fields: { slug: { eq: $slug } }) {
            html
            excerpt(pruneLength: 350)
            fields {
                slug
            }
            frontmatter {
                language
                author
                seo {
                    metaDescription
                    keywords
                }
                content {
                    title
                    summary
                    publishDate
                    lastUpdated
                    readingTime
                    isFeaturedArticle
                    tags
                    relatedArticlesTitle
                    featuredImage {
                        childImageSharp {
                            gatsbyImageData(layout: FULL_WIDTH)
                        }
                    }
                }
                comments {
                    title
                    subtitle
                    submitCtaMessages {
                        status
                        text
                    }
                    replyCommentCtaMessage {
                        status
                        text
                    }
                    helperMessages {
                        status
                        message
                    }
                    formInputs {
                        name
                        type
                        isRequired
                        label
                        placeholder
                        value
                        isValid
                        errorMessage
                    }
                }
            }
        }
        author: markdownRemark(frontmatter: { name: { eq: $author } }) {
            frontmatter {
                slug
                name
                description
                image {
                    childImageSharp {
                        gatsbyImageData(layout: FULL_WIDTH)
                    }
                }
            }
        }
        relatedArticles: allMarkdownRemark(
            filter: {
                frontmatter: { content: { tags: { in: $tags } } }
                fields: { slug: { ne: $slug } }
            }
            sort: { fields: frontmatter___content___publishDate, order: DESC }
            limit: 3
        ) {
            edges {
                node {
                    excerpt(pruneLength: 350)
                    fields {
                        slug
                    }
                    frontmatter {
                        language
                        author
                        content {
                            title
                            summary
                            publishDate
                            lastUpdated
                            readingTime
                            tags
                            featuredImage {
                                childImageSharp {
                                    gatsbyImageData(layout: FULL_WIDTH)
                                }
                            }
                        }
                    }
                }
            }
        }
        site {
            siteMetadata {
                url
                author
            }
        }
    }
`

Article.propTypes = {
  data: PropTypes.objectOf(PropTypes.object).isRequired,
  location: PropTypes.objectOf(PropTypes.object).isRequired,
};

Article.defaultProps = {};

export default Article;
