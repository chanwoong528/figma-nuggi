export const getnBtnJson = async () => {
  const buttonFrame = figma.currentPage.findOne(
    (node) => node.name === "Buttons" && node.type === "FRAME",
  ) as FrameNode;

  if (buttonFrame) {
    const btnsComp = buttonFrame.children.find(
      (node) => node.type === "COMPONENT_SET",
    ) as ComponentSetNode;
    // console.log(">>>>>>>>", btnsComp.variantGroupProperties);
    // const buttons = buttonFrame.children.filter(
    //   (node) => node.type === "INSTANCE",
    // );

    const buttons = buttonFrame.children.filter(
      (node) =>
        (node.type === "COMPONENT" || node.type === "INSTANCE") &&
        node.name.includes("Button"),
    ) as unknown as ComponentSetNode[] | InstanceNode[];

    console.log(">>>>>>>>>", buttons);

    const btnObj = await Promise.all(
      btnsComp.children.map(async (btn) => {
        // console.log(btn.variantGroupProperties);
        return {
          // typeProps: btn.componentPropertyDefinitions,
          styleProps: await btn.getCSSAsync(),
          name: btn.name,
          type: btn.type,
        };
      }),
    );
    // const btnObj = await Promise.all(
    //   buttons.map(async (btn) => {
    //     console.log(btn);
    //     return {
    //       // typeInstance: btn.componentProperties
    //       // typeProps: btn.componentPropertyDefinitions,
    //       styleProps: await btn.getCSSAsync(),
    //       name: btn.name,
    //       type: btn.type,
    //     };
    //   }),
    // );

    console.log("@@@@@@@@@@@ ", btnObj);

    // const btnsObj = await Promise.all(
    //   buttons.map(async (btn) => {
    //     const css = await btn.getCSSAsync();
    //     const imageAssets = await Promise.all(
    //       btn.children.map(async (node) => {
    //         if (node.name === "Base") {
    //           const childrenNodes = (node as InstanceNode).children;
    //           if (
    //             childrenNodes.length > 0 &&
    //             childrenNodes.some((child) => child.type === "FRAME")
    //           ) {
    //             const target = childrenNodes.find(
    //               (iamgeNode) => iamgeNode.type === "FRAME",
    //             )?.children[0] as FrameNode;

    //             // console.log("Children nodes>> ", target);
    //             const imageBytes = await target.exportAsync({
    //               format: "SVG",
    //             });
    //             // console.log("Image bytes>> ", imageBytes);
    //           }

    //           // const imageBytes = await node.exportAsync({ format: "PNG" });
    //           // return { name: node.name, image: imageBytes };
    //         }
    //         return null;
    //       }),
    //     );

    //     return {
    //       name: btn.name,
    //       type: btn.type,
    //       styleProps: css,
    //       images: imageAssets.filter(Boolean),
    //     };
    //   }),
    // );
    // console.log("Final result>> ", btnsObj);
  }
};
