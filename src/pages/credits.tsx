import React from "react";
import { HeadFC } from "gatsby";
import Layout from "../components/layout";
import Seo from "../components/seo";
import { page, section, list, item, role } from "./credits.module.css";

const contributors = [
  {
    name: "Darrell A. Huffman",
    role: "Maintainer and Developer",
    description:
      "Environmental economist and software developer with a strong interest in science. Has no clue what he is doing.",
    url: "https://darrellhuffman.me",
  },
  {
    name: "Hugo Granström",
    role: "Collaborator and Developer",
    description:
      "Swedish science and programming enthusiast. Studying Engineering Physics.",
    url: "https://hugogranstrom.com/",
  },
  {
    name: "Paul West",
    role: "Developer",
    description:
      "Possibly the most helpful and gracious fellow in the WebGL community.",
    url: "https://discourse.threejs.org/u/prisoner849/summary",
  },
  {
    name: "John Van Vliet",
    role: "Planet and Moon Textures",
    description:
      "Makes maps of planets and moons, along with minor bodies and asteroids.",
    url: "https://github.com/JohnVV",
  },
];

const resources = [
  {
    name: "HORIZONS",
    description:
      "The Jet Propulsion Laboratory's HORIZONS system is used to generate ephemerides for solar-system bodies. All state vectors for solar system scenarios were obtained from HORIZONS.",
    url: "https://ssd.jpl.nasa.gov/horizons.cgi#top",
  },
  {
    name: "NASA Exoplanet Archive",
    description:
      "The NASA Exoplanet Archive is an online astronomical exoplanet and stellar catalog and data service that collates and cross-correlates astronomical data and information on exoplanets and their host stars, and provides tools to work with these data. All the orbital elements used to create the exoplanetary simulations were obtained from the Exoplanet Archive.",
    url: "https://exoplanetarchive.ipac.caltech.edu/",
  },
  {
    name: "3D Asteroid Catalogue",
    description:
      "3D Asteroid Catalogue is an interactive catalogue that contains 3D models, orbital and physical parameters and current orbital position of known minor bodies. All asteroid models used in Gravity Simulator were obtained from the 3D Asteroid Catalogue.",
    url: "https://3d-asteroids.space/",
  },
  {
    name: "NASA 3D Resources",
    description:
      "A growing collection of 3D models, textures, and images from inside NASA. All spacecraft 3D models used in Gravity Simulator, unless otherwise noted, were obtained from NASA 3D Resources.",
    url: "https://nasa3d.arc.nasa.gov/",
  },
  {
    name: "Uncharted",
    description:
      "A 3D visualization of Earth's solar neighborhood out to 75 light years, rendered in the browser using WebGL. The procedural star shaders used in Gravity Simulator were written by Ben Podgursky for Uncharted.",
    url: "https://github.com/bpodgursky/uncharted",
  },
  {
    name: "Poliastro",
    description:
      "Poliastro is an open source pure Python package dedicated to problems arising in Astrodynamics and Orbital Mechanics. The Lambert Solver in Gravity Simulator, which was written by Hugo Granström, is based on the Poliastro implementation.",
    url: "https://github.com/poliastro/poliastro",
  },
  {
    name: "Robert Vanderbei",
    description:
      "Robert Vanderbei is a Professor in the Department of Operations Research and Financial Engineering at Princeton University. The state vectors for the scenarios that deal with N-body choreographies were obtained from his website.",
    url: "https://vanderbei.princeton.edu/",
  },
];

const CreditsPage = () => {
  return (
    <Layout currentPage="credits">
      <div className={page}>
        <section className={section}>
          <h2>Contributors</h2>
          <ul className={list}>
            {contributors.map(
              ({ name, role: contributorRole, description, url }) => (
                <li key={name} className={item}>
                  <h3>{name}</h3>
                  <p className={role}>{contributorRole}</p>
                  <p>
                    {description}{" "}
                    <a href={url} target="_blank" rel="noreferrer">
                      Learn More
                    </a>
                  </p>
                </li>
              ),
            )}
          </ul>
        </section>

        <section className={section}>
          <h2>Resources</h2>
          <ul className={list}>
            {resources.map(({ name, description, url }) => (
              <li key={name} className={item}>
                <h3>{name}</h3>
                <p>
                  {description}{" "}
                  <a href={url} target="_blank" rel="noreferrer">
                    Learn More
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  );
};

export default CreditsPage;

export const Head: HeadFC = ({ location }) => (
  <Seo
    title="Credits"
    description="Meet the contributors and resources behind Gravity Simulator — the developers, texture artists, and scientific data sources that make it possible."
    pathname={location.pathname}
  />
);
