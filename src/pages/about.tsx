import React from "react";
import { Link, HeadFC } from "gatsby";
import Layout from "../components/layout";
import Seo from "../components/seo";
import * as iconStyles from "../theme/icons.module.css";
import {
  page,
  intro,
  features,
  feature,
  featureIcon,
  cta,
} from "./about.module.css";

const features_data = [
  {
    icon: "sun",
    title: "Ready-made scenarios",
    description:
      'Browse thousands of simulations spanning the Solar System, moon systems, asteroid families, exoplanetary systems from the NASA Exoplanet Archive, interstellar objects, and hypothetical "what if" scenarios — most built from real orbital data.',
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
      "Every body exerts a gravitational pull on every other. The simulation solves the full N-body problem each time step using either an Euler or fourth-order Runge-Kutta (RK4) integrator.",
  },
  {
    icon: "plus",
    title: "Add and modify masses",
    description:
      "Inject new bodies into any running simulation, adjust their mass, and watch how the system responds. Remove bodies to see how orbits change without a major gravitational influence.",
  },
  {
    icon: "ring",
    title: "Particle ring systems",
    description:
      "Some scenarios include tens of thousands of ring particles, each governed by gravity. Watch Saturn's rings interact with a passing body, or build your own ring configuration.",
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
      "Toggle orbital paths, motion trails, body labels, and the stellar background independently. Adjust what you see to focus on the physics that interests you.",
  },
];

const AboutPage = () => {
  return (
    <Layout currentPage="about">
      <div className={page}>
        <div className={intro}>
          <h1>About Gravity Simulator</h1>
          <p>
            Gravity Simulator is an interactive, browser-based N-body simulation
            engine. It models the gravitational interactions between any number
            of bodies in real time — from the familiar orbits of our Solar
            System and catalogued exoplanets to speculative scenarios such as
            the Earth falling into Saturn's rings. Planetary surfaces,
            atmospheres, and starlight are rendered in three dimensions as you
            watch orbits evolve. All physics runs entirely in your browser; no
            server, no plugin, and no installation required.
          </p>
        </div>

        <div className={features}>
          {features_data.map(({ icon: iconName, title, description }) => (
            <div key={title} className={feature}>
              <div className={featureIcon}>
                <i className={`${iconStyles.icon} ${iconStyles[iconName]}`} />
              </div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          ))}
        </div>

        <Link to="/scenarios/all" className={cta}>
          <i className={`${iconStyles.icon} ${iconStyles.sun}`} /> Browse
          scenarios
        </Link>
      </div>
    </Layout>
  );
};

export default AboutPage;

export const Head: HeadFC = ({ location }) => (
  <Seo
    title="About"
    description="Learn about Gravity Simulator — an interactive browser-based N-body gravity simulation with real orbital data, procedurally generated planetary surfaces, exoplanet systems, particle rings, and collision detection."
    pathname={location.pathname}
  />
);
