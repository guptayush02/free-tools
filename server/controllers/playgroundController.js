const Snippet = require('../models/Snippet');
const { execSync } = require('child_process');

exports.createSnippet = async (req, res) => {
  try {
    const { title, code, description, tags } = req.body;
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const snip = new Snippet({ title, code, description, tags });
    await snip.save();
    res.json({ id: snip._id, url: `/playground/${snip._id}` });
  } catch (err) {
    console.error('Create snippet error:', err);
    res.status(500).json({ error: 'Failed to create snippet' });
  }
};

exports.getSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    const snip = await Snippet.findById(id).lean();
    if (!snip) return res.status(404).json({ error: 'Snippet not found' });
    res.json(snip);
  } catch (err) {
    console.error('Get snippet error:', err);
    res.status(500).json({ error: 'Failed to fetch snippet' });
  }
};

exports.listSnippets = async (req, res) => {
  try {
    const Snippet = require('../models/Snippet')
    const items = await Snippet.find({}).sort({ createdAt: -1 }).limit(50).lean()
    res.json(items.map(i => ({ id: i._id, title: i.title || 'Untitled', createdAt: i.createdAt })))
  } catch (err) {
    console.error('List snippets error:', err)
    res.status(500).json({ error: 'Failed to list snippets' })
  }
}

exports.executeCode = async (req, res) => {
  try {
    const { code, language } = req.body
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language required' })
    }

    // Sandbox execution based on language
    let output = ''
    let error = null

    if (language === 'javascript' || language === 'js') {
      try {
        // Use Function constructor to execute code in a controlled scope
        const fn = new Function('console', code)
        const logs = []
        const mockConsole = {
          log: (...args) => logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
          error: (...args) => logs.push('[ERROR] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
          warn: (...args) => logs.push('[WARN] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
          info: (...args) => logs.push('[INFO] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '))
        }
        fn(mockConsole)
        output = logs.join('\n')
      } catch (e) {
        error = e.message
      }
    } else if (language === 'python') {
      // Python execution (requires Python installed)
      try {
        const result = execSync(`python3 -c '${code.replace(/'/g, "'\\''")}'`, { encoding: 'utf8', timeout: 5000 })
        output = result
      } catch (e) {
        error = e.stderr?.toString() || e.message
      }
    } else if (language === 'html' || language === 'jsx') {
      // For HTML/JSX, return code as-is for client to render
      output = code
    } else {
      error = `Language '${language}' not supported yet`
    }

    res.json({ output, error })
  } catch (err) {
    console.error('Execute error:', err)
    res.status(500).json({ error: 'Execution failed' })
  }
}
