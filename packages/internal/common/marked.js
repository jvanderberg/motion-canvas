const {Marked} = require('marked');
const highlightJs = require('highlight.js');

module.exports = new Marked({
  renderer: {
    link({href, title, text}) {
      return `<a href='${href}' target='_blank'>${text}</a>`;
    },
    code({text, lang}) {
      const [language_hint, ...rest] = (lang || '').split(/\s+/);
      const code = text
        .split('\n')
        .filter(line => !line.includes('prettier-ignore'))
        .join('\n');
      const language = highlightJs.getLanguage(language_hint)
        ? language_hint
        : 'plaintext';
      const result = highlightJs.highlight(code, {language});
      return `<pre class="${rest.join(
        ' ',
      )}"><code class="language-${language}">${result.value}</code></pre>`;
    },
  },
});
