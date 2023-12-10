import React, { useEffect, useRef, useState } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Actions";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  // State to store the code entered in the CodeMirror editor
  const [code, setCode] = useState("");

  // Reference to the CodeMirror editor instance
  const editorRef = useRef(null);

  // Initialize the CodeMirror editor when the component mounts
  useEffect(() => {
    async function init() {
      // Create the CodeMirror editor from the textarea with id "abc"
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("abc"),
        {
          mode: { name: "javascript", json: true }, // Set the editor mode to JavaScript
          theme: "dracula", // Set the editor theme to Dracula
          autoCloseTags: true, // Enable auto-closing of HTML tags
          autoCloseBrackets: true, // Enable auto-closing of brackets
          lineNumbers: true, // Enable line numbers
        }
      );

      // Event handler for changes in the CodeMirror editor
      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const newCode = instance.getValue();

        // Update the state with the new code
        setCode(newCode);

        // Call the callback to notify of code changes
        onCodeChange(newCode);

        // Emit the code change through the socket, excluding changes from setValue
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code: newCode,
          });
        }
      });
    }
    init();
  }, []);

  // Set up socket event listener for code changes from other users
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          // Set the value in the CodeMirror editor
          editorRef.current.setValue(code);
          // No need to setCode here, as the state is already updated in the change event
        }
      });
    }
    return () => {
      // Clean up the socket event listener when the component unmounts
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  // console.log(import.meta.env.)

  return (
    <div>
      <div>
        {/* Hidden textarea used as a fallback for non-JS users or SEO */}
        <textarea id="abc"></textarea>
      </div>
    </div>
  );
};

export default Editor;
