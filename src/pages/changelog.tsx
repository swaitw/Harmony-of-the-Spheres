import React from "react";
import { HeadFC } from "gatsby";
import Layout from "../components/layout";
import Seo from "../components/seo";
import { page, section, list, item, date } from "./changelog.module.css";

const entries = [
  {
    date: "2023-04-09",
    title: "Enable Saving and Loading Scenarios",
    description:
      "It is now possible to save and load non-starship scenarios. Further work on this functionality is certainly needed, but this is a start.",
  },
  {
    date: "2022-12-12",
    title: "Add Newly Discovered Exosystems",
    description: "Added dozens of newly discovered exoplanetary systems.",
  },
  {
    date: "2022-08-14",
    title: "More Small Stuff",
    description:
      "Added planetary atmospheres, which are very much a work in progress, in addition to a couple of new exoplanet scenarios. The contact form has been temporarily disabled because of the large amount of spam received over the past couple of weeks.",
  },
  {
    date: "2022-07-11",
    title: "Bunch of Small Stuff",
    description:
      "New high resolution textures have been added for all the planets of the solar system, Earth's moon, the Galilean moons and the dwarf planets Eris and Makemake. Since these textures take much longer to load, a loading screen has been added as well. Moreover, light now decays according to the inverse-square law and its colour depends on which part of the spectrum most of a star's light is emitted.",
  },
  {
    date: "2022-06-19",
    title: "Add Button for Resetting Scenarios",
    description:
      "A button for resetting scenarios has been added to the bottom panel, which means that scenarios can be reset without having to reload the website.",
  },
  {
    date: "2022-06-15",
    title: "Add Mass Bug Fix",
    description:
      "The preceding update added a bug that caused the simulation to crash when you tried to add a mass to a simulation with no masses: this has now been fixed.",
  },
  {
    date: "2022-06-11",
    title: "Exoplanets and New Add Mass Functionality",
    description:
      "Six exoplanet scenarios have been added, one of which simulates a system with a grand total of three confirmed planets. Some stellar mass templates have been added, and more than that, it is now possible to choose not to use a mass template and specify the mass and radius of the mass you are adding yourself.",
  },
  {
    date: "2022-06-01",
    title: "Exoplanets Update",
    description:
      "New exoplanet scenarios have been added and the exoplanet wiki has been revamped, in addition to a better model for generating the colour of a star based on its temperature.",
  },
];

const ChangelogPage = () => {
  return (
    <Layout currentPage="changelog">
      <div className={page}>
        <section className={section}>
          <h2>Changelog</h2>
          <ul className={list}>
            {entries.map(({ date: entryDate, title, description }) => (
              <li key={entryDate} className={item}>
                <p className={date}>{entryDate}</p>
                <h3>{title}</h3>
                <p>{description}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  );
};

export default ChangelogPage;

export const Head: HeadFC = ({ location }) => (
  <Seo
    title="Changelog"
    description="A history of updates and improvements to Gravity Simulator."
    pathname={location.pathname}
  />
);
