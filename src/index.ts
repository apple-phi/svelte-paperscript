import type { PreprocessorGroup } from "svelte/compiler";
import paper from "paper";
import MagicString from "magic-string";
import { FakeString } from "./fake-string.js";

type PaperFeatures = {
  operatorOverloading?: boolean;
  moduleExports?: boolean;
};

type PaperScriptCompileResult = {
  code: string;
  url: string;
  map: string;
  source: string;
};

type PaperScriptCompileOptions = {
  sourceMaps?: boolean;
  paperFeatures?: PaperFeatures;
  source?: string;
  offset?: number;
};

function compilePaperScript(
  script: string,
  options?: PaperScriptCompileOptions
): PaperScriptCompileResult {
  return paper.PaperScript.compile(script, options) as PaperScriptCompileResult;
}

function addExposedScope(compiled_code: string): string {
  let code = "let {";
  for (let key of [
    "version",
    "settings",
    "project",
    "projects",
    "view",
    "tool",
    "tools",
    "Color",
    "CompoundPath",
    "Curve",
    "CurveLocation",
    "Event",
    "Gradient",
    "GradientStop",
    "Group",
    "HitResult",
    "Item",
    "Key",
    "KeyEvent",
    "Layer",
    "Matrix",
    "MouseEvent",
    "PaperScope",
    "PaperScript",
    "Path",
    "PathItem",
    "Point",
    "PointText",
    "Project",
    "Raster",
    "Rectangle",
    "Segment",
    "Shape",
    "Size",
    "Style",
    "SymbolDefinition",
    "SymbolItem",
    "TextItem",
    "Tool",
    "ToolEvent",
    "Tween",
    "View",
  ]) {
    if (compiled_code.includes(key)) {
      code += key + ",";
    }
  }
  return code + "} = __paper_scope;";
}

function addTools(compiled_code: string): string {
  let toolCode = `let __tool = new __paper_scope.Tool();\n`;
  for (let key of [
    "onMouseDown",
    "onMouseUp",
    "onMouseDrag",
    "onMouseMove",
    "onActivate",
    "onDeactivate",
    "onEditOptions",
    "onKeyDown",
    "onKeyUp",
  ]) {
    if (compiled_code.includes(key)) {
      toolCode += `try {
    if (typeof ${key} === 'function') {
        __tool.${key} = ${key};
    }
} catch(e){};
`;
    }
  }
  return (
    toolCode +
    (compiled_code.includes("onResize")
      ? `if (typeof onResize === 'function') {__paper_scope.view.onResize = onResize;}`
      : "") +
    (compiled_code.includes("onFrame")
      ? `if (typeof onFrame === 'function') {__paper_scope.view.onFrame = onFrame;}`
      : "")
  );
}

function transformPaperScript(script: FakeString): FakeString;
function transformPaperScript(script: MagicString): MagicString;
function transformPaperScript(
  script: MagicString | FakeString
): MagicString | FakeString {
  script = script
    .replace(/__[$]__/g, "__paper_binary_op")
    .replace(/(?<!__)[$][__]/g, "__paper_unary_op");

  let code = script.toString();
  script.prepend(`
import paper from 'paper';
import { onMount } from 'svelte';
let __paper_canvas;
let __paper_scope = new paper.PaperScope();
let binaryOperators = {
    '+': '__add',
    '-': '__subtract',
    '*': '__multiply',
    '/': '__divide',
    '%': '__modulo',
    '==': '__equals',
    '!=': '__equals'
};
let unaryOperators = {
    '-': '__negate',
    '+': '__self'
};
function __paper_binary_op(left, operator, right) {
    let handler = binaryOperators[operator];
    if (left?.[handler]) {
        let res = left[handler](right);
        return operator === '!=' ? !res : res;
    }
    switch (operator) {
    case '+': return left + right;
    case '-': return left - right;
    case '*': return left * right;
    case '/': return left / right;
    case '%': return left % right;
    case '==': return left == right;
    case '!=': return left != right;
    default: throw new Error(\`Unsupported operator: \${operator}\`);
    }
}
function __paper_unary_op(operator, value) {
    let handler = unaryOperators[operator];
    return value?.[handler] ? value[handler]() : operator === '-' ? -value : +value;
}
onMount(() => {
    __paper_scope.setup(__paper_canvas);
    ${addExposedScope(code)}`);

  script.append(`
    ${addTools(code)};
    __paper_scope.view.emit('resize', {size: __paper_scope.view.size, delta: new __paper_scope.Point()});
    __paper_scope.view.requestUpdate();
});`);
  return script;
}

function removeLangAttribute(s: FakeString): FakeString;
function removeLangAttribute(s: MagicString): MagicString;
function removeLangAttribute(
  s: MagicString | FakeString
): MagicString | FakeString {
  return s.replace(/<script\s+lang=["']paperscript["']/i, "<script");
}

// Add a bind:this directive to the canvas element
function bindCanvas(s: FakeString): FakeString;
function bindCanvas(s: MagicString): MagicString;
function bindCanvas(s: MagicString | FakeString): MagicString | FakeString {
  return s.replace(/<canvas\s*(.*?)>/i, (_, existingAttrs) => {
    return `<canvas ${existingAttrs} bind:this={__paper_canvas}>`;
  });
}

function isPaperScript(code: string): boolean {
  return Boolean(code.trim().match(/<script\s+lang=["']paperscript["']/i));
}

let componentUsesPaperScript: boolean;

export const paperscriptPreprocess = ({
  sourceMap = true,
}: {
  sourceMap?: boolean;
}): PreprocessorGroup[] => {
  const StringClass = sourceMap ? MagicString : FakeString;
  return [
    {
      name: "paperscriptCompileScript",
      markup: ({ content }) => {
        componentUsesPaperScript = isPaperScript(content);
      },
      script: ({ content }) => {
        if (componentUsesPaperScript) {
          return compilePaperScript(content, { sourceMaps: sourceMap });
        }
      },
    },
    {
      name: "paperscriptProcessComponent",
      markup: ({ content, filename }) => {
        componentUsesPaperScript = isPaperScript(content);
        if (componentUsesPaperScript) {
          let s = new StringClass(content, { filename });
          s = removeLangAttribute(s);
          s = bindCanvas(s);
          return {
            code: s.toString(),
            map: sourceMap
              ? (s as MagicString).generateMap({
                  hires: true,
                  includeContent: true,
                  file: filename,
                  // source: filename,
                })
              : undefined,
          };
        }
      },
      script: ({ content, filename }) => {
        if (componentUsesPaperScript) {
          let s = new StringClass(content, { filename });
          s = transformPaperScript(s);
          return {
            code: s.toString(),
            map: sourceMap
              ? (s as MagicString).generateMap({
                  hires: true,
                  includeContent: true,
                  file: filename,
                  // source: filename,
                })
              : undefined,
          };
        }
      },
    },
  ];
};
