import {  
  pgTable, uuid, text, integer, jsonb, timestamp  
} from 'drizzle-orm/pg-core' 
  
export const repos = pgTable('repos', { 
  id: uuid('id').defaultRandom().primaryKey(), 
  userId: text('user_id').notNull(), 
  repoUrl: text('repo_url').notNull(), 
  repoName: text('repo_name').notNull(), 
  owner: text('owner').notNull(), 
  description: text('description'), 
  language: text('language'), 
  isIndexed: integer('is_indexed').default(0), 
  totalFiles: integer('total_files').default(0), 
  createdAt: timestamp('created_at').defaultNow(), 
}) 
  
export const chats = pgTable('chats', { 
  id: uuid('id').defaultRandom().primaryKey(), 
  repoId: uuid('repo_id').notNull(), 
  userId: text('user_id').notNull(), 
  question: text('question').notNull(), 
  answer: text('answer').notNull(), 
  createdAt: timestamp('created_at').defaultNow(), 
}) 
  
export const reviews = pgTable('reviews', { 
  id: uuid('id').defaultRandom().primaryKey(), 
  repoId: uuid('repo_id').notNull(), 
  userId: text('user_id').notNull(), 
  prUrl: text('pr_url'), 
  codeSnippet: text('code_snippet'), 
  reviewContent: text('review_content').notNull(), 
  createdAt: timestamp('created_at').defaultNow(), 
}) 
  
export const healthReports = pgTable('health_reports', { 
  id: uuid('id').defaultRandom().primaryKey(), 
  repoId: uuid('repo_id').notNull(), 
  userId: text('user_id').notNull(), 
  overallScore: integer('overall_score'), 
  complexityScore: integer('complexity_score'), 
  documentationScore: integer('documentation_score'), 
  duplicateScore: integer('duplicate_score'), 
  bugRiskScore: integer('bug_risk_score'), 
  suggestions: jsonb('suggestions'), 
  createdAt: timestamp('created_at').defaultNow(), 
}) 
