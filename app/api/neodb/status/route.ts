import {env} from 'cloudflare:workers';import {getChatGPTUser} from '../../../chatgpt-auth';import {neoStatus} from '../../../../lib/neodb.mjs';
export const dynamic='force-dynamic';
export async function GET(){const user=await getChatGPTUser();if(!user||!env.DB)return Response.json({connected:false},{headers:{'Cache-Control':'no-store'}});return Response.json(await neoStatus(env.DB,user.userId),{headers:{'Cache-Control':'no-store'}});}
