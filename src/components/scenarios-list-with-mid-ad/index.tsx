import React, { ReactNode } from "react";

import ScenariosListAd from "../scenarios-list-ad";

const SCENARIOS_BEFORE_AD = 16;

type Props<T> = {
  items: T[];
  renderItem: (item: T) => ReactNode;
  listClassName: string;
  innerClassName: string;
};

const ScenariosListWithMidAd = <T,>({
  items,
  renderItem,
  listClassName,
  innerClassName,
}: Props<T>) => {
  const scenariosBeforeAd = items.slice(0, SCENARIOS_BEFORE_AD);
  const scenariosAfterAd = items.slice(SCENARIOS_BEFORE_AD);

  return (
    <>
      <div className={innerClassName}>
        <section className={listClassName}>
          {scenariosBeforeAd.map((item) => renderItem(item))}
        </section>
      </div>
      <ScenariosListAd placement="bottom" />
      {scenariosAfterAd.length > 0 && (
        <div className={innerClassName}>
          <section className={listClassName}>
            {scenariosAfterAd.map((item) => renderItem(item))}
          </section>
        </div>
      )}
    </>
  );
};

export default ScenariosListWithMidAd;
