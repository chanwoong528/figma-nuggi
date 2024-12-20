import { Buffer } from "buffer";

type CssProps = Record<string, string>;
// interface StateCssProps {
//   [colorOrType: string]: {
//     [state: string]: {
//       cssProps: CssProps;
//       nodeType?: string;
//       childrenCss?: { nodeType?: string; cssProps: StateCssProps }[];
//     };
//   };
// }

interface StateCssProps {
  [key: string]: any;
}

interface VariantBaseTypes {
  type: string[];
  color: string[];
  state: string[];
}

export const covertJsonToCss = async (
  nodes: ComponentNode[],
): Promise<StateCssProps> => {
  const resultCssProps: StateCssProps = {};

  await Promise.all(
    nodes.map(async (node) => {
      const cssProps = await node.getCSSAsync();
      const childNodeCssProps = await Promise.all(
        node.children.map(async (child) => {
          return childNodeCssCleanUp(child as ComponentNode);
        }),
      );

      if (!!node.variantProperties?.type) {
        resultCssProps[node.variantProperties.type] = {
          ...resultCssProps[node.variantProperties.type],
          [node.variantProperties.state]: {
            nodeType: node.type,
            cssProps: cssProps,
            childrenCss: childNodeCssProps.filter(
              (child) => child !== undefined,
            ),
          },
        };
      }
    }),
  );

  return cssCleanUp(resultCssProps);
};

const childNodeCssCleanUp = async (
  child: ComponentNode | TextNode | InstanceNode,
) => {
  if (child.type === "COMPONENT") {
    return await covertJsonToCss([child] as ComponentNode[]);
  }

  if (child.type === "TEXT") {
    return {
      nodeType: child.type,
      cssProps: {
        Default: {
          Default: {
            cssProps: await child.getCSSAsync(),
          },
        },
      },
    };
  }

  if (child.type === "INSTANCE" && child.name.includes("icon")) {
    const imageSrc = uint8ArrayToBase64(await child.exportAsync());
    return {
      nodeType: child.type,
      cssProps: {
        Default: {
          Default: {
            imageSrc: imageSrc,
            cssProps: await child.getCSSAsync(),
          },
        },
      },
    };
  }
};

const cssCleanUp = (stateCssProps: StateCssProps) => {
  const types = Object.keys(stateCssProps);

  types.forEach((type) => {
    const statesByType = Object.keys(stateCssProps[type]);
    if (!!statesByType.includes("Default")) {
      const defaultCssProps = stateCssProps[type]["Default"].cssProps;
      statesByType.forEach((state) => {
        if (state !== "Default") {
          const currentCssProps = stateCssProps[type][state].cssProps;
          const filteredCssProps = filterDefaultCssProperty(
            defaultCssProps,
            currentCssProps,
          );
          stateCssProps[type][state].cssProps = filteredCssProps;
        }
      });
    }
  });

  return stateCssProps;
};

const filterDefaultCssProperty = (cssObj1: CssProps, cssObj2: CssProps) => {
  const cssKeys = Object.keys(cssObj1);
  const filteredResult: CssProps = {};

  cssKeys.forEach((key) => {
    if (cssObj1[key] !== cssObj2[key]) {
      filteredResult[key] = cssObj2[key];
    }
  });

  return filteredResult;
};

function uint8ArrayToBase64(uint8Array: Uint8Array) {
  return Buffer.from(uint8Array).toString("base64");
}
