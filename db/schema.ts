import { sqliteTable, text, integer, primaryKey, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const vaults = sqliteTable('echo_vaults', {
 userId: text('user_id').primaryKey(),
 content: text('content').notNull(),
 revision: integer('revision').notNull().default(1),
 updatedAt: text('updated_at').notNull(),
});
export const vaultChunks=sqliteTable('echo_vault_chunks',{
 userId:text('user_id').notNull(),uploadId:text('upload_id').notNull(),part:integer('part').notNull(),content:text('content').notNull(),
},table=>[primaryKey({columns:[table.userId,table.uploadId,table.part]})]);
export const neoApps=sqliteTable('echo_neo_apps',{origin:text('origin').primaryKey(),clientId:text('client_id').notNull(),clientSecret:text('client_secret').notNull()});
export const neoSessions=sqliteTable('echo_neo_sessions',{stateHash:text('state_hash').primaryKey(),userId:text('user_id').notNull(),origin:text('origin').notNull(),phase:text('phase').notNull(),token:text('token'),account:text('account'),expiresAt:integer('expires_at').notNull()},table=>[index('echo_neo_sessions_user_expiry').on(table.userId,table.expiresAt)]);
export const publications=sqliteTable('echo_publications',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),projectId:text('project_id').notNull(),authorKey:text('author_key').notNull(),
 title:text('title').notNull(),authorName:text('author_name').notNull(),authorBio:text('author_bio').notNull(),intent:text('intent').notNull(),format:text('format').notNull(),excerpt:text('excerpt').notNull(),sources:text('sources_json').notNull(),content:text('content_json').notNull(),publishedAt:text('published_at').notNull(),updatedAt:text('updated_at').notNull(),
},table=>[uniqueIndex('echo_publications_owner_project').on(table.ownerId,table.projectId),index('echo_publications_date').on(table.publishedAt),index('echo_publications_author').on(table.authorKey)]);
