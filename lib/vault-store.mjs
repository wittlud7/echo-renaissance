// Each chunk stays below D1's 2 MB row limit. Head CAS and new chunks share one transaction.
const CHARS=450000;
export async function readVault(db,userId){
 if(!userId)throw Error('Authentication required');
 const [head,chunks]=await db.batch([
  db.prepare('SELECT content,revision,updated_at FROM echo_vaults WHERE user_id = ?').bind(userId),
  db.prepare("SELECT content FROM echo_vault_chunks WHERE user_id=? AND upload_id=(SELECT CASE WHEN json_extract(content,'$.version') IS NULL THEN json_extract(content,'$._echo_chunks') ELSE '' END FROM echo_vaults WHERE user_id=?) ORDER BY part").bind(userId,userId),
 ]);
 const row=head.results[0];if(!row)return {state:null,revision:0};let state=JSON.parse(row.content);
 if(state.version!==1&&state._echo_chunks){if(!chunks.results.length)throw Error('Cloud data is incomplete');state=JSON.parse(chunks.results.map(c=>c.content).join(''));}
 return {state,revision:row.revision,updatedAt:row.updated_at};
}
export async function writeVault(db,userId,state,revision,now=new Date().toISOString()){
 if(!userId)throw Error('Authentication required');const content=JSON.stringify(state),uploadId=crypto.randomUUID(),commands=[];
 let stored=content;
 if(content.length>CHARS){stored=JSON.stringify({_echo_chunks:uploadId});let index=0;for(let i=0;i<content.length;){let end=Math.min(content.length,i+CHARS);if(end<content.length&&content.charCodeAt(end-1)>=0xd800&&content.charCodeAt(end-1)<=0xdbff)end--;commands.push(db.prepare('INSERT INTO echo_vault_chunks(user_id,upload_id,part,content) VALUES(?,?,?,?)').bind(userId,uploadId,index++,content.slice(i,end)));i=end;}}
 commands.push(revision===0?db.prepare('INSERT INTO echo_vaults (user_id,content,revision,updated_at) VALUES (?,?,1,?) ON CONFLICT(user_id) DO NOTHING RETURNING revision').bind(userId,stored,now):db.prepare('UPDATE echo_vaults SET content=?, revision=revision+1, updated_at=? WHERE user_id=? AND revision=? RETURNING revision').bind(stored,now,userId,revision));
 const result=await db.batch(commands);const committed=result[result.length-1].results[0];
 if(!committed){await db.prepare('DELETE FROM echo_vault_chunks WHERE user_id=? AND upload_id=?').bind(userId,uploadId).run();return null;}
 // Read the current head inside the cleanup query: concurrent successful writes stay intact.
 await db.prepare("DELETE FROM echo_vault_chunks WHERE user_id=? AND upload_id != COALESCE((SELECT CASE WHEN json_extract(content,'$.version') IS NULL THEN json_extract(content,'$._echo_chunks') ELSE '' END FROM echo_vaults WHERE user_id=?),'')").bind(userId,userId).run().catch(()=>{});
 return {revision:committed.revision,updatedAt:now};
}
