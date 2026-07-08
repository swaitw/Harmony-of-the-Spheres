import React from "react";
import { Link, HeadFC } from "gatsby";
import Layout from "../components/layout";
import Seo from "../components/seo";
import * as iconStyles from "../theme/icons.module.css";
import {
  page,
  intro,
  introLead,
  section,
  sectionText,
  categoryGrid,
  category,
  categoryCount,
  features,
  feature,
  featureIcon,
  linkRow,
  linkButton,
  ctaRow,
} from "./about.module.css";

const scenario_categories = [
  {
    count: "4,397",
    title: "Exoplanetary systems",
    description:
      "Confirmed exoplanet systems from the NASA Exoplanet Archive — from single-planet hosts to TRAPPIST-1's seven worlds. Each system is built from published orbital elements.",
  },
  {
    count: "20",
    title: "Solar System",
    description:
      "Moon systems, asteroid families, the Kuiper Belt, near-Earth asteroids, interstellar visitors like 'Oumuamua and Borisov, and the Pentagram of Venus — all from JPL HORIZONS ephemerides.",
  },
  {
    count: "11",
    title: "N-body choreographies",
    description:
      "Periodic solutions to the gravitational N-body problem — the Figure Eight, Four Corners, Star of David, and other mathematically exact orbital dances.",
  },
  {
    count: "6",
    title: "What-if scenarios",
    description:
      "Hypothetical situations such as the Earth falling into Saturn's rings, the Nice Model of Solar System formation, and the search for Planet Nine.",
  },
];

const features_data = [
  {
    icon: "sun",
    title: "Ready-made scenarios",
    description:
      "Browse more than 4,400 simulations spanning the Solar System, moon systems, asteroid families, exoplanetary systems, interstellar objects, and hypothetical scenarios — most built from real orbital data.",
  },
  {
    icon: "globe",
    title: "Procedural planetary surfaces",
    description:
      "Many worlds are rendered with WebGL shader textures generated on the fly from each body's mass, orbit, and stellar environment. Lava worlds, habitable coastlines, deserts, ice giants, and gas giants each pick palettes and terrain noise unique to that body.",
  },
  {
    icon: "atom",
    title: "Newtonian N-body physics",
    description:
      "Every body exerts a gravitational pull on every other. Choose from fourteen numerical integrators — including RK4, Verlet, PEFRL, and high-order symplectic methods — or use the Orbital Elements integrator for hierarchical systems.",
  },
  {
    icon: "gear",
    title: "Tunable physics engine",
    description:
      "Adjust the gravitational constant G (including negative values for repulsive gravity), set a softening constant for close encounters, enable Barnes–Hut tree approximation for large systems, and use adaptive time-step integrators with error tolerance control.",
  },
  {
    icon: "plus",
    title: "Add and modify masses",
    description:
      "Inject new bodies into any running simulation from fifty real-object templates — stars, planets, moons, dwarf planets, and asteroids — or specify custom mass and radius. Edit orbital elements live and remove bodies to see how orbits respond.",
  },
  {
    icon: "ring",
    title: "Particle ring systems",
    description:
      "Many scenarios include tens of thousands of ring particles, each governed by gravity. Build your own ring configuration around any body, or watch Saturn's rings interact with a passing mass.",
  },
  {
    icon: "explosion",
    title: "Collision detection",
    description:
      "When two bodies get close enough, they merge and conserve momentum. Impact shockwaves ripple across the surviving body's surface in real time.",
  },
  {
    icon: "video",
    title: "Flexible camera",
    description:
      "Lock the camera to any body or the system barycenter, switch rotating reference frames mid-simulation, and orbit the scene freely in three dimensions.",
  },
  {
    icon: "crosshairs",
    title: "Barycenter and Lagrange points",
    description:
      "Visualise the system's centre of mass and the five Lagrange points for any chosen pair of bodies — the gravitational sweet spots where a small body can maintain a stable position.",
  },
  {
    icon: "palette",
    title: "Graphics controls",
    description:
      "Toggle orbital paths, motion trails, body labels, and the stellar background independently. Starlight follows the inverse-square law with colour derived from each star's temperature.",
  },
  {
    icon: "save",
    title: "Save, load, and reset",
    description:
      "Save modified scenarios to your browser's local storage, reload them later, or reset any simulation to its original state without refreshing the page.",
  },
  {
    icon: "fileLines",
    title: "Custom scenario builder",
    description:
      "Create your own star system from scratch — pick a stellar mass, choose an integrator, configure graphics options, and launch a simulation tailored to your experiment.",
  },
];

const AboutPage = () => {
  return (
    <Layout currentPage="about">
      <div className={page}>
        <div className={intro}>
          <h1>About Gravity Simulator</h1>
          <p className={introLead}>
            Gravity Simulator — also known as Harmony of the Spheres — is an
            interactive, browser-based N-body simulation engine. It models the
            gravitational interactions between any number of bodies in real
            time, from the familiar orbits of our Solar System and catalogued
            exoplanets to speculative scenarios such as the Earth falling into
            Saturn's rings.
          </p>
          <p>
            Planetary surfaces, atmospheres, and starlight are rendered in three
            dimensions as you watch orbits evolve. All physics runs entirely in
            your browser — no server, no plugin, and no installation required.
            The project is open source under the GNU GPL v3 and has been
            developed since 2018 by Darrell A. Huffman.
          </p>
        </div>

        <section className={section}>
          <h2>Scenario library</h2>
          <p className={sectionText}>
            The library contains more than 4,400 ready-to-run simulations
            organised into four categories. Most orbital data comes from the{" "}
            <a
              href="https://exoplanetarchive.ipac.caltech.edu/"
              target="_blank"
              rel="noreferrer"
            >
              NASA Exoplanet Archive
            </a>{" "}
            and{" "}
            <a
              href="https://ssd.jpl.nasa.gov/horizons.cgi"
              target="_blank"
              rel="noreferrer"
            >
              JPL HORIZONS
            </a>
            . See the <Link to="/credits">Credits</Link> page for a full list of
            data sources and contributors.
          </p>
          <div className={categoryGrid}>
            {scenario_categories.map(({ count, title, description }) => (
              <div key={title} className={category}>
                <p className={categoryCount}>{count}</p>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={section}>
          <h2>Features</h2>
          <div className={features}>
            {features_data.map(({ icon: iconName, title, description }) => (
              <div key={title} className={feature}>
                <div className={featureIcon}>
                  <i className={`${iconStyles.icon} ${iconStyles[iconName]}`} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={section}>
          <h2>Built with</h2>
          <p className={sectionText}>
            Gravity Simulator is a static site built with{" "}
            <a
              href="https://www.gatsbyjs.com/"
              target="_blank"
              rel="noreferrer"
            >
              Gatsby
            </a>{" "}
            and{" "}
            <a href="https://react.dev/" target="_blank" rel="noreferrer">
              React
            </a>
            , with 3D rendering powered by{" "}
            <a href="https://threejs.org/" target="_blank" rel="noreferrer">
              Three.js
            </a>{" "}
            and WebGL shaders. Simulation state is managed with Redux, and every
            scenario is a JSON file processed at build time. The source code is
            available on{" "}
            <a
              href="https://github.com/TheHappyKoala/Harmony-of-the-Spheres"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            .
          </p>
        </section>

        <div className={ctaRow}>
          <Link to="/scenarios/all" className={linkButton}>
            <i className={`${iconStyles.icon} ${iconStyles.sun}`} /> Browse
            scenarios
          </Link>
          <Link to="/scenarios/custom-scenario" className={linkButton}>
            <i className={`${iconStyles.icon} ${iconStyles.plus}`} /> Create a
            scenario
          </Link>
        </div>

        <div className={linkRow}>
          <Link to="/credits">
            <i className={`${iconStyles.icon} ${iconStyles.medal}`} /> Credits
          </Link>
          <Link to="/changelog">
            <i className={`${iconStyles.icon} ${iconStyles.fileLines}`} />{" "}
            Changelog
          </Link>
          <a
            href="https://github.com/TheHappyKoala/Harmony-of-the-Spheres"
            target="_blank"
            rel="noreferrer"
          >
            <i className={`${iconStyles.icon} ${iconStyles.gear}`} /> Source
            code
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;

export const Head: HeadFC = ({ location }) => (
  <Seo
    title="About"
    description="Learn about Gravity Simulator — an open-source, browser-based N-body gravity simulation with 4,400+ scenarios from real orbital data, procedurally generated planetary surfaces, fourteen numerical integrators, particle rings, and collision detection."
    pathname={location.pathname}
  />
);
