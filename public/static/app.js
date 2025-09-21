// AI Content Creator - Node-Based Workflow Interface

class ContentWorkflowApp {
  constructor() {
    this.cy = null;
    this.currentProject = { id: 1, name: 'Digital Marketing Campaign' };
    this.currentWorkflow = { id: null, nodes: [], edges: [] };
    this.nodeCounter = 0;
    this.selectedNode = null;
    
    this.init();
  }

  async init() {
    await this.initCytoscape();
    this.initEventListeners();
    this.loadProjects();
    this.showWelcomeMessage();
  }

  async initCytoscape() {
    // Initialize Cytoscape for node-based workflow
    this.cy = cytoscape({
      container: document.getElementById('workflow-canvas'),
      
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(bg)',
            'label': 'data(label)',
            'width': 120,
            'height': 80,
            'shape': 'roundrectangle',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': 11,
            'font-weight': 'bold',
            'color': 'data(textColor)',
            'border-width': 2,
            'border-color': 'data(borderColor)',
            'text-wrap': 'wrap',
            'text-max-width': 100
          }
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': '#3b82f6',
            'border-width': 3,
            'box-shadow': '0 0 10px rgba(59, 130, 246, 0.5)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#6b7280',
            'target-arrow-color': '#6b7280',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 1.2
          }
        },
        {
          selector: 'edge:selected',
          style: {
            'line-color': '#ef4444',
            'target-arrow-color': '#ef4444',
            'width': 4
          }
        }
      ],

      layout: {
        name: 'preset'
      },

      // Interaction options
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true
    });

    // Node click handler
    this.cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      this.selectNode(node);
    });

    // Canvas click handler (deselect)
    this.cy.on('tap', (evt) => {
      if (evt.target === this.cy) {
        this.deselectNode();
      }
    });

    // Edge creation on node connection
    this.cy.on('cxttap', 'node', (evt) => {
      const node = evt.target;
      this.startConnection(node);
    });
  }

  initEventListeners() {
    // Node palette drag and drop
    this.initDragAndDrop();
    
    // Toolbar buttons
    document.getElementById('save-workflow')?.addEventListener('click', () => {
      this.saveWorkflow();
    });

    document.getElementById('new-project')?.addEventListener('click', () => {
      this.showNewProjectModal();
    });

    document.getElementById('run-workflow')?.addEventListener('click', () => {
      this.runWorkflow();
    });

    // Canvas controls
    document.getElementById('zoom-in')?.addEventListener('click', () => {
      this.cy.zoom(this.cy.zoom() * 1.2);
    });

    document.getElementById('zoom-out')?.addEventListener('click', () => {
      this.cy.zoom(this.cy.zoom() * 0.8);
    });

    document.getElementById('fit-view')?.addEventListener('click', () => {
      this.cy.fit();
    });
  }

  initDragAndDrop() {
    const canvas = document.getElementById('workflow-canvas');
    const templates = document.querySelectorAll('.node-template');

    templates.forEach(template => {
      template.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', template.dataset.nodeType);
        template.classList.add('dragging');
      });

      template.addEventListener('dragend', () => {
        template.classList.remove('dragging');
      });
    });

    canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      canvas.classList.add('drop-zone-active');
    });

    canvas.addEventListener('dragleave', () => {
      canvas.classList.remove('drop-zone-active');
    });

    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      canvas.classList.remove('drop-zone-active');
      
      const nodeType = e.dataTransfer.getData('text/plain');
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      this.addNode(nodeType, { x, y });
      this.hideWelcomeMessage();
    });
  }

  addNode(type, position) {
    const nodeId = `node-${++this.nodeCounter}`;
    const nodeConfig = this.getNodeConfig(type);
    
    // Convert screen coordinates to Cytoscape coordinates
    const cyPosition = {
      x: position.x - this.cy.width() / 2,
      y: position.y - this.cy.height() / 2
    };

    this.cy.add({
      group: 'nodes',
      data: {
        id: nodeId,
        label: nodeConfig.label,
        type: type,
        bg: nodeConfig.bg,
        textColor: nodeConfig.textColor,
        borderColor: nodeConfig.borderColor,
        config: {}
      },
      position: cyPosition
    });

    // Auto-select the new node
    const newNode = this.cy.getElementById(nodeId);
    this.selectNode(newNode);
    
    this.showToast('Node added successfully', 'success');
  }

  getNodeConfig(type) {
    const configs = {
      business_background: {
        label: 'Business Background',
        bg: '#dbeafe',
        textColor: '#1e40af',
        borderColor: '#3b82f6'
      },
      target_audience: {
        label: 'Target Audience',
        bg: '#f3e8ff',
        textColor: '#7c3aed',
        borderColor: '#8b5cf6'
      },
      content_objectives: {
        label: 'Content Objectives',
        bg: '#d1fae5',
        textColor: '#065f46',
        borderColor: '#10b981'
      },
      keywords: {
        label: 'Keywords',
        bg: '#fef3c7',
        textColor: '#92400e',
        borderColor: '#f59e0b'
      },
      content_format: {
        label: 'Content Format',
        bg: '#e0e7ff',
        textColor: '#3730a3',
        borderColor: '#6366f1'
      },
      strategy_generator: {
        label: 'Strategy Generator',
        bg: '#fee2e2',
        textColor: '#991b1b',
        borderColor: '#ef4444'
      },
      content_generator: {
        label: 'Content Generator',
        bg: '#ccfbf1',
        textColor: '#115e59',
        borderColor: '#14b8a6'
      },
      content_refiner: {
        label: 'Content Refiner',
        bg: '#fed7aa',
        textColor: '#9a3412',
        borderColor: '#f97316'
      },
      image_generator: {
        label: 'Image Generator',
        bg: '#fce7f3',
        textColor: '#be185d',
        borderColor: '#ec4899'
      },
      video_editor: {
        label: 'Video Editor',
        bg: '#cffafe',
        textColor: '#155e75',
        borderColor: '#06b6d4'
      },
      export_hub: {
        label: 'Export Hub',
        bg: '#f3f4f6',
        textColor: '#374151',
        borderColor: '#6b7280'
      }
    };

    return configs[type] || {
      label: 'Unknown Node',
      bg: '#f9fafb',
      textColor: '#111827',
      borderColor: '#d1d5db'
    };
  }

  selectNode(node) {
    this.selectedNode = node;
    this.cy.nodes().removeClass('selected');
    node.addClass('selected');
    this.showNodeProperties(node);
  }

  deselectNode() {
    this.selectedNode = null;
    this.cy.nodes().removeClass('selected');
    this.hideNodeProperties();
  }

  showNodeProperties(node) {
    const defaultPanel = document.getElementById('default-panel');
    const configPanel = document.getElementById('node-config-panel');
    
    defaultPanel.classList.add('hidden');
    configPanel.classList.remove('hidden');
    
    const type = node.data('type');
    const title = document.getElementById('node-title');
    const description = document.getElementById('node-description');
    const content = document.getElementById('node-config-content');
    
    title.textContent = node.data('label');
    description.textContent = this.getNodeDescription(type);
    
    // Generate configuration form based on node type
    content.innerHTML = this.generateNodeConfigForm(type, node.data('config'));
    
    // Add event listeners for form inputs
    this.setupNodeConfigListeners(node);
  }

  hideNodeProperties() {
    const defaultPanel = document.getElementById('default-panel');
    const configPanel = document.getElementById('node-config-panel');
    
    configPanel.classList.add('hidden');
    defaultPanel.classList.remove('hidden');
  }

  getNodeDescription(type) {
    const descriptions = {
      business_background: 'Define your company, industry, and business context',
      target_audience: 'Specify demographics, interests, and pain points of your audience',
      content_objectives: 'Set clear goals and KPIs for your content strategy',
      keywords: 'Add relevant keywords, hashtags, and topics',
      content_format: 'Choose the type and format of content to create',
      strategy_generator: 'Generate multiple content strategies with AI scoring',
      content_generator: 'Create actual content based on selected strategy',
      content_refiner: 'Refine and optimize generated content',
      image_generator: 'Generate AI images and graphics',
      video_editor: 'Create and edit video content',
      export_hub: 'Export content to various platforms and formats'
    };
    
    return descriptions[type] || 'Configure this node parameters';
  }

  generateNodeConfigForm(type, config) {
    const inputTypes = {
      business_background: `
        <div class="input-group">
          <label class="input-label">Company Name</label>
          <input type="text" class="input-field" name="company_name" value="${config.company_name || ''}" placeholder="Your company name">
        </div>
        <div class="input-group">
          <label class="input-label">Industry</label>
          <select class="input-field" name="industry">
            <option value="">Select industry</option>
            <option value="technology" ${config.industry === 'technology' ? 'selected' : ''}>Technology</option>
            <option value="healthcare" ${config.industry === 'healthcare' ? 'selected' : ''}>Healthcare</option>
            <option value="finance" ${config.industry === 'finance' ? 'selected' : ''}>Finance</option>
            <option value="education" ${config.industry === 'education' ? 'selected' : ''}>Education</option>
            <option value="retail" ${config.industry === 'retail' ? 'selected' : ''}>Retail</option>
            <option value="other" ${config.industry === 'other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Business Description</label>
          <textarea class="input-field textarea-field" name="description" placeholder="Describe what your business does...">${config.description || ''}</textarea>
        </div>
      `,
      target_audience: `
        <div class="input-group">
          <label class="input-label">Age Range</label>
          <select class="input-field" name="age_range">
            <option value="">Select age range</option>
            <option value="18-24" ${config.age_range === '18-24' ? 'selected' : ''}>18-24</option>
            <option value="25-34" ${config.age_range === '25-34' ? 'selected' : ''}>25-34</option>
            <option value="35-44" ${config.age_range === '35-44' ? 'selected' : ''}>35-44</option>
            <option value="45-54" ${config.age_range === '45-54' ? 'selected' : ''}>45-54</option>
            <option value="55+" ${config.age_range === '55+' ? 'selected' : ''}>55+</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Interests</label>
          <input type="text" class="input-field" name="interests" value="${config.interests || ''}" placeholder="Technology, sports, travel...">
        </div>
        <div class="input-group">
          <label class="input-label">Pain Points</label>
          <textarea class="input-field textarea-field" name="pain_points" placeholder="What problems does your audience face?">${config.pain_points || ''}</textarea>
        </div>
      `,
      content_objectives: `
        <div class="input-group">
          <label class="input-label">Primary Goal</label>
          <select class="input-field" name="primary_goal">
            <option value="">Select primary goal</option>
            <option value="awareness" ${config.primary_goal === 'awareness' ? 'selected' : ''}>Brand Awareness</option>
            <option value="leads" ${config.primary_goal === 'leads' ? 'selected' : ''}>Lead Generation</option>
            <option value="sales" ${config.primary_goal === 'sales' ? 'selected' : ''}>Sales Conversion</option>
            <option value="engagement" ${config.primary_goal === 'engagement' ? 'selected' : ''}>Engagement</option>
            <option value="education" ${config.primary_goal === 'education' ? 'selected' : ''}>Education</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Success Metrics</label>
          <input type="text" class="input-field" name="metrics" value="${config.metrics || ''}" placeholder="Views, clicks, conversions...">
        </div>
        <div class="input-group">
          <label class="input-label">Call to Action</label>
          <input type="text" class="input-field" name="cta" value="${config.cta || ''}" placeholder="Sign up, Learn more, Buy now...">
        </div>
      `,
      keywords: `
        <div class="input-group">
          <label class="input-label">Primary Keywords</label>
          <input type="text" class="input-field" name="primary_keywords" value="${config.primary_keywords || ''}" placeholder="keyword1, keyword2, keyword3">
        </div>
        <div class="input-group">
          <label class="input-label">Hashtags</label>
          <input type="text" class="input-field" name="hashtags" value="${config.hashtags || ''}" placeholder="#hashtag1 #hashtag2 #hashtag3">
        </div>
        <div class="input-group">
          <label class="input-label">Topic Categories</label>
          <input type="text" class="input-field" name="categories" value="${config.categories || ''}" placeholder="Category1, Category2, Category3">
        </div>
      `,
      content_format: `
        <div class="input-group">
          <label class="input-label">Content Type</label>
          <select class="input-field" name="content_type">
            <option value="">Select content type</option>
            <option value="blog_post" ${config.content_type === 'blog_post' ? 'selected' : ''}>Blog Post</option>
            <option value="social_media" ${config.content_type === 'social_media' ? 'selected' : ''}>Social Media</option>
            <option value="email" ${config.content_type === 'email' ? 'selected' : ''}>Email</option>
            <option value="video_script" ${config.content_type === 'video_script' ? 'selected' : ''}>Video Script</option>
            <option value="infographic" ${config.content_type === 'infographic' ? 'selected' : ''}>Infographic</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Platform</label>
          <select class="input-field" name="platform">
            <option value="">Select platform</option>
            <option value="linkedin" ${config.platform === 'linkedin' ? 'selected' : ''}>LinkedIn</option>
            <option value="twitter" ${config.platform === 'twitter' ? 'selected' : ''}>Twitter</option>
            <option value="facebook" ${config.platform === 'facebook' ? 'selected' : ''}>Facebook</option>
            <option value="instagram" ${config.platform === 'instagram' ? 'selected' : ''}>Instagram</option>
            <option value="youtube" ${config.platform === 'youtube' ? 'selected' : ''}>YouTube</option>
            <option value="website" ${config.platform === 'website' ? 'selected' : ''}>Website</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Content Length</label>
          <select class="input-field" name="length">
            <option value="">Select length</option>
            <option value="short" ${config.length === 'short' ? 'selected' : ''}>Short (< 300 words)</option>
            <option value="medium" ${config.length === 'medium' ? 'selected' : ''}>Medium (300-800 words)</option>
            <option value="long" ${config.length === 'long' ? 'selected' : ''}>Long (800+ words)</option>
          </select>
        </div>
      `,
      image_generator: `
        <div class="input-group">
          <label class="input-label">Image Style</label>
          <select class="input-field" name="image_style">
            <option value="">Select style</option>
            <option value="professional" ${config.image_style === 'professional' ? 'selected' : ''}>Professional</option>
            <option value="creative" ${config.image_style === 'creative' ? 'selected' : ''}>Creative</option>
            <option value="minimalist" ${config.image_style === 'minimalist' ? 'selected' : ''}>Minimalist</option>
            <option value="colorful" ${config.image_style === 'colorful' ? 'selected' : ''}>Colorful</option>
            <option value="corporate" ${config.image_style === 'corporate' ? 'selected' : ''}>Corporate</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">Image Description</label>
          <textarea class="input-field textarea-field" name="image_prompt" placeholder="Describe the image you want to generate...">${config.image_prompt || ''}</textarea>
        </div>
        <div class="input-group">
          <label class="input-label">Dimensions</label>
          <select class="input-field" name="dimensions">
            <option value="square" ${config.dimensions === 'square' ? 'selected' : ''}>Square (1:1)</option>
            <option value="landscape" ${config.dimensions === 'landscape' ? 'selected' : ''}>Landscape (16:9)</option>
            <option value="portrait" ${config.dimensions === 'portrait' ? 'selected' : ''}>Portrait (9:16)</option>
          </select>
        </div>
        <div class="mt-4">
          <button type="button" class="btn btn-success w-full" onclick="app.generateImageFromNode()">
            <i class="fas fa-image mr-2"></i>Generate Image Now
          </button>
        </div>
      `
    };

    const formHtml = inputTypes[type] || `
      <div class="input-group">
        <label class="input-label">Configuration</label>
        <textarea class="input-field textarea-field" name="config" placeholder="Enter configuration details...">${JSON.stringify(config, null, 2)}</textarea>
      </div>
    `;

    return formHtml + `
      <div class="mt-4">
        <button type="button" class="btn btn-primary w-full" onclick="app.updateNodeConfig()">
          <i class="fas fa-check mr-2"></i>Update Configuration
        </button>
      </div>
    `;
  }

  setupNodeConfigListeners(node) {
    // Auto-save on input changes
    const inputs = document.querySelectorAll('#node-config-content input, #node-config-content select, #node-config-content textarea');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        this.updateNodeConfigFromForm(node);
      });
    });
  }

  updateNodeConfig() {
    if (!this.selectedNode) return;
    
    this.updateNodeConfigFromForm(this.selectedNode);
    this.showToast('Node configuration updated', 'success');
  }

  updateNodeConfigFromForm(node) {
    const form = document.getElementById('node-config-content');
    const inputs = form.querySelectorAll('input, select, textarea');
    const config = {};
    
    inputs.forEach(input => {
      if (input.name) {
        config[input.name] = input.value;
      }
    });
    
    node.data('config', config);
  }

  async runWorkflow() {
    const button = document.getElementById('run-workflow');
    button.classList.add('loading');
    button.disabled = true;
    
    try {
      // Collect all node configurations
      const nodes = this.cy.nodes().map(node => ({
        id: node.id(),
        type: node.data('type'),
        config: node.data('config') || {}
      }));
      
      // Check if we have required input nodes
      const hasBusinessBackground = nodes.some(n => n.type === 'business_background');
      const hasTargetAudience = nodes.some(n => n.type === 'target_audience');
      const hasStrategyGenerator = nodes.some(n => n.type === 'strategy_generator');
      
      if (!hasBusinessBackground || !hasTargetAudience) {
        this.showToast('Please add Business Background and Target Audience nodes', 'error');
        return;
      }
      
      if (!hasStrategyGenerator) {
        this.showToast('Please add a Strategy Generator node to create content strategies', 'warning');
        return;
      }
      
      // Prepare parameters for AI generation
      const businessNode = nodes.find(n => n.type === 'business_background');
      const audienceNode = nodes.find(n => n.type === 'target_audience');
      const objectivesNode = nodes.find(n => n.type === 'content_objectives');
      const keywordsNode = nodes.find(n => n.type === 'keywords');
      const formatNode = nodes.find(n => n.type === 'content_format');
      
      const parameters = {
        business_background: this.formatBusinessBackground(businessNode?.config || {}),
        target_audience: this.formatTargetAudience(audienceNode?.config || {}),
        content_objectives: this.formatContentObjectives(objectivesNode?.config || {}),
        keywords: keywordsNode?.config?.primary_keywords || '',
        content_format: formatNode?.config?.content_type || 'social_media',
        brand_voice: 'Professional yet approachable',
        industry: businessNode?.config?.industry || ''
      };
      
      // Generate strategies
      const response = await axios.post('/api/generate-strategies', {
        workflow_id: 1, // Default workflow for demo
        parameters: parameters
      });
      
      this.displayGeneratedStrategies(response.data.strategies);
      this.showToast('Content strategies generated successfully!', 'success');
      
    } catch (error) {
      console.error('Workflow execution error:', error);
      this.showToast('Failed to generate strategies: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  formatBusinessBackground(config) {
    return `${config.company_name || 'Company'} - ${config.description || 'Business description not provided'}. Industry: ${config.industry || 'Not specified'}.`;
  }

  formatTargetAudience(config) {
    return `Age: ${config.age_range || 'All ages'}, Interests: ${config.interests || 'Various'}, Pain Points: ${config.pain_points || 'Not specified'}`;
  }

  formatContentObjectives(config) {
    return `Primary Goal: ${config.primary_goal || 'Engagement'}, Metrics: ${config.metrics || 'Not specified'}, CTA: ${config.cta || 'Learn more'}`;
  }

  displayGeneratedStrategies(strategies) {
    const defaultPanel = document.getElementById('default-panel');
    const configPanel = document.getElementById('node-config-panel');
    const resultsPanel = document.getElementById('results-panel');
    const resultsContent = document.getElementById('results-content');
    
    // Hide other panels and show results
    defaultPanel.classList.add('hidden');
    configPanel.classList.add('hidden');
    resultsPanel.classList.remove('hidden');
    
    // Generate strategies HTML
    const strategiesHtml = strategies.map((strategy, index) => `
      <div class="strategy-card bg-white rounded-lg p-4 mb-4 cursor-pointer" data-strategy-id="${strategy.id}">
        <div class="flex justify-between items-start mb-3">
          <h4 class="font-semibold text-gray-900">${strategy.title}</h4>
          <div class="flex items-center text-sm text-gray-500">
            <i class="fas fa-star text-yellow-400 mr-1"></i>
            <span>${((strategy.relevance_score + strategy.likability_score + strategy.shareable_score + strategy.convertibility_score) / 4).toFixed(1)}</span>
          </div>
        </div>
        
        <p class="text-sm text-gray-600 mb-4">${strategy.description}</p>
        
        <!-- Scoring -->
        <div class="space-y-2 mb-4">
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium text-gray-700">Relevance</span>
            <span class="text-xs font-bold text-blue-600">${strategy.relevance_score}%</span>
          </div>
          <div class="score-bar">
            <div class="score-fill relevance" style="width: ${strategy.relevance_score}%"></div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium text-gray-700">Likability</span>
            <span class="text-xs font-bold text-green-600">${strategy.likability_score}%</span>
          </div>
          <div class="score-bar">
            <div class="score-fill likability" style="width: ${strategy.likability_score}%"></div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium text-gray-700">Shareability</span>
            <span class="text-xs font-bold text-orange-600">${strategy.shareable_score}%</span>
          </div>
          <div class="score-bar">
            <div class="score-fill shareability" style="width: ${strategy.shareable_score}%"></div>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-xs font-medium text-gray-700">Convertibility</span>
            <span class="text-xs font-bold text-red-600">${strategy.convertibility_score}%</span>
          </div>
          <div class="score-bar">
            <div class="score-fill convertibility" style="width: ${strategy.convertibility_score}%"></div>
          </div>
        </div>
        
        <!-- Reasoning -->
        <div class="bg-gray-50 rounded p-3 mb-4">
          <p class="text-xs text-gray-600">${strategy.reasoning || strategy.ai_reasoning}</p>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex space-x-2">
          <button class="btn btn-primary flex-1 text-sm" onclick="app.generateContent(${strategy.id})">
            <i class="fas fa-pen mr-1"></i>Generate Content
          </button>
          <button class="btn btn-secondary text-sm" onclick="app.selectStrategy(${strategy.id})">
            <i class="fas fa-check mr-1"></i>Select
          </button>
        </div>
      </div>
    `).join('');
    
    resultsContent.innerHTML = strategiesHtml;
    
    // Add click handlers for strategy cards
    document.querySelectorAll('.strategy-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          document.querySelectorAll('.strategy-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
        }
      });
    });
  }

  async generateContent(strategyId) {
    try {
      const response = await axios.post('/api/generate-content', {
        strategy_id: strategyId,
        content_type: 'text'
      });
      
      this.showContentModal(response.data.content);
    } catch (error) {
      this.showToast('Failed to generate content: ' + (error.response?.data?.error || error.message), 'error');
    }
  }

  selectStrategy(strategyId) {
    // Mark strategy as selected and proceed to content generation
    this.showToast('Strategy selected! Ready for content generation.', 'success');
    
    // Auto-generate content for selected strategy
    this.generateContent(strategyId);
  }

  showContentModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-hidden">
        <div class="flex items-center justify-between p-6 border-b">
          <h3 class="text-xl font-semibold text-gray-900">
            <i class="fas fa-file-alt mr-2"></i>Generated Content
          </h3>
          <button onclick="app.closeModal(this)" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto" style="max-height: 70vh;">
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <pre class="whitespace-pre-wrap text-sm text-gray-800 font-mono">${content}</pre>
          </div>
          
          <div class="flex space-x-3">
            <button class="btn btn-primary" onclick="app.copyContent('${content.replace(/'/g, "\\'")}')">
              <i class="fas fa-copy mr-2"></i>Copy Content
            </button>
            <button class="btn btn-secondary" onclick="app.refineContent('${content.replace(/'/g, "\\'")}')">
              <i class="fas fa-edit mr-2"></i>Refine Content
            </button>
            <button class="btn btn-success" onclick="app.exportContent('${content.replace(/'/g, "\\'")}')">
              <i class="fas fa-download mr-2"></i>Export
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
  }

  closeModal(button) {
    const modal = button.closest('.modal-overlay');
    modal.remove();
  }

  copyContent(content) {
    navigator.clipboard.writeText(content).then(() => {
      this.showToast('Content copied to clipboard!', 'success');
    }).catch(() => {
      this.showToast('Failed to copy content', 'error');
    });
  }

  refineContent(content) {
    this.showRefinementModal(content);
  }

  exportContent(content) {
    this.showExportModal(content);
  }

  showRefinementModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div class="flex items-center justify-between p-6 border-b">
          <h3 class="text-xl font-semibold text-gray-900">
            <i class="fas fa-edit mr-2"></i>Refine Content
          </h3>
          <button onclick="app.closeModal(this)" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="p-6">
          <div class="input-group mb-4">
            <label class="input-label">Refinement Instructions</label>
            <textarea id="refinement-instructions" class="input-field textarea-field" rows="3" placeholder="e.g., Make it more professional, add more call-to-actions, shorten the content..."></textarea>
          </div>
          
          <div class="input-group mb-6">
            <label class="input-label">Current Content</label>
            <textarea id="original-content" class="input-field textarea-field" rows="8" readonly>${content}</textarea>
          </div>
          
          <div class="flex space-x-3">
            <button class="btn btn-primary flex-1" onclick="app.processRefinement('${content.replace(/'/g, "\\'")}')">
              <i class="fas fa-magic mr-2"></i>Refine Content
            </button>
            <button class="btn btn-secondary" onclick="app.closeModal(this)">
              <i class="fas fa-times mr-2"></i>Cancel
            </button>
          </div>
          
          <div id="refined-result" class="hidden mt-6">
            <label class="input-label">Refined Content</label>
            <textarea id="refined-content" class="input-field textarea-field" rows="8" readonly></textarea>
            <div class="flex space-x-2 mt-3">
              <button class="btn btn-success" onclick="app.copyRefinedContent()">
                <i class="fas fa-copy mr-2"></i>Copy Refined
              </button>
              <button class="btn btn-primary" onclick="app.exportRefinedContent()">
                <i class="fas fa-download mr-2"></i>Export
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
  }

  async processRefinement(originalContent) {
    const instructions = document.getElementById('refinement-instructions').value.trim();
    
    if (!instructions) {
      this.showToast('Please enter refinement instructions', 'error');
      return;
    }
    
    const button = event.target;
    button.classList.add('loading');
    button.disabled = true;
    
    try {
      const response = await axios.post('/api/refine-content', {
        content_id: 1, // Default for demo
        refinement_instructions: instructions,
        content_text: originalContent
      });
      
      const resultDiv = document.getElementById('refined-result');
      const refinedTextarea = document.getElementById('refined-content');
      
      refinedTextarea.value = response.data.refined_content;
      resultDiv.classList.remove('hidden');
      
      this.showToast('Content refined successfully!', 'success');
      
    } catch (error) {
      this.showToast('Failed to refine content: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  copyRefinedContent() {
    const refinedContent = document.getElementById('refined-content').value;
    navigator.clipboard.writeText(refinedContent).then(() => {
      this.showToast('Refined content copied to clipboard!', 'success');
    }).catch(() => {
      this.showToast('Failed to copy refined content', 'error');
    });
  }

  exportRefinedContent() {
    const refinedContent = document.getElementById('refined-content').value;
    this.showExportModal(refinedContent);
  }

  showExportModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div class="flex items-center justify-between p-6 border-b">
          <h3 class="text-xl font-semibold text-gray-900">
            <i class="fas fa-download mr-2"></i>Export Content
          </h3>
          <button onclick="app.closeModal(this)" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="p-6">
          <div class="input-group mb-4">
            <label class="input-label">Export Platform</label>
            <select id="export-platform" class="input-field" onchange="app.updateExportSettings()">
              <option value="">Select platform</option>
              <option value="linkedin">LinkedIn Post</option>
              <option value="twitter">Twitter Thread</option>
              <option value="instagram">Instagram Caption</option>
              <option value="facebook">Facebook Post</option>
              <option value="blog">Blog Post</option>
              <option value="email">Email Newsletter</option>
              <option value="txt">Plain Text File</option>
              <option value="pdf">PDF Document</option>
            </select>
          </div>
          
          <div id="platform-settings" class="hidden mb-4">
            <!-- Dynamic platform settings will be inserted here -->
          </div>
          
          <div class="input-group mb-6">
            <label class="input-label">Content Preview</label>
            <textarea id="export-preview" class="input-field textarea-field" rows="6" readonly>${content}</textarea>
          </div>
          
          <div class="flex space-x-3">
            <button class="btn btn-primary flex-1" onclick="app.processExport('${content.replace(/'/g, "\\'")}')">
              <i class="fas fa-download mr-2"></i>Export Content
            </button>
            <button class="btn btn-success" onclick="app.generateImage('${content.replace(/'/g, "\\'")}')">
              <i class="fas fa-image mr-2"></i>Generate Image
            </button>
            <button class="btn btn-secondary" onclick="app.closeModal(this)">
              <i class="fas fa-times mr-2"></i>Cancel
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
  }

  updateExportSettings() {
    const platform = document.getElementById('export-platform').value;
    const settingsDiv = document.getElementById('platform-settings');
    
    let settingsHtml = '';
    
    switch (platform) {
      case 'linkedin':
        settingsHtml = `
          <label class="input-label">LinkedIn Settings</label>
          <div class="bg-blue-50 p-3 rounded">
            <p class="text-sm text-blue-700">✓ Optimized for LinkedIn's 3000 character limit</p>
            <p class="text-sm text-blue-700">✓ Professional formatting applied</p>
          </div>
        `;
        break;
        
      case 'twitter':
        settingsHtml = `
          <label class="input-label">Twitter Settings</label>
          <div class="bg-blue-50 p-3 rounded">
            <p class="text-sm text-blue-700">✓ Automatically split into thread if needed</p>
            <p class="text-sm text-blue-700">✓ 280 character limit per tweet</p>
          </div>
        `;
        break;
        
      case 'instagram':
        settingsHtml = `
          <label class="input-label">Instagram Settings</label>
          <input type="text" id="instagram-hashtags" class="input-field mt-2" placeholder="Custom hashtags (optional)" value="#business #content #ai #marketing">
          <div class="bg-pink-50 p-3 rounded mt-2">
            <p class="text-sm text-pink-700">✓ Hashtags will be added automatically</p>
            <p class="text-sm text-pink-700">✓ Caption optimized for engagement</p>
          </div>
        `;
        break;
        
      case 'email':
        settingsHtml = `
          <label class="input-label">Email Settings</label>
          <input type="text" id="email-subject" class="input-field mt-2" placeholder="Email subject line">
          <div class="bg-green-50 p-3 rounded mt-2">
            <p class="text-sm text-green-700">✓ Subject line will be added</p>
            <p class="text-sm text-green-700">✓ Email formatting applied</p>
          </div>
        `;
        break;
        
      case 'blog':
        settingsHtml = `
          <label class="input-label">Blog Settings</label>
          <div class="bg-purple-50 p-3 rounded">
            <p class="text-sm text-purple-700">✓ Title and sections formatting</p>
            <p class="text-sm text-purple-700">✓ SEO-friendly structure</p>
          </div>
        `;
        break;
    }
    
    if (settingsHtml) {
      settingsDiv.innerHTML = settingsHtml;
      settingsDiv.classList.remove('hidden');
    } else {
      settingsDiv.classList.add('hidden');
    }
  }

  async processExport(content) {
    const platform = document.getElementById('export-platform').value;
    
    if (!platform) {
      this.showToast('Please select an export platform', 'error');
      return;
    }
    
    const button = event.target;
    button.classList.add('loading');
    button.disabled = true;
    
    try {
      let platformSettings = {};
      
      // Collect platform-specific settings
      if (platform === 'instagram') {
        const hashtags = document.getElementById('instagram-hashtags')?.value;
        if (hashtags) platformSettings.hashtags = hashtags;
      } else if (platform === 'email') {
        const subject = document.getElementById('email-subject')?.value;
        if (subject) platformSettings.subject = subject;
      }
      
      const response = await axios.post('/api/export-content', {
        content_id: 1, // Default for demo
        export_format: platform,
        platform_settings: platformSettings
      });
      
      // Create download
      if (platform === 'pdf') {
        this.generatePDF(response.data.exported_content, response.data.download_filename);
      } else {
        this.downloadText(response.data.exported_content, response.data.download_filename);
      }
      
      this.showToast(`Content exported for ${response.data.metadata.platform}!`, 'success');
      
    } catch (error) {
      this.showToast('Failed to export content: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  async generateImage(content) {
    const button = event.target;
    button.classList.add('loading');
    button.disabled = true;
    
    // Show image prompt modal
    const promptModal = document.createElement('div');
    promptModal.className = 'modal-overlay';
    promptModal.innerHTML = `
      <div class="modal-content bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            <i class="fas fa-image mr-2"></i>Generate AI Image
          </h3>
          
          <div class="input-group mb-4">
            <label class="input-label">Image Description</label>
            <textarea id="image-prompt" class="input-field textarea-field" rows="3" placeholder="Describe the image you want to generate..."></textarea>
          </div>
          
          <div class="input-group mb-4">
            <label class="input-label">Style</label>
            <select id="image-style" class="input-field">
              <option value="professional">Professional</option>
              <option value="creative">Creative</option>
              <option value="minimalist">Minimalist</option>
              <option value="colorful">Colorful</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>
          
          <div class="flex space-x-3">
            <button class="btn btn-primary flex-1" onclick="app.processImageGeneration()">
              <i class="fas fa-magic mr-2"></i>Generate Image
            </button>
            <button class="btn btn-secondary" onclick="app.closeModal(this)">
              <i class="fas fa-times mr-2"></i>Cancel
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(promptModal);
    
    button.classList.remove('loading');
    button.disabled = false;
  }

  async processImageGeneration() {
    const imagePrompt = document.getElementById('image-prompt').value.trim();
    const imageStyle = document.getElementById('image-style').value;
    
    if (!imagePrompt) {
      this.showToast('Please describe the image you want to generate', 'error');
      return;
    }
    
    const button = event.target;
    button.classList.add('loading');
    button.disabled = true;
    
    try {
      const response = await axios.post('/api/generate-image', {
        strategy_id: 1, // Default for demo
        image_prompt: imagePrompt,
        style: imageStyle
      });
      
      // Show generated image
      const imageModal = document.createElement('div');
      imageModal.className = 'modal-overlay';
      imageModal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-image mr-2"></i>Generated Image
            </h3>
            
            <div class="mb-4">
              <img src="${response.data.image_url}" alt="Generated Image" class="w-full rounded-lg shadow-lg">
            </div>
            
            <div class="bg-gray-50 p-3 rounded mb-4">
              <p class="text-sm text-gray-700"><strong>Prompt:</strong> ${response.data.prompt}</p>
              <p class="text-sm text-gray-700"><strong>Style:</strong> ${response.data.style}</p>
            </div>
            
            <div class="flex space-x-3">
              <button class="btn btn-primary flex-1" onclick="app.downloadImage('${response.data.image_url}', 'generated-image.png')">
                <i class="fas fa-download mr-2"></i>Download Image
              </button>
              <button class="btn btn-secondary" onclick="app.closeModal(this)">
                <i class="fas fa-times mr-2"></i>Close
              </button>
            </div>
          </div>
        </div>
      `;
      
      // Close the prompt modal first
      document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
      
      // Show the image modal
      document.getElementById('modal-container').appendChild(imageModal);
      
      this.showToast('Image generated successfully!', 'success');
      
    } catch (error) {
      this.showToast('Failed to generate image: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  downloadText(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadImage(imageUrl, filename) {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    a.click();
  }

  generatePDF(content, filename) {
    // Simple PDF generation - in production, use a proper PDF library
    this.downloadText(content, filename.replace('.pdf', '.txt'));
    this.showToast('PDF generation requires additional libraries. Downloaded as text file instead.', 'warning');
  }

  async generateImageFromNode() {
    if (!this.selectedNode || this.selectedNode.data('type') !== 'image_generator') {
      this.showToast('Please select an Image Generator node', 'error');
      return;
    }

    const config = this.selectedNode.data('config') || {};
    const imagePrompt = config.image_prompt;
    const imageStyle = config.image_style || 'professional';

    if (!imagePrompt) {
      this.showToast('Please enter an image description in the node configuration', 'error');
      return;
    }

    const button = event.target;
    button.classList.add('loading');
    button.disabled = true;

    try {
      const response = await axios.post('/api/generate-image', {
        strategy_id: 1, // Default for demo
        image_prompt: imagePrompt,
        style: imageStyle
      });

      // Show generated image in modal
      const imageModal = document.createElement('div');
      imageModal.className = 'modal-overlay';
      imageModal.innerHTML = `
        <div class="modal-content bg-white rounded-lg shadow-xl max-w-2xl w-full">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <i class="fas fa-image mr-2"></i>Generated Image
            </h3>
            
            <div class="mb-4">
              <img src="${response.data.image_url}" alt="Generated Image" class="w-full rounded-lg shadow-lg">
            </div>
            
            <div class="bg-gray-50 p-3 rounded mb-4">
              <p class="text-sm text-gray-700"><strong>Prompt:</strong> ${response.data.prompt}</p>
              <p class="text-sm text-gray-700"><strong>Style:</strong> ${response.data.style}</p>
            </div>
            
            <div class="flex space-x-3">
              <button class="btn btn-primary flex-1" onclick="app.downloadImage('${response.data.image_url}', 'generated-image-${Date.now()}.png')">
                <i class="fas fa-download mr-2"></i>Download Image
              </button>
              <button class="btn btn-success" onclick="app.addImageToWorkflow('${response.data.image_url}', '${imagePrompt}')">
                <i class="fas fa-plus mr-2"></i>Add to Workflow
              </button>
              <button class="btn btn-secondary" onclick="app.closeModal(this)">
                <i class="fas fa-times mr-2"></i>Close
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.getElementById('modal-container').appendChild(imageModal);
      this.showToast('Image generated successfully!', 'success');

    } catch (error) {
      this.showToast('Failed to generate image: ' + (error.response?.data?.error || error.message), 'error');
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  addImageToWorkflow(imageUrl, prompt) {
    // Store the generated image reference in the node
    if (this.selectedNode) {
      const currentConfig = this.selectedNode.data('config') || {};
      currentConfig.generated_image_url = imageUrl;
      currentConfig.generated_prompt = prompt;
      this.selectedNode.data('config', currentConfig);
      
      // Update node visual to show it has generated content
      this.selectedNode.style({
        'border-color': '#10b981',
        'border-width': 3
      });
      
      this.showToast('Image added to workflow node!', 'success');
    }
    
    // Close the modal
    document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
  }

  async saveWorkflow() {
    try {
      const nodes = this.cy.nodes().map(node => ({
        id: node.id(),
        type: node.data('type'),
        position: node.position(),
        config: node.data('config') || {}
      }));
      
      const edges = this.cy.edges().map(edge => ({
        source: edge.source().id(),
        target: edge.target().id()
      }));
      
      const response = await axios.post('/api/workflows', {
        project_id: this.currentProject.id,
        name: 'Workflow ' + new Date().toLocaleString(),
        nodes_data: nodes,
        connections_data: edges
      });
      
      this.currentWorkflow.id = response.data.id;
      this.showToast('Workflow saved successfully!', 'success');
    } catch (error) {
      this.showToast('Failed to save workflow: ' + (error.response?.data?.error || error.message), 'error');
    }
  }

  async loadProjects() {
    try {
      const response = await axios.get('/api/projects');
      // Projects loaded successfully - could populate a dropdown here
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  showNewProjectModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">
            <i class="fas fa-plus mr-2"></i>Create New Project
          </h3>
          
          <div class="input-group">
            <label class="input-label">Project Name</label>
            <input type="text" id="project-name" class="input-field" placeholder="Enter project name">
          </div>
          
          <div class="input-group">
            <label class="input-label">Description</label>
            <textarea id="project-description" class="input-field textarea-field" placeholder="Project description (optional)"></textarea>
          </div>
          
          <div class="flex space-x-3 mt-6">
            <button class="btn btn-primary flex-1" onclick="app.createProject()">
              <i class="fas fa-check mr-2"></i>Create Project
            </button>
            <button class="btn btn-secondary" onclick="app.closeModal(this)">
              <i class="fas fa-times mr-2"></i>Cancel
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('modal-container').appendChild(modal);
  }

  async createProject() {
    const name = document.getElementById('project-name').value.trim();
    const description = document.getElementById('project-description').value.trim();
    
    if (!name) {
      this.showToast('Please enter a project name', 'error');
      return;
    }
    
    try {
      const response = await axios.post('/api/projects', {
        name: name,
        description: description
      });
      
      this.currentProject = response.data;
      this.showToast('Project created successfully!', 'success');
      this.closeModal(document.querySelector('.modal-overlay button'));
      
      // Clear canvas for new project
      this.cy.elements().remove();
      this.showWelcomeMessage();
      
    } catch (error) {
      this.showToast('Failed to create project: ' + (error.response?.data?.error || error.message), 'error');
    }
  }

  showWelcomeMessage() {
    document.getElementById('welcome-message').style.display = 'flex';
  }

  hideWelcomeMessage() {
    document.getElementById('welcome-message').style.display = 'none';
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'} mr-2"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ContentWorkflowApp();
});