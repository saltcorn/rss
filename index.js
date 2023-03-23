const { features } = require("@saltcorn/data/db/state");
const Workflow = require("@saltcorn/data/models/workflow");
const Form = require("@saltcorn/data/models/form");
const { json_list_to_external_table } = require("@saltcorn/data/plugin-helper");
const Parser = require("rss-parser");

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

const cache = {};

const stale = (t) => {
  const diff_ms = new Date().getTime() - t.getTime();
  return diff_ms > 5 * 60 * 1000;
};

module.exports = {
  sc_plugin_api_version: 1,
  plugin_name: "rss",
  table_providers: {
    "RSS feed": {
      configuration_workflow,
      get_table: (cfg) => {
        return {
          getRows: async () => {
            if (!cfg?.url) return [];
            if (cache[cfg.url] && !stale(cache[cfg.url].time))
              return cache[cfg.url].items;
            const parser = new Parser();
            const rows = await parser.parseURL(cfg.url);
            cache[cfg.url] = { time: new Date(), items: rows.items };
            return rows.items;
          },
          fields: [
            { name: "title", label: "Title", type: "String" },
            { name: "link", label: "Link", type: "String" },
          ],
        };
      },
    },
  },
};
