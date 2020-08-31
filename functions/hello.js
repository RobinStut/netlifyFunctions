const got = require('got')
const marked = require('marked')

const template = ({ markdown, title, author, date_modified }) => `<!doctype html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<meta http-equiv="x-ua-compatible" content="ie=edge">
	<title>${ title }</title>
	<link rel="stylesheet" href="/styles.css">
</head>
<body>
	<main>
		<header>
			<dl>
				<dt>Author</dt>
				<dd>${ author }</dd>
				<dt>Date last updated</dt>
				<dd>${ new Date(date_modified).toISOString().replace(/T.+/, '') }</dd>
			</dl>
		</header>
		<article>
			${ marked(markdown) }
		</article>
	</main>
</body>
</html>
`

function findMarkdownFile(files) {
	return Object.values(files).find(file => file.filename.endsWith('.md'))
}

exports.handler = async (event, context) => {
	const options = {
		prefixUrl: 'https://api.github.com/gists',
		headers: {
			'Accept': 'application/vnd.github.v3+json'
		}
	}
	const { id } = event.queryStringParameters
	try {
		const data = await got(id, options)
			.then(response => JSON.parse(response.body))
			.then(json => {
				let mdFile = findMarkdownFile(json.files)
				return {
					markdown: mdFile.content,
					title: json.description,
					author: json.owner.login,
					date_modified: json.updated_at
				}
			})
		return {
			body: template(data),
			statusCode: 200,
		}
	} catch(error) {
		return {
			body: error.message || error.errorMessage || ":(",
			statusCode: error.code || error.statusCode || 500
		}
	}
}