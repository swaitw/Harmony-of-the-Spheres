import type { GatsbyConfig } from "gatsby";

const config: GatsbyConfig = {
  pathPrefix: `/version-2`,
  siteMetadata: {
    title: `Gravity Simulator`,
    siteUrl: `https://gravitysimulator.org/version-2`,
    description: `A 3D interactive Newtonian gravity simulator. Explore the Solar System, model exoplanets, and watch galaxies collide. Add, remove, and tweak planets, stars, and moons — and even change the laws of physics.`,
  },
  graphqlTypegen: false,
  plugins: [
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [`UA-153406767-1`],
        gtagConfig: {
          anonymize_ip: true,
        },
        pluginConfig: {
          head: false,
          respectDNT: true,
        },
      },
    },
    {
      resolve: `gatsby-plugin-canonical-urls`,
      options: {
        siteUrl: `https://gravitysimulator.org/version-2`,
      },
    },
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./src/scenarios/`,
      },
    },
    "gatsby-plugin-image",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/icon.png",
      },
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
  ],
};

export default config;
