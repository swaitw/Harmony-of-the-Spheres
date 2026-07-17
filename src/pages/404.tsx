import React from "react";
import { Link, HeadFC } from "gatsby";
import Layout from "../components/layout";
import Seo from "../components/seo";
import { icon, sun } from "../theme/icons.module.css";
import { container, link } from "./404.module.css";

const NotFoundPage = () => {
  return (
    <Layout currentPage="404">
      <div className={container}>
        <h1>Page not found</h1>
        <p>
          This page doesn't exist, but the universe does — head to the scenarios
          page to find a gravitational simulation to explore.
        </p>
        <Link to="/scenarios/all" className={link}>
          <i className={`${icon} ${sun}`} /> Browse scenarios
        </Link>
      </div>
    </Layout>
  );
};

export default NotFoundPage;

export const Head: HeadFC = ({ location }) => (
  <Seo
    title="Page Not Found"
    description="The page you were looking for does not exist."
    pathname={location.pathname}
  />
);
