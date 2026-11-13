// sanity.cli.js
// Lets `npx sanity ...` commands (cors, tokens, dataset import/export,
// documents query) find this project from inside the repo.

import { defineCliConfig } from 'sanity/cli';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineCliConfig({ api: { projectId, dataset } });
