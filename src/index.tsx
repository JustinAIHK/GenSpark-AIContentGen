import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database
  AI: Ai
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API endpoints
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Main application route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Content Creator - Node-Based Content Strategy Platform</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/cytoscape@3.26.0/dist/cytoscape.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/cytoscape-dagre@2.5.0/cytoscape-dagre.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/dagre@0.8.5/dist/dagre.min.js"></script>
        <link href="/static/styles.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50 min-h-screen">
        <!-- Header -->
        <nav class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center">
                        <i class="fas fa-brain text-blue-600 text-2xl mr-3"></i>
                        <h1 class="text-xl font-bold text-gray-900">AI Content Creator</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button id="save-workflow" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-save mr-2"></i>Save Workflow
                        </button>
                        <button id="new-project" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-plus mr-2"></i>New Project
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="flex h-screen pt-16">
            <!-- Left Sidebar - Node Palette -->
            <div class="w-80 bg-white shadow-lg border-r overflow-y-auto">
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">
                        <i class="fas fa-puzzle-piece mr-2"></i>Node Palette
                    </h3>
                    
                    <!-- Input Nodes -->
                    <div class="mb-6">
                        <h4 class="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Input Parameters</h4>
                        <div class="space-y-2">
                            <div class="node-template bg-blue-50 border border-blue-200 rounded-lg p-3 cursor-grab" data-node-type="business_background">
                                <div class="flex items-center">
                                    <i class="fas fa-building text-blue-600 mr-2"></i>
                                    <span class="text-sm font-medium">Business Background</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1">Company info, industry, and context</p>
                            </div>
                            <div class="node-template bg-purple-50 border border-purple-200 rounded-lg p-3 cursor-grab" data-node-type="target_audience">
                                <div class="flex items-center">
                                    <i class="fas fa-users text-purple-600 mr-2"></i>
                                    <span class="text-sm font-medium">Target Audience</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1">Demographics, interests, pain points</p>
                            </div>
                            <div class="node-template bg-green-50 border border-green-200 rounded-lg p-3 cursor-grab" data-node-type="content_objectives">
                                <div class="flex items-center">
                                    <i class="fas fa-bullseye text-green-600 mr-2"></i>
                                    <span class="text-sm font-medium">Content Objectives</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1">Goals, KPIs, desired outcomes</p>
                            </div>
                            <div class="node-template bg-yellow-50 border border-yellow-200 rounded-lg p-3 cursor-grab" data-node-type="keywords">
                                <div class="flex items-center">
                                    <i class="fas fa-tags text-yellow-600 mr-2"></i>
                                    <span class="text-sm font-medium">Keywords</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1">SEO keywords, hashtags, topics</p>
                            </div>
                            <div class="node-template bg-indigo-50 border border-indigo-200 rounded-lg p-3 cursor-grab" data-node-type="content_format">
                                <div class="flex items-center">
                                    <i class="fas fa-file-alt text-indigo-600 mr-2"></i>
                                    <span class="text-sm font-medium">Content Format</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1">Blog, social, video, email, etc.</p>
                            </div>
                        </div>
                    </div>

                    <!-- Processing Nodes -->
                    <div class="mb-6">
                        <h4 class="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">AI Processing</h4>
                        <div class="space-y-2">
                            <div class="node-template bg-red-50 border border-red-200 rounded-lg p-3 cursor-grab" data-node-type="strategy_generator">
                                <div class="flex items-center">
                                    <i class="fas fa-magic text-red-600 mr-2"></i>
                                    <span class="text-sm font-medium">Strategy Generator</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1">Generate content strategies with scores</p>
                            </div>
                            <div class="node-template bg-teal-50 border border-teal-200 rounded-lg p-3 cursor-grab" data-node-type="content_generator">
                                <div class="flex items-center">
                                    <i class="fas fa-pen-fancy text-teal-600 mr-2"></i>
                                    <span class="text-sm font-medium">Content Generator</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1">Generate actual content from strategy</p>
                            </div>
                            <div class="node-template bg-orange-50 border border-orange-200 rounded-lg p-3 cursor-grab" data-node-type="content_refiner">
                                <div class="flex items-center">
                                    <i class="fas fa-edit text-orange-600 mr-2"></i>
                                    <span class="text-sm font-medium">Content Refiner</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1">Refine and optimize content</p>
                            </div>
                        </div>
                    </div>

                    <!-- Output Nodes -->
                    <div class="mb-6">
                        <h4 class="text-sm font-medium text-gray-700 mb-3 uppercase tracking-wide">Output & Media</h4>
                        <div class="space-y-2">
                            <div class="node-template bg-pink-50 border border-pink-200 rounded-lg p-3 cursor-grab" data-node-type="image_generator">
                                <div class="flex items-center">
                                    <i class="fas fa-image text-pink-600 mr-2"></i>
                                    <span class="text-sm font-medium">Image Generator</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1">AI-generated images and graphics</p>
                            </div>
                            <div class="node-template bg-cyan-50 border border-cyan-200 rounded-lg p-3 cursor-grab" data-node-type="video_editor">
                                <div class="flex items-center">
                                    <i class="fas fa-video text-cyan-600 mr-2"></i>
                                    <span class="text-sm font-medium">Video Editor</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1">Video creation and editing tools</p>
                            </div>
                            <div class="node-template bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-grab" data-node-type="export_hub">
                                <div class="flex items-center">
                                    <i class="fas fa-share-alt text-gray-600 mr-2"></i>
                                    <span class="text-sm font-medium">Export Hub</span>
                                </div>
                                <p class="text-xs text-gray-600 mt-1">Export to platforms and formats</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Workflow Canvas -->
            <div class="flex-1 flex flex-col">
                <!-- Canvas Toolbar -->
                <div class="bg-white border-b px-4 py-3">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <span class="text-sm font-medium text-gray-700">Workflow: Digital Marketing Campaign</span>
                            <div class="flex items-center space-x-2">
                                <button id="zoom-in" class="p-1 hover:bg-gray-100 rounded">
                                    <i class="fas fa-search-plus text-gray-600"></i>
                                </button>
                                <button id="zoom-out" class="p-1 hover:bg-gray-100 rounded">
                                    <i class="fas fa-search-minus text-gray-600"></i>
                                </button>
                                <button id="fit-view" class="p-1 hover:bg-gray-100 rounded">
                                    <i class="fas fa-expand-arrows-alt text-gray-600"></i>
                                </button>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <button id="run-workflow" class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                <i class="fas fa-play mr-2"></i>Run Workflow
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Canvas Area -->
                <div class="flex-1 relative bg-gray-100">
                    <div id="workflow-canvas" class="w-full h-full"></div>
                    
                    <!-- Connection Instructions -->
                    <div class="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                        <h4 class="text-sm font-semibold text-gray-800 mb-2">
                            <i class="fas fa-info-circle text-blue-500 mr-2"></i>How to Connect Nodes
                        </h4>
                        <ul class="text-xs text-gray-600 space-y-1">
                            <li>• <strong>Right-click</strong> a node to start connection mode</li>
                            <li>• <strong>Click</strong> another node to create connection</li>
                            <li>• <strong>Double-click</strong> for quick connection mode</li>
                            <li>• <strong>Click canvas</strong> to cancel connection</li>
                            <li>• <strong>Click edge</strong> to view/delete connection</li>
                        </ul>
                    </div>
                    
                    <!-- Welcome Message -->
                    <div id="welcome-message" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div class="text-center">
                            <i class="fas fa-mouse-pointer text-6xl text-gray-300 mb-4"></i>
                            <h3 class="text-xl font-semibold text-gray-600 mb-2">Build Your Content Workflow</h3>
                            <p class="text-gray-500">Drag nodes from the left palette to create your AI-powered content strategy</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Panel - Node Properties & Results -->
            <div class="w-96 bg-white shadow-lg border-l overflow-y-auto">
                <div id="properties-panel" class="h-full">
                    <!-- Default State -->
                    <div id="default-panel" class="p-6 text-center">
                        <i class="fas fa-cog text-4xl text-gray-300 mb-4"></i>
                        <h3 class="text-lg font-semibold text-gray-600 mb-2">Node Properties</h3>
                        <p class="text-gray-500">Select a node to view and edit its properties</p>
                    </div>

                    <!-- Node Configuration Panel (hidden by default) -->
                    <div id="node-config-panel" class="hidden">
                        <div class="bg-gray-50 px-6 py-4 border-b">
                            <h3 id="node-title" class="text-lg font-semibold text-gray-900"></h3>
                            <p id="node-description" class="text-sm text-gray-600 mt-1"></p>
                        </div>
                        <div id="node-config-content" class="p-6">
                            <!-- Dynamic content will be inserted here -->
                        </div>
                    </div>

                    <!-- Results Panel (hidden by default) -->
                    <div id="results-panel" class="hidden">
                        <div class="bg-green-50 px-6 py-4 border-b">
                            <h3 class="text-lg font-semibold text-green-900">
                                <i class="fas fa-chart-line mr-2"></i>Generated Strategies
                            </h3>
                        </div>
                        <div id="results-content" class="p-6">
                            <!-- Results will be inserted here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modals and overlays will be added here -->
        <div id="modal-container"></div>

        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// API Routes for AI Content Creation

// Get all projects
app.get('/api/projects', async (c) => {
  const { DB } = c.env
  
  try {
    const result = await DB.prepare(`
      SELECT p.*, COUNT(w.id) as workflow_count 
      FROM projects p 
      LEFT JOIN workflows w ON p.id = w.project_id 
      GROUP BY p.id 
      ORDER BY p.updated_at DESC
    `).all()
    
    return c.json({ projects: result.results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch projects' }, 500)
  }
})

// Create new project
app.post('/api/projects', async (c) => {
  const { DB } = c.env
  const { name, description } = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO projects (name, description) VALUES (?, ?)
    `).bind(name, description).run()
    
    return c.json({ 
      id: result.meta.last_row_id, 
      name, 
      description,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    return c.json({ error: 'Failed to create project' }, 500)
  }
})

// Save workflow
app.post('/api/workflows', async (c) => {
  const { DB } = c.env
  const { project_id, name, nodes_data, connections_data } = await c.req.json()
  
  try {
    const result = await DB.prepare(`
      INSERT INTO workflows (project_id, name, nodes_data, connections_data) 
      VALUES (?, ?, ?, ?)
    `).bind(project_id, name, JSON.stringify(nodes_data), JSON.stringify(connections_data)).run()
    
    return c.json({ 
      id: result.meta.last_row_id,
      project_id,
      name,
      nodes_data,
      connections_data,
      created_at: new Date().toISOString()
    })
  } catch (error) {
    return c.json({ error: 'Failed to save workflow' }, 500)
  }
})

// Generate content strategies using AI
app.post('/api/generate-strategies', async (c) => {
  const { AI, DB } = c.env
  const { workflow_id, parameters } = await c.req.json()
  
  try {
    // Create AI prompt for content strategy generation
    const prompt = `You are an expert content strategist. Based on the following business parameters, generate 3 diverse content strategies with detailed scoring.

Business Background: ${parameters.business_background}
Target Audience: ${parameters.target_audience}
Content Objectives: ${parameters.content_objectives}
Keywords: ${parameters.keywords}
Content Format: ${parameters.content_format}
Brand Voice: ${parameters.brand_voice}
Industry: ${parameters.industry}

For each strategy, provide:
1. Title (compelling and specific)
2. Description (2-3 sentences)
3. Content outline (structured approach)
4. Scores (0-100) for:
   - Relevance (how well it matches audience needs)
   - Likability (engagement potential)
   - Shareability (viral potential)
   - Convertibility (business impact)
5. Reasoning for the scores

Format as JSON array with this structure:
[{
  "title": "Strategy Title",
  "description": "Strategy description",
  "content_outline": {"sections": ["section1", "section2"]},
  "relevance_score": 85,
  "likability_score": 78,
  "shareable_score": 82,
  "convertibility_score": 90,
  "reasoning": "Explanation of scores"
}]`

    const response = await AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt: prompt,
      max_tokens: 2000
    })
    
    let strategies
    try {
      strategies = JSON.parse(response.response)
    } catch (parseError) {
      // Fallback if AI doesn't return valid JSON
      strategies = [{
        title: "Engaging Content Strategy",
        description: "A comprehensive approach to creating engaging content that resonates with your target audience.",
        content_outline: {"sections": ["Hook", "Problem identification", "Solution presentation", "Call to action"]},
        relevance_score: 85,
        likability_score: 80,
        shareable_score: 75,
        convertibility_score: 82,
        reasoning: "High relevance for target audience with strong conversion potential."
      }]
    }
    
    // Save strategies to database
    const savedStrategies = []
    for (const strategy of strategies) {
      const result = await DB.prepare(`
        INSERT INTO content_strategies 
        (workflow_id, title, description, content_outline, relevance_score, 
         likability_score, shareable_score, convertibility_score, ai_reasoning) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        workflow_id,
        strategy.title,
        strategy.description,
        JSON.stringify(strategy.content_outline),
        strategy.relevance_score,
        strategy.likability_score,
        strategy.shareable_score,
        strategy.convertibility_score,
        strategy.reasoning
      ).run()
      
      savedStrategies.push({
        id: result.meta.last_row_id,
        ...strategy
      })
    }
    
    return c.json({ strategies: savedStrategies })
  } catch (error) {
    return c.json({ error: 'Failed to generate strategies: ' + error.message }, 500)
  }
})

// Generate actual content from selected strategy
app.post('/api/generate-content', async (c) => {
  const { AI, DB } = c.env
  const { strategy_id, content_type } = await c.req.json()
  
  try {
    // Get strategy details
    const strategyResult = await DB.prepare(`
      SELECT cs.*, bp.* FROM content_strategies cs
      JOIN workflows w ON cs.workflow_id = w.id
      JOIN business_parameters bp ON w.id = bp.workflow_id
      WHERE cs.id = ?
    `).bind(strategy_id).first()
    
    if (!strategyResult) {
      return c.json({ error: 'Strategy not found' }, 404)
    }
    
    // Create content generation prompt
    const prompt = `Generate ${content_type} content based on this strategy:

Strategy: ${strategyResult.title}
Description: ${strategyResult.description}
Content Outline: ${strategyResult.content_outline}

Business Context:
- Background: ${strategyResult.business_background}
- Target Audience: ${strategyResult.target_audience}
- Objectives: ${strategyResult.content_objectives}
- Keywords: ${strategyResult.keywords}
- Format: ${strategyResult.content_format}
- Brand Voice: ${strategyResult.brand_voice}

Create compelling, actionable content that follows the outlined strategy. Make it engaging and conversion-focused.`

    const response = await AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt: prompt,
      max_tokens: 1000
    })
    
    // Save generated content
    const result = await DB.prepare(`
      INSERT INTO generated_content (strategy_id, content_type, content_data, metadata)
      VALUES (?, ?, ?, ?)
    `).bind(
      strategy_id,
      content_type,
      response.response,
      JSON.stringify({
        generated_at: new Date().toISOString(),
        model: 'llama-3.1-8b-instruct'
      })
    ).run()
    
    return c.json({
      id: result.meta.last_row_id,
      content: response.response,
      metadata: {
        generated_at: new Date().toISOString(),
        model: 'llama-3.1-8b-instruct'
      }
    })
  } catch (error) {
    return c.json({ error: 'Failed to generate content: ' + error.message }, 500)
  }
})

// Generate AI image for content
app.post('/api/generate-image', async (c) => {
  const { AI, DB } = c.env
  const { strategy_id, image_prompt, style = 'professional' } = await c.req.json()
  
  try {
    // Get strategy context for better image generation
    const strategyResult = await DB.prepare(`
      SELECT cs.*, bp.* FROM content_strategies cs
      JOIN workflows w ON cs.workflow_id = w.id
      JOIN business_parameters bp ON w.id = bp.workflow_id
      WHERE cs.id = ?
    `).bind(strategy_id).first()
    
    // Enhanced prompt with business context
    const enhancedPrompt = `${image_prompt}. ${style} style. Related to ${strategyResult?.business_background || 'business'} in ${strategyResult?.industry || 'technology'} industry. High quality, professional, suitable for ${strategyResult?.content_format || 'social media'}`
    
    // Use Cloudflare Workers AI for image generation
    const imageResponse = await AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', {
      prompt: enhancedPrompt,
      num_steps: 20,
      guidance_scale: 7.5
    })
    
    // Convert ArrayBuffer to base64 for storage
    const imageBuffer = imageResponse
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)))
    
    // Save image metadata to database
    const result = await DB.prepare(`
      INSERT INTO content_assets (content_id, asset_type, file_path, file_name, mime_type)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      null, // content_id can be null for standalone images
      'image',
      `data:image/png;base64,${base64Image}`,
      `generated-image-${Date.now()}.png`,
      'image/png'
    ).run()
    
    return c.json({
      id: result.meta.last_row_id,
      image_url: `data:image/png;base64,${base64Image}`,
      prompt: enhancedPrompt,
      style: style
    })
    
  } catch (error) {
    return c.json({ error: 'Failed to generate image: ' + error.message }, 500)
  }
})

// Refine existing content
app.post('/api/refine-content', async (c) => {
  const { AI, DB } = c.env
  const { content_id, refinement_instructions, content_text } = await c.req.json()
  
  try {
    const refinementPrompt = `Refine and improve this content based on the following instructions:

Original Content:
${content_text}

Refinement Instructions:
${refinement_instructions}

Please provide an improved version that:
1. Maintains the core message and intent
2. Improves readability and engagement
3. Incorporates the specific refinement requests
4. Keeps the same general length and format

Refined Content:`

    const response = await AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt: refinementPrompt,
      max_tokens: 1000
    })
    
    // Update content in database
    await DB.prepare(`
      UPDATE generated_content 
      SET content_data = ?, version = version + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(response.response, content_id).run()
    
    return c.json({
      refined_content: response.response,
      refinement_applied: refinement_instructions
    })
    
  } catch (error) {
    return c.json({ error: 'Failed to refine content: ' + error.message }, 500)
  }
})

// Export content in various formats
app.post('/api/export-content', async (c) => {
  const { content_id, export_format, platform_settings } = await c.req.json()
  const { DB } = c.env
  
  try {
    // Get content details
    const contentResult = await DB.prepare(`
      SELECT gc.*, cs.title as strategy_title 
      FROM generated_content gc
      LEFT JOIN content_strategies cs ON gc.strategy_id = cs.id
      WHERE gc.id = ?
    `).bind(content_id).first()
    
    if (!contentResult) {
      return c.json({ error: 'Content not found' }, 404)
    }
    
    let exportedContent = contentResult.content_data
    let metadata = {
      original_length: exportedContent.length,
      export_format: export_format,
      exported_at: new Date().toISOString()
    }
    
    // Platform-specific formatting
    switch (export_format) {
      case 'linkedin':
        // LinkedIn optimization
        if (exportedContent.length > 3000) {
          exportedContent = exportedContent.substring(0, 2950) + '...'
        }
        metadata.character_count = exportedContent.length
        metadata.platform = 'LinkedIn'
        break
        
      case 'twitter':
        // Twitter thread handling
        if (exportedContent.length > 280) {
          const chunks = []
          let currentChunk = ''
          const sentences = exportedContent.split('. ')
          
          for (let sentence of sentences) {
            if ((currentChunk + sentence).length <= 250) {
              currentChunk += (currentChunk ? '. ' : '') + sentence
            } else {
              if (currentChunk) chunks.push(currentChunk)
              currentChunk = sentence
            }
          }
          if (currentChunk) chunks.push(currentChunk)
          
          exportedContent = chunks.map((chunk, i) => `${i + 1}/${chunks.length} ${chunk}`).join('\n\n---\n\n')
          metadata.thread_count = chunks.length
        }
        metadata.platform = 'Twitter'
        break
        
      case 'instagram':
        // Instagram caption with hashtags
        exportedContent += '\n\n' + (platform_settings?.hashtags || '#business #content #ai #marketing')
        metadata.platform = 'Instagram'
        break
        
      case 'blog':
        // Blog post formatting with title and sections
        exportedContent = `# ${contentResult.strategy_title || 'Blog Post'}\n\n${exportedContent}`
        metadata.platform = 'Blog/Website'
        break
        
      case 'email':
        // Email format with subject line
        const subject = platform_settings?.subject || `${contentResult.strategy_title || 'Newsletter'}`
        exportedContent = `Subject: ${subject}\n\n${exportedContent}`
        metadata.platform = 'Email'
        break
    }
    
    return c.json({
      exported_content: exportedContent,
      metadata: metadata,
      download_filename: `content-${export_format}-${Date.now()}.txt`
    })
    
  } catch (error) {
    return c.json({ error: 'Failed to export content: ' + error.message }, 500)
  }
})

// Get workflow with all related data
app.get('/api/workflows/:id', async (c) => {
  const { DB } = c.env
  const workflowId = c.req.param('id')
  
  try {
    const workflow = await DB.prepare(`
      SELECT * FROM workflows WHERE id = ?
    `).bind(workflowId).first()
    
    const parameters = await DB.prepare(`
      SELECT * FROM business_parameters WHERE workflow_id = ?
    `).bind(workflowId).first()
    
    const strategies = await DB.prepare(`
      SELECT * FROM content_strategies WHERE workflow_id = ? ORDER BY created_at DESC
    `).bind(workflowId).all()
    
    return c.json({
      workflow,
      parameters,
      strategies: strategies.results
    })
  } catch (error) {
    return c.json({ error: 'Failed to fetch workflow data' }, 500)
  }
})

export default app
