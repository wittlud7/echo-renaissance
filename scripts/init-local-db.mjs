import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { projectRoot } from './sites-env.mjs';

// Applies only migrations that Wrangler has not recorded. Always local;
// no account token, production database ID or destructive reset is needed.
const result=spawnSync(process.execPath,[
 fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url)),
 'd1','migrations','apply','DB','--local','--config','wrangler.local.jsonc',
 '--persist-to','.wrangler/state'
],{cwd:projectRoot,stdio:'inherit',env:{...process.env,CI:'true'}});
if(result.error)throw result.error;
process.exit(result.status??1);
