import React, { useEffect, useRef, useState } from "react";
import CodeSync from "../assets/CodeSync.svg";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../socket";
import ACTIONS from "../Actions";
import toast from "react-hot-toast";
import {
  useLocation,
  useParams,
  useNavigate,
  Navigate,
} from "react-router-dom";

const EditorPage = () => {
  const [clients, setClients] = useState([]);
  const codeRef = useRef(null);
  const socketRef = useRef(null); //we are using useRef because when its value change component didn't rerender
  const location = useLocation();
  const { roomId } = useParams();
  // console.log(roomId);
  const reactNavigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      // console.log(socketRef.current);
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(err) {
        console.log("socket error", err);
        toast.error("Socket connection failed, try again later");
        reactNavigate("/"); //redirect to home page
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        userName: location.state?.userName,
      });
      //listening for joined event
      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, userName, socketId }) => {
          if (userName !== location.state.userName) {
            //when i joined notify other members that i have joined not not me
            toast.success(`${userName} have joined the room`);
            console.log(`${userName} has joined`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_Code, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      //listening for disconnect
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, userName }) => {
        toast.success(`${userName} has left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId); // removing client from state who has leave the room
        });
      });
    };
    init();
    // component unmount
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied to clipboard");
    } catch (error) {
      console.log(error);
      toast.error("Failed to copy to clipboard");
    }
  }

  function leaveRoom() {
    reactNavigate("/");
  }

  return (
    <div className="mainWrap bg-[#1c1e29] grid grid-cols-[250px_minmax(900px,_1fr)_0px] h-screen  	">
      <div className="aside bg-[#1c1e29] border-r-[1px] border-white flex flex-col">
        <div className="asideInner flex-1">
          <div className="logo border-b-2 boder-[#424242] ">
            <img className="logoImage h-21" src={CodeSync} alt="Code_Sync" />
          </div>
          <h3 className="text-white text-2xl pl-2">Connected</h3>
          <div className="clientslist flex items-center px-2 flex-wrap gap-5">
            {clients.map((client) => (
              <Client
                className="flex items-center flex-col font-bold"
                key={client.socketId}
                userName={client.userName}
              />
            ))}
          </div>
        </div>
        <button
          onClick={copyRoomId}
          className="p-2 mb-2 rounded-md text-[16px] cursor-pointer transition-all duration-300 ease-in-out bg-white font-bold w-[90%] mx-auto  hover:bg-[#2b824c]"
        >
          Copy Room ID
        </button>
        <button
          onClick={leaveRoom}
          className="p-2 rounded-md text-[16px] mb-2 cursor-pointer transition-all duration-300 ease-in-out bg-[#4aed88] font-bold w-[90%] mx-auto  hover:bg-[#2b824c]"
        >
          Leave
        </button>
      </div>
      <div className="editorWrap  ">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;
