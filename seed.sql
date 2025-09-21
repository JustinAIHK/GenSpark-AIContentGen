-- Seed data for AI Content Creation App

-- Sample project
INSERT OR IGNORE INTO projects (id, name, description) VALUES 
  (1, 'Digital Marketing Campaign', 'Content strategy for Q4 marketing push'),
  (2, 'Product Launch Content', 'Content for new SaaS product launch');

-- Sample workflow
INSERT OR IGNORE INTO workflows (id, project_id, name, nodes_data, connections_data) VALUES 
  (1, 1, 'Social Media Strategy', 
   '{"nodes":[{"id":"business","type":"business_input","position":{"x":100,"y":100}},{"id":"audience","type":"audience_input","position":{"x":300,"y":100}},{"id":"generator","type":"content_generator","position":{"x":500,"y":200}}]}',
   '{"connections":[{"source":"business","target":"generator"},{"source":"audience","target":"generator"}]}');

-- Sample business parameters
INSERT OR IGNORE INTO business_parameters (
  workflow_id, 
  business_background, 
  target_audience, 
  content_objectives, 
  keywords, 
  content_format,
  brand_voice,
  industry
) VALUES 
  (1, 
   'Tech startup specializing in AI-powered project management tools for remote teams', 
   'Project managers, team leads, and remote workers aged 25-45 in tech companies',
   'Increase brand awareness, drive trial signups, establish thought leadership',
   '["project management", "remote work", "AI tools", "productivity", "collaboration"]',
   'social_media',
   'Professional yet approachable, innovative, solution-focused',
   'Software/Technology'
  );

-- Sample content strategies
INSERT OR IGNORE INTO content_strategies (
  workflow_id,
  title,
  description,
  content_outline,
  relevance_score,
  likability_score,
  shareable_score,
  convertibility_score,
  ai_reasoning,
  status
) VALUES 
  (1,
   'Remote Team Productivity: 5 AI-Powered Strategies',
   'Educational content showcasing how AI can solve common remote team challenges',
   '{"sections":["Hook: Remote team struggles","Problem identification","AI solution overview","5 specific strategies","Call-to-action for trial"]}',
   92.5,
   87.3,
   84.1,
   89.7,
   'High relevance due to target audience pain points. Strong likability with actionable tips. Good shareability for professional networks. High conversion potential with clear CTA.',
   'draft'
  ),
  (1,
   'Behind the Scenes: How We Built Our AI',
   'Thought leadership content showing company expertise and innovation',
   '{"sections":["Company story hook","Technical challenges","Innovation process","Results achieved","Future vision"]}',
   88.2,
   91.4,
   89.6,
   76.3,
   'Good relevance for tech audience. High likability with storytelling approach. Very shareable content. Moderate conversion - focuses on brand building.',
   'draft'
  );

-- Sample generated content
INSERT OR IGNORE INTO generated_content (
  strategy_id,
  content_type,
  content_data,
  metadata,
  status
) VALUES 
  (1,
   'text',
   '🚀 Remote teams are struggling with productivity—but AI is changing the game!\n\nHere are 5 AI-powered strategies that transformed how our clients manage projects:\n\n1️⃣ Smart Task Prioritization\n2️⃣ Automated Progress Tracking\n3️⃣ Intelligent Resource Allocation\n4️⃣ Predictive Deadline Management\n5️⃣ Context-Aware Collaboration\n\n💡 Ready to 10x your team''s efficiency? Try our AI project manager free for 14 days!\n\n#RemoteWork #ProjectManagement #AI #Productivity',
   '{"platform":"linkedin","character_count":487,"hashtags":4,"cta_included":true}',
   'ready'
  );