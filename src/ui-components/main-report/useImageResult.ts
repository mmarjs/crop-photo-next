import { useEffect, useState } from "react";
import { results } from "./mock";

const formPanelItems = (panelData: any) => {
  const panelTitles = panelData.map((panel: any) => panel.guideline_category);
};
