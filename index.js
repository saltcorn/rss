const { features } = require("@saltcorn/data/db/state");
const Workflow = require("@saltcorn/data/models/workflow");
const Form = require("@saltcorn/data/models/form");
const { json_list_to_external_table } = require("@saltcorn/data/plugin-helper");
let Parser = require("rss-parser");

const configuration_workflow = () =>
  new Workflow({
    steps: [
      {
        name: "feed",
        form: async (context) => {
          return new Form({
            fields: [
              {
                name: "url",
                label: "Feed URL",
                required: true,
                type: "String",
              },
            ],
          });
        },
      },
    ],
  });

module.exports = {
  sc_plugin_api_version: 1,
  plugin_name: "rss",
  table_providers: {
    rss: {
      configuration_workflow,
      get_table: async (cfg) => {
        if (!cfg?.url) return null;
        const parser = new Parser();
        const feed = await parser.parseURL(cfg.url);
        return json_list_to_external_table(
          () => feed,
          [
            { name: "title", label: "Title", type: "String" },
            { name: "link", label: "Link", type: "String" },
          ]
        );
      },
    },
  },
};
