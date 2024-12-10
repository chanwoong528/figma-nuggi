// This plugin will open a tab that indicates that it will monitor the current
// selection on the page. It cannot change the document itself.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

import axios from "axios";
import { genTypoGraphy } from "./foundation/typo";
import { getnBtnJson } from "./foundation/btn";

// This shows the HTML page in "ui.html".
figma.showUI(__html__);

// This monitors the selection changes and posts the selection to the UI
figma.on("selectionchange", async () => {
  const btnArr = await getnBtnJson();

  // const typoArr = await genTypoGraphy();
  // console.log("figma.codegen.on typo>> ", typoArr);

  // const result = await POST_generateCode(typoArr);
  // console.log(result);

  figma.ui.postMessage(figma.currentPage.selection);
  console.log(figma.currentPage.selection);
});

async function POST_generateCode(figmaArr: any) {
  try {
    const postGenCode = await fetch("http://localhost:3000/json-parser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonList: figmaArr }),
    });

    const result = await postGenCode.json();

    // const postGenCode = axios.post(
    //   "http://localhost:3000/json-parser ",
    //   {
    //     jsonList: figmaArr,
    //   },
    //   {
    //     headers: {
    //       contentType: "application/json",
    //     },
    //   },
    // );
    // const result = (await postGenCode).data;
    console.log("result>> ", result);
    return result;
  } catch (error) {
    console.error("Error>> ", error);
  }
}
