// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).
import { Buffer } from "buffer";

// Runs this code if the plugin is run in Figma
if (figma.editorType === 'figma') {
  // This plugin will open a window to prompt the user to enter a number, and
  // it will then create that many rectangles on the screen.

  // This shows the HTML page in "ui.html".
  figma.showUI(__html__);


  // Calls to "parent.postMessage" from within the HTML page will trigger this
  // callback. The callback will be passed the "pluginMessage" property of the
  // posted message.
  figma.ui.onmessage = async (msg: { type: string, count: number }) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'nuggi') {
      // This plugin creates rectangles on the screen.
      if (figma.currentPage.selection.length === 0) {
        figma.notify('Please select an object');
        return;
      }
      if (figma.currentPage.selection.length > 1) {
        figma.notify('Please select only one object');
        return;
      }

      const target = figma.currentPage.selection[0];

      const imageTarget = await target.exportAsync({
        format: 'PNG',
        constraint: {
          type: 'SCALE',
          value: 1
        }
      })

      try {
        const base64String = uint8ArrayToBase64(imageTarget);
        const bgRemovedImage = await sendImageToServer(base64String);

        const { image } = await bgRemovedImage as { image: string };
        const newRect = figma.createRectangle();
        const imageUint8Array = await base64ToUint8Array(image);
        if (!imageUint8Array) {
          figma.notify('Failed to convert image to Uint8Array');
          return;
        }
        const imageHash = await figma.createImage(imageUint8Array).hash;

        newRect.fills = [{
          type: 'IMAGE',
          imageHash: imageHash,
          scaleMode: 'FILL'
        }];
        newRect.resize(target.width, target.height);
        figma.currentPage.appendChild(newRect);

      } catch (error) {
        figma.notify('Failed to remove background');

      }
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
  };
}


async function sendImageToServer(image: string) {
  const base64Image = `data:image/png;base64,${image}`;
  const baseUrl = "https://nuggi-server-production.up.railway.app/remove-bg"

  const response = await fetch(baseUrl, {
    method: 'POST',
    body: JSON.stringify({ image: base64Image }),

    headers: {
      'Content-Type': 'application/json',
    }
  });
  return response.json();
}

function uint8ArrayToBase64(uint8Array: Uint8Array) {
  return Buffer.from(uint8Array).toString("base64");
}
async function base64ToUint8Array(base64: string): Promise<Uint8Array | undefined> {
  try {
    // base64 문자열에서 헤더(data:image/png;base64,) 제거
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');

    // Buffer를 사용하여 base64를 Uint8Array로 변환
    const buffer = Buffer.from(cleanBase64, 'base64');
    return new Uint8Array(buffer);

  } catch (error) {
    console.error('Base64 to Uint8Array 변환 실패:', error);

    return undefined;
  }
}