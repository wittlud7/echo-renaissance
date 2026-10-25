import { getChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from '../../chatgpt-auth';
export const dynamic='force-dynamic';
export async function GET(){const user=await getChatGPTUser();return Response.json({user:user?{id:user.userId,name:user.fullName||'回声创作者'}:null,signIn:chatGPTSignInPath('/echo/index.html'),signOut:chatGPTSignOutPath('/echo/index.html')},{headers:{'Cache-Control':'no-store'}});}
