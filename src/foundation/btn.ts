import { covertJsonToCss } from "./cssConverter";

interface DesignNode {
  name: string;
  description: string;
  stateCssProps: StateCssProps;

  children: DesignNode[] | [];
}

type CssProps = Record<string, string>;

interface StateCssProps {
  [colorOrType: string]: {
    [state: string]: {
      cssProps: CssProps;
    };
  };
}

interface VariantBaseTypes {
  color: string[];
  state: string[];
  type: string[];
}

interface VariantProperties {
  color?: string; // default -> default styling
  type?: string; // default -> styling
  state?: string;
}

function parseComponentSet(sectionNode: SectionNode): ComponentSetNode[] {
  const btnComponetSetList = sectionNode.children.filter(
    (item) => item.type === "COMPONENT_SET",
  ) as ComponentSetNode[];

  return btnComponetSetList;
}
async function parseComponent(
  compSetNode: ComponentSetNode,
): Promise<DesignNode> {
  // const cssPropsByState = await formatCssBasedVariants(
  //   compSetNode.children as ComponentNode[],
  // );
  const variantBaseTypes = formatVariantBaseTypes(
    compSetNode.variantGroupProperties,
  );

  const cssPropsByState = await covertJsonToCss(
    compSetNode.children as ComponentNode[],
  );

  console.log("<<< cssPropsByState >>> ", cssPropsByState);
  // return {
  //   name: compSetNode.name,
  //   description: compSetNode.description,
  //   stateCssProps: cssPropsByState,
  //   children: [],
  // };
}

async function structureCssPropsByState(buttons: any[]) {
  const structuredProps: Record<string, Record<string, any>> = {};

  // buttons.forEach(async (button) => {
  //   const { name, cssProps } = button;
  //   const [color, state, type] = name
  //     .split(", ")
  //     .map((item: string) => item.split("=")[1]);

  //   // type에 따라 구조화
  //   if (!structuredProps[type]) {
  //     structuredProps[type] = {};
  //   }

  //   // color에 따라 구조화
  //   if (!structuredProps[type][color]) {
  //     structuredProps[type][color] = {};
  //   }

  //   // state에 따라 구조화
  //   if (!structuredProps[type][color][state]) {
  //     structuredProps[type][color][state] = { cssProps: {} };
  //   }

  //   // Default 상태의 cssProps를 가져옴
  //   const defaultCssProps = structuredProps[type][color]["Default"].cssProps;

  //   if (button.children.length > 0) {
  //     const btnChild = await Promise.all(
  //       button.children.map(async (child: ComponentNode) => {
  //         const cssProps = await child.getCSSAsync();
  //         return {
  //           cssProps,
  //         };
  //       }),
  //     );
  //     structuredProps[type][color][state].children = btnChild;
  //   }

  //   // 중복된 cssProps 제거
  //   if (defaultCssProps) {
  //     console.log(structuredProps[type][color][state]);
  //     console.log(defaultCssProps);
  //     const isDuplicate = (
  //       props1: Record<string, any>,
  //       props2: Record<string, any>,
  //     ) => {
  //       return (
  //         Object.keys(props1).length === Object.keys(props2).length &&
  //         Object.keys(props1).every((key) => props1[key] === props2[key])
  //       );
  //     };

  //     // Default와 동일한 cssProps를 가진 상태는 추가하지 않음
  //     if (isDuplicate(defaultCssProps, cssProps)) {
  //       return; // 중복된 경우, 추가하지 않음
  //     }

  //     // Default와 동일한 속성을 필터링
  //     const filteredCssProps = filterCssProps(cssProps, defaultCssProps);
  //     if (Object.keys(filteredCssProps).length === 0) {
  //       return; // 필터링 후 속성이 없으면 추가하지 않음
  //     }

  //     structuredProps[type][color][state].cssProps = filteredCssProps;
  //   } else {
  //     structuredProps[type][color][state].cssProps = cssProps; // Default가 없으면 그대로 추가
  //   }
  // });

  // return structuredProps;
}

// Function to filter out properties that match the Default CSS
const filterCssProps = (cssProps: CssProps, defaultCss: CssProps): CssProps => {
  const filteredProps: CssProps = {};
  for (const key in cssProps) {
    if (cssProps[key] !== defaultCss[key]) {
      filteredProps[key] = cssProps[key];
    }
  }
  return filteredProps;
};

async function formatCssBasedVariants(compNodeList: ComponentNode[]) {
  const formattedBtnList = await Promise.all(
    compNodeList.map(async (btn) => {
      const cssProps = await btn.getCSSAsync();
      return {
        name: btn.name,
        cssProps: cssProps,
        children: btn.children,
      };
    }),
  );
  return structureCssPropsByState(formattedBtnList);
}

function formatVariantBaseTypes(variantGroup: {
  [key: string]: {
    values: string[];
  };
}): VariantBaseTypes {
  return Object.entries(variantGroup).reduce(
    (acc, [key, { values }]) => ({ ...acc, [key]: values }),
    {},
  ) as VariantBaseTypes;
}

export const getnBtnJson = async () => {
  const buttonFrame = figma.currentPage.findOne(
    (node) => node.type === "SECTION" && node.name.includes("Buttons"),
  ) as SectionNode;

  if (buttonFrame) {
    const btnComponetSetList = parseComponentSet(buttonFrame);

    const temp = await parseComponent(btnComponetSetList[0]);
    console.log("temp>> ", temp);

    const compBtnList = await Promise.all(
      btnComponetSetList.map(async (btnComp) => {
        const variantBaseTypes = formatVariantBaseTypes(
          btnComp.variantGroupProperties,
        );

        const childBtns = await Promise.all(
          btnComp.children.map(async (btn) => {
            const btnProps = Array.from((btn as ComponentNode).children);

            // const textNode = btnProps.find(
            //   (btnChild) => btnChild.type === "TEXT",
            // );
            // const textNodeCssProps = await textNode?.getCSSAsync();
            const cssProps = await btn.getCSSAsync();

            return {
              name: btn.name,
              cssProps: { ...cssProps },
              variantProperties: (btn as ComponentNode).variantProperties,
              btnProps: btnProps,
            };
          }),
        );

        return {
          name: btnComp.name,
          variantBaseTypes: variantBaseTypes,
          children: childBtns,
        };
      }),
    );

    console.log(compBtnList);
  }
};
