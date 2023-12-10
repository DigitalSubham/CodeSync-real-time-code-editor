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
import { handleCode } from "../helper";

const EditorPage = () => {
  const [syncedOutput, setSyncedOutput] = useState("");
  const [output, setOutput] = useState(""); // Initialize with an appropriate default value
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

          // Inside the useEffect block
          socketRef.current.on(ACTIONS.SYNC_OUTPUT, ({ output }) => {
            setSyncedOutput(output);
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

  const handleRunCode = async () => {
    const codeOutput = await handleCode(codeRef.current);
    // setOutput(codeOutput);

    // Emit the output to the server for synchronization
    socketRef.current.emit(ACTIONS.SYNC_OUTPUT, {
      roomId,
      output: codeOutput.output,
    });
  };

  // console.log(output);

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
    <div className="mainWrap bg-[#1c1e29] grid grid-cols-[250px_minmax(900px,1fr)300px]">
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
      <div className="">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
      <div className="w-[100%] h-screen ">
        <div className="flex">
          <button
            onClick={handleRunCode}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5  mx-4 my-4  text-center  me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Run
          </button>

          <div className="mx-4 my-4 ">
            <button
              id="dropdownDefaultButton"
              data-dropdown-toggle="dropdown"
              class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              type="button"
            >
              Language{" "}
              <svg
                class="w-2.5 h-2.5 ms-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>

            {/* <!-- Dropdown menu --> */}
            <div
              id="dropdown"
              class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700"
            >
              <ul
                class="py-2 text-sm text-gray-700 dark:text-gray-200"
                aria-labelledby="dropdownDefaultButton"
              >
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Settings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Earnings
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Sign out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-white border-t-[1px]  border-white p-2 text-2xl">
          Output
          <p className="m-2">{syncedOutput}</p>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
