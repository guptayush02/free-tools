const express = require('express')
const router = express.Router()
const { createSnippet, getSnippet, listSnippets, executeCode } = require('../controllers/playgroundController')

router.post('/snippet', createSnippet)
router.get('/snippet/:id', getSnippet)
router.get('/snippets', listSnippets)
router.post('/execute', executeCode)

// Serve a preview embed path that returns a small HTML wrapping Expo Snack
router.get('/preview/:id', async (req, res) => {
	try {
		const Snippet = require('../models/Snippet')
		const snip = await Snippet.findById(req.params.id).lean()
		if (!snip) return res.status(404).send('Not found')

		// Serve a simple HTML preview page that shows code and offers to open in Expo Snack.
		const safeCode = JSON.stringify(snip.code || '')
		const title = (snip.title || 'React Native Snippet').replace(/</g, '&lt;').replace(/>/g, '&gt;')

		const html = `<!doctype html>
			<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width,initial-scale=1">
					<title>Preview - ${title}</title>
					<style>body{font-family:Arial,Helvetica,sans-serif;padding:16px;line-height:1.4}pre{white-space:pre-wrap;background:#f6f8fa;border:1px solid #e1e4e8;padding:12px;border-radius:6px}button{padding:8px 12px;margin-right:8px} .hint{background:#fffbea;border:1px solid #ffe58f;padding:10px;border-radius:6px;margin-bottom:12px}</style>
				</head>
				<body>
					<h2>${title}</h2>
					<div class="hint">Expo Snack's embed APIs can be unstable. Use <strong>Download App.js</strong> to save the file, then open <a href="https://snack.expo.dev/" target="_blank" rel="noopener">snack.expo.dev</a> and upload or paste the file into the editor.</div>
					<p>This preview shows the saved snippet. Use the buttons below to copy, download, or open Snack.</p>
					<div style="margin-bottom:12px">
						<button id="openSnack">Open Snack (paste/upload)</button>
						<button id="copy">Copy Code</button>
						<button id="download">Download App.js</button>
					</div>
					<pre id="code">${snip.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
					<script>
						const code = ${safeCode};
						document.getElementById('copy').addEventListener('click', async () => {
							try { await navigator.clipboard.writeText(code); alert('Code copied to clipboard'); } catch (e) { alert('Copy failed — please select and copy manually'); }
						});
						document.getElementById('openSnack').addEventListener('click', async () => {
							try { await navigator.clipboard.writeText(code); } catch (e) { /* ignore */ }
							window.open('https://snack.expo.dev/', '_blank')
						});
						document.getElementById('download').addEventListener('click', () => {
							const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
							const url = URL.createObjectURL(blob);
							const a = document.createElement('a');
							a.href = url;
							a.download = 'App.js';
							document.body.appendChild(a);
							a.click();
							a.remove();
							URL.revokeObjectURL(url);
						});
					</script>
				</body>
			</html>`

		res.set('Content-Type', 'text/html').send(html)
	} catch (err) {
		console.error(err)
		res.status(500).send('Preview error')
	}
})

module.exports = router
