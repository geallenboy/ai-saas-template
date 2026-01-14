// @ts-nocheck
import * as __fd_glob_24 from "../src/content/docs/development/project-structure.mdx?collection=docs"
import * as __fd_glob_23 from "../src/content/docs/development/database-development.mdx?collection=docs"
import * as __fd_glob_22 from "../src/content/docs/development/configuration.mdx?collection=docs"
import * as __fd_glob_21 from "../src/content/docs/development/api-development.mdx?collection=docs"
import * as __fd_glob_20 from "../src/content/docs/features/payment-billing.mdx?collection=docs"
import * as __fd_glob_19 from "../src/content/docs/features/file-management.mdx?collection=docs"
import * as __fd_glob_18 from "../src/content/docs/features/authentication.mdx?collection=docs"
import * as __fd_glob_17 from "../src/content/docs/customization/themes.mdx?collection=docs"
import * as __fd_glob_16 from "../src/content/docs/deployment/vercel.mdx?collection=docs"
import * as __fd_glob_15 from "../src/content/docs/deployment/production-setup.mdx?collection=docs"
import * as __fd_glob_14 from "../src/content/docs/deployment/docker.mdx?collection=docs"
import * as __fd_glob_13 from "../src/content/docs/deployment/ci-cd.mdx?collection=docs"
import * as __fd_glob_12 from "../src/content/docs/aichat/ui-ux.mdx?collection=docs"
import * as __fd_glob_11 from "../src/content/docs/aichat/overview.mdx?collection=docs"
import * as __fd_glob_10 from "../src/content/docs/aichat/data-models.mdx?collection=docs"
import * as __fd_glob_9 from "../src/content/docs/aichat/conversation-flow.mdx?collection=docs"
import * as __fd_glob_8 from "../src/content/docs/quickstart.mdx?collection=docs"
import * as __fd_glob_7 from "../src/content/docs/index.mdx?collection=docs"
import * as __fd_glob_6 from "../src/content/docs/architecture.mdx?collection=docs"
import { default as __fd_glob_5 } from "../src/content/docs/features/meta.json?collection=docs"
import { default as __fd_glob_4 } from "../src/content/docs/development/meta.json?collection=docs"
import { default as __fd_glob_3 } from "../src/content/docs/deployment/meta.json?collection=docs"
import { default as __fd_glob_2 } from "../src/content/docs/customization/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../src/content/docs/aichat/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../src/content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "src/content/docs", {"meta.json": __fd_glob_0, "aichat/meta.json": __fd_glob_1, "customization/meta.json": __fd_glob_2, "deployment/meta.json": __fd_glob_3, "development/meta.json": __fd_glob_4, "features/meta.json": __fd_glob_5, }, {"architecture.mdx": __fd_glob_6, "index.mdx": __fd_glob_7, "quickstart.mdx": __fd_glob_8, "aichat/conversation-flow.mdx": __fd_glob_9, "aichat/data-models.mdx": __fd_glob_10, "aichat/overview.mdx": __fd_glob_11, "aichat/ui-ux.mdx": __fd_glob_12, "deployment/ci-cd.mdx": __fd_glob_13, "deployment/docker.mdx": __fd_glob_14, "deployment/production-setup.mdx": __fd_glob_15, "deployment/vercel.mdx": __fd_glob_16, "customization/themes.mdx": __fd_glob_17, "features/authentication.mdx": __fd_glob_18, "features/file-management.mdx": __fd_glob_19, "features/payment-billing.mdx": __fd_glob_20, "development/api-development.mdx": __fd_glob_21, "development/configuration.mdx": __fd_glob_22, "development/database-development.mdx": __fd_glob_23, "development/project-structure.mdx": __fd_glob_24, });