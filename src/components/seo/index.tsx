import React from "react";
import { useStaticQuery, graphql } from "gatsby";

type Props = {
  title?: string;
  description?: string;
  pathname?: string;
};

const Seo = ({ title, description, pathname }: Props) => {
  const { site } = useStaticQuery(graphql`
    query SeoMetadata {
      site {
        siteMetadata {
          title
          description
          siteUrl
        }
      }
    }
  `);

  const {
    title: siteTitle,
    description: siteDescription,
    siteUrl,
  } = site.siteMetadata;

  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDescription = description ?? siteDescription;
  const canonicalUrl = `${siteUrl}${pathname ?? ""}`;
  const ogImage = `${siteUrl}/icons/icon-512x512.png`;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
};

export default Seo;
