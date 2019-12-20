const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const babel = require('@babel/core');
const remark = require('remark');
const visit = require('unist-util-visit');

// TODO: Global setup (like Lodash)

// const MANUSCRIPT = path.resolve(__dirname, '../manuscript/book.md');
const MANUSCRIPT = path.resolve(__dirname, '../test/test.md');
const LANGS = ['js', 'jsx'];
const IGNORE_HEADERS = ['prettier-ignore'];

function isInstruction(node) {
  return (
    node &&
    node.type === 'html' &&
    node.value.startsWith('<!--') &&
    node.value.endsWith('-->')
  );
}

function unwrapHtmlComment(html) {
  return html
    .replace(/^<!--/, '')
    .replace(/-->$/, '')
    .trim();
}

function getHeader(nodes, index) {
  const header = nodes[index - 1];
  if (!isInstruction(header)) {
    return '';
  }

  const cleanHeader = unwrapHtmlComment(header.value);

  if (IGNORE_HEADERS.includes(cleanHeader)) {
    return '';
  }

  return cleanHeader;
}

function getFooter(nodes, index) {
  const footer = nodes[index + 1];
  if (isInstruction(footer)) {
    return unwrapHtmlComment(footer.value);
  }
  return '';
}

function getChapterTitle(nodes, index) {
  const headingIndex = _.findLastIndex(
    nodes,
    node => node.type === 'heading',
    index
  );
  if (headingIndex === -1) {
    return '';
  }

  const headingNode = nodes[headingIndex];
  return headingNode.children[0].value;
}

const testNameIndicies = {};

function getTestName(title) {
  if (!testNameIndicies[title]) {
    testNameIndicies[title] = 0;
  }

  testNameIndicies[title] += 1;

  return `${title} ${testNameIndicies[title]}`;
}

async function executeCode(source) {
  const { code } = await babel.transformAsync(source, {});

  // eslint-disable-next-line no-eval
  eval(code);
}

function testMarkdown(markdown) {
  function visitor() {
    return ast => {
      visit(ast, 'code', (node, index, { children: siblings }) => {
        if (!LANGS.includes(node.lang)) {
          return;
        }

        const header = getHeader(siblings, index);
        if (header === 'skip-test') {
          return;
        }

        const footer = getFooter(siblings, index);
        const code = [header, node.value, footer].join('\n\n');

        test(
          getTestName(getChapterTitle(siblings, index)),
          async () => {
            await executeCode(code);
          }
        );
      });
    };
  }

  remark()
    .use(visitor)
    .processSync(markdown);
}

// RUN!
const content = fs.readFileSync(MANUSCRIPT, 'utf8');
testMarkdown(content);
