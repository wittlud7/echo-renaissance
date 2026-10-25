import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { checkVault, writeAllowed } from '../../../lib/vault-validation.mjs';
import { readVault, writeVault } from '../../../lib/vault-store.mjs';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){const user=await getChatGPTUser();if(!user)return json({error:'请先登录'},401);if(!env.DB)return json({error:'云端数据库尚未就绪'},503);return json(await readVault(env.DB,user.userId));}
export async function PUT(request:Request){const user=await getChatGPTUser();if(!user)return json({error:'请先登录'},401);if(!writeAllowed(request))return json({error:'请求来源或格式不正确'},403);if(!env.DB)return json({error:'云端数据库尚未就绪'},503);let body;try{const raw=await request.text();if(new TextEncoder().encode(raw).byteLength>8_000_000)return json({error:'单个空间最多 8MB，请导出较早记录归档'},413);body=JSON.parse(raw);checkVault(body.state);if(!Number.isInteger(body.revision)||body.revision<0)throw Error('版本格式不正确');}catch(e){return json({error:e instanceof Error?e.message:'数据格式不正确'},400);}const now=new Date().toISOString();const result=await writeVault(env.DB,user.userId,body.state,body.revision,now);if(!result)return json({error:'其他设备有更新，请先取回云端版本再合并本机记录',conflict:true},409);return json({revision:result.revision,updatedAt:now});}
