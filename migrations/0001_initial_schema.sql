-- AI Content Creation App Database Schema

-- Projects table - stores user content creation projects
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workflows table - stores the node-based workflow configurations
CREATE TABLE IF NOT EXISTS workflows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  nodes_data TEXT NOT NULL, -- JSON string of node configuration
  connections_data TEXT, -- JSON string of node connections
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Business parameters table - stores user input parameters for content creation
CREATE TABLE IF NOT EXISTS business_parameters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER NOT NULL,
  business_background TEXT,
  target_audience TEXT,
  content_objectives TEXT,
  keywords TEXT, -- JSON array of keywords
  content_format TEXT, -- blog, social_media, video, etc.
  brand_voice TEXT,
  industry TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Content strategies table - stores AI generated content strategies with scores
CREATE TABLE IF NOT EXISTS content_strategies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  content_outline TEXT, -- JSON structure of content outline
  relevance_score REAL DEFAULT 0, -- 0-100 score
  likability_score REAL DEFAULT 0, -- 0-100 score 
  shareable_score REAL DEFAULT 0, -- 0-100 score
  convertibility_score REAL DEFAULT 0, -- 0-100 score
  ai_reasoning TEXT, -- AI explanation for scores
  status TEXT DEFAULT 'draft', -- draft, selected, approved, published
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

-- Generated content table - stores the final generated content
CREATE TABLE IF NOT EXISTS generated_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy_id INTEGER NOT NULL,
  content_type TEXT NOT NULL, -- text, image, video
  content_data TEXT NOT NULL, -- actual content or file reference
  metadata TEXT, -- JSON metadata about the content
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft', -- draft, ready, published
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (strategy_id) REFERENCES content_strategies(id) ON DELETE CASCADE
);

-- Content assets table - stores images, videos, and other media assets
CREATE TABLE IF NOT EXISTS content_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id INTEGER,
  asset_type TEXT NOT NULL, -- image, video, audio, document
  file_path TEXT NOT NULL, -- cloud storage path
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES generated_content(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workflows_project_id ON workflows(project_id);
CREATE INDEX IF NOT EXISTS idx_business_parameters_workflow_id ON business_parameters(workflow_id);
CREATE INDEX IF NOT EXISTS idx_content_strategies_workflow_id ON content_strategies(workflow_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_strategy_id ON generated_content(strategy_id);
CREATE INDEX IF NOT EXISTS idx_content_assets_content_id ON content_assets(content_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_content_strategies_status ON content_strategies(status);