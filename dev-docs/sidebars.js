/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: "category",
      label: "Introduction",
      link: {
        type: "doc",
        id: "introduction/get-started",
      },
      items: ["introduction/development", "introduction/contributing"],
    },
    {
      type: "category",
      label: "Codebase",
      items: ["codebase/json-schema", "codebase/frames"],
    },
    {
      type: "category",
      label: "ex-excalidraw",
      collapsed: false,
      items: [
        "ex-excalidraw/installation",
        "ex-excalidraw/integration",
        "ex-excalidraw/customizing-styles",
        {
          type: "category",
          label: "API",
          link: {
            type: "doc",
            id: "ex-excalidraw/api/api-intro",
          },
          items: [
            {
              type: "category",
              label: "Props",
              link: {
                type: "doc",
                id: "ex-excalidraw/api/props/props",
              },
              items: [
                "ex-excalidraw/api/props/initialdata",
                "ex-excalidraw/api/props/excalidraw-api",
                "ex-excalidraw/api/props/render-props",
                "ex-excalidraw/api/props/ui-options",
              ],
            },
            {
              type: "category",
              label: "Children Components",
              link: {
                type: "doc",
                id: "ex-excalidraw/api/children-components/children-components-intro",
              },
              items: [
                "ex-excalidraw/api/children-components/main-menu",
                "ex-excalidraw/api/children-components/welcome-screen",
                "ex-excalidraw/api/children-components/sidebar",
                "ex-excalidraw/api/children-components/footer",
                "ex-excalidraw/api/children-components/live-collaboration-trigger",
              ],
            },
            {
              type: "category",
              label: "Utils",
              link: {
                type: "doc",
                id: "ex-excalidraw/api/utils/utils-intro",
              },
              items: [
                "ex-excalidraw/api/utils/export",
                "ex-excalidraw/api/utils/restore",
              ],
            },
            "ex-excalidraw/api/constants",
            "ex-excalidraw/api/excalidraw-element-skeleton",
          ],
        },
        "ex-excalidraw/faq",
        "ex-excalidraw/development",
      ],
    },
    {
      type: "category",
      label: "@excalidraw/mermaid-to-excalidraw",
      link: {
        type: "doc",
        id: "@excalidraw/mermaid-to-excalidraw/installation",
      },
      items: [
        "@excalidraw/mermaid-to-excalidraw/api",
        "@excalidraw/mermaid-to-excalidraw/development",
        {
          type: "category",
          label: "Codebase",
          link: {
            type: "doc",
            id: "@excalidraw/mermaid-to-excalidraw/codebase/codebase",
          },
          items: [
            {
              type: "category",
              label: "How Parser works under the hood?",
              link: {
                type: "doc",
                id: "@excalidraw/mermaid-to-excalidraw/codebase/parser/parser",
              },
              items: [
                "@excalidraw/mermaid-to-excalidraw/codebase/parser/flowchart",
              ],
            },
            "@excalidraw/mermaid-to-excalidraw/codebase/new-diagram-type",
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;
