export const genTypoGraphy = async () => {
  const typoFrame = figma.currentPage.findOne(
    (node) => node.name === "Typo" && node.type === "FRAME",
  ) as FrameNode;

  if (typoFrame) {
    console.log(typoFrame.children);
    const typo = typoFrame.children.filter(
      (node) => node.type === "TEXT",
    ) as TextNode[];

    const typoObj = await Promise.all(
      typo.map(async (t) => {
        return {
          name: t.name,
          value: t.characters,
          styleText: await t
            .getCSSAsync()
            .then((css) => filterCssProperties(css)),
        };
      }),
    );

    return typoObj;
  }
};

const filterCssProperties = (
  cssObject: Record<string, any>,
): Record<string, any> => {
  const VALID_TEXT_KEY = [
    "font-family",
    "font-size",
    "line-height",
    "letter-spacing",
  ];

  return VALID_TEXT_KEY.reduce<Record<string, any>>((obj, key) => {
    if (cssObject[key] !== undefined) {
      obj[key] = cssObject[key];
    }
    return obj;
  }, {});
}; 
