import { createSignal, onCleanup, JSX, onMount, mergeProps } from "solid-js";
import { editor as Editor } from "monaco-editor";
import loader, { Monaco } from "@monaco-editor/loader";


export interface MonacoEditorProps {
    value?: string
    loadingState?: JSX.Element
    class?: string
    theme?: Editor.BuiltinTheme | string
    overrideServices?: Editor.IEditorOverrideServices
    width?: string
    height?: string
    options?: Editor.IStandaloneEditorConstructionOptions
    saveViewState?: boolean
    onChange?: (value: string, event: Editor.IModelContentChangedEvent) => void
    onMount?: (monaco: Monaco, editor: Editor.IStandaloneCodeEditor) => void
    onBeforeUnmount?: (monaco: Monaco, editor: Editor.IStandaloneCodeEditor) => void
  }
  
  export const MonacoEditor = (inputProps: MonacoEditorProps) => {
    const props = mergeProps(
      {
        theme: 'vs-dark',
        width: '100%',
        height: '100%',
        saveViewState: true,
      },
      inputProps,
    );
    let containerRef!: HTMLDivElement;
  
    const [monaco, setMonaco] = createSignal<Monaco>();
    const [editor, setEditor] = createSignal<Editor.IStandaloneCodeEditor>();
  
    let abortInitialization: (() => void) | undefined
  
    onMount(async () => {
      const loadMonaco = loader.init()
      abortInitialization = () => loadMonaco.cancel()
  
      try {
        const monaco = await loadMonaco
        const editor = monaco.editor.create(
          containerRef,
          {
            automaticLayout: true,
            ...props.options,
          },
          props.overrideServices,
        );
        setMonaco(monaco);
        setEditor(editor);
        monaco.editor.defineTheme("honey", {
          base: "vs-dark",
          inherit: true,
          rules: [],
          colors: {
            "editor.background": "#0A101B",
          },
        })
  
        monaco.editor.setTheme("honey");
        // todo: custom language highlighting
        monaco.editor.setModelLanguage(editor.getModel()!, "rust");
        editor.setValue(props.value ?? "");
      } catch (error: any) {
        console.error("Could not initialize Monaco", error);
      }
    })
  
    onCleanup(() => {
      const _editor = editor()
      if (!_editor) {
        abortInitialization?.()
        return
      }
  
      props.onBeforeUnmount?.(monaco()!, _editor)
      _editor.getModel()?.dispose()
      _editor.dispose()
    });
    
    return (
      <div ref={containerRef} class={props.class} style={{ width: props.width, height: props.height }}>
        {props.loadingState}
      </div>
    )
  }