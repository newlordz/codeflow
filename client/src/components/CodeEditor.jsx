import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../contexts/ThemeContext';
import { soundEngine } from '../utils/soundEngine';

export default function CodeEditor({
  language = 'javascript',
  value = '',
  onChange,
  height = '100%',
  readOnly = false,
  enableSound = true,
}) {
  const { theme } = useTheme();
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    if (enableSound) {
      editor.onKeyDown((e) => {
        soundEngine.playKeypress(e.browserEvent?.key || '');
      });
    }
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-outline-variant/30 bg-surface">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme={theme === 'dark' ? 'vs-dark' : 'vs'}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          readOnly,
          tabSize: 2,
          wordWrap: 'on',
          bracketPairColorization: { enabled: true },
          automaticLayout: true,
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          contextmenu: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-surface-container-lowest">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-on-surface-variant text-sm font-mono">Loading editor...</span>
            </div>
          </div>
        }
      />
    </div>
  );
}
