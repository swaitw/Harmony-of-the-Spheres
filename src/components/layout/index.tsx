import React, { ReactElement, ReactNode } from "react";
import { Link } from "gatsby";
import NavigationMenu from "../navigation-menu";
import NavigationMenuItem from "../navigation-menu/navigation-menu-item";
import {
  icon,
  sun,
  circleInfo,
  fileLines,
  medal,
  envelope,
} from "../../theme/icons.module.css";

import "the-new-css-reset/css/reset.css";
import {
  pageWrapper,
  pageHeader,
  pageTitle,
  mainNavigationMenuWrapper,
  mainNavigationMenuItem,
  pageMain,
  pageFooter,
} from "./layout.module.css";

type Props = {
  children: ReactNode;
  currentPage: string;
  cssModifier?: string;
};

const Layout = ({
  children,
  currentPage,
  cssModifier,
}: Props): ReactElement => {
  return (
    <section
      className={`${pageWrapper}${cssModifier ? ` ${cssModifier}` : ""}`}
    >
      <header className={pageHeader}>
        <Link to="/scenarios/all/" className={pageTitle}>
          <h1>Gravity Simulator</h1>
        </Link>
        <nav className={mainNavigationMenuWrapper}>
          <NavigationMenu>
            <Link to="/scenarios/all">
              <NavigationMenuItem
                active={currentPage === "scenarios"}
                cssModifier={mainNavigationMenuItem}
              >
                <i className={`${icon} ${sun}`} />
                Scenarios
              </NavigationMenuItem>
            </Link>
            <Link to="/about">
              <NavigationMenuItem
                active={currentPage === "about"}
                cssModifier={mainNavigationMenuItem}
              >
                <i className={`${icon} ${circleInfo}`} />
                About
              </NavigationMenuItem>
            </Link>
            <Link to="/changelog">
              <NavigationMenuItem
                active={currentPage === "changelog"}
                cssModifier={mainNavigationMenuItem}
              >
                <i className={`${icon} ${fileLines}`} />
                Changelog
              </NavigationMenuItem>
            </Link>
            <Link to="/credits">
              <NavigationMenuItem
                active={currentPage === "credits"}
                cssModifier={mainNavigationMenuItem}
              >
                <i className={`${icon} ${medal}`} />
                Credits
              </NavigationMenuItem>
            </Link>
            <Link to="/contact">
              <NavigationMenuItem
                active={currentPage === "contact"}
                cssModifier={mainNavigationMenuItem}
              >
                <i className={`${icon} ${envelope}`} />
                Contact
              </NavigationMenuItem>
            </Link>
          </NavigationMenu>
        </nav>
      </header>
      <main className={pageMain}>{children}</main>
      <footer className={pageFooter}>
        <small>Copyright &copy; Darrell Arjuna Huffman 2024</small>
      </footer>
    </section>
  );
};

export default Layout;
