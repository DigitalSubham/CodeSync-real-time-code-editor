import React, { useState } from "react";
import CodeSync from "../assets/CodeSync.svg";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success("created a new room");
    // console.log(id);
  };

  // join button work with enter keypress
  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
      // console.log("event: " + e.code);
    }
  };

  const joinRoom = () => {
    if (!roomId || !userName) {
      toast.error("Please fill all the fields");
      return;
    }
    //Redirect to editor
    navigate(`/editor/${roomId}`, { state: { userName } });
  };

  return (
    <div className="bg-[#1c1e29] flex items-center justify-center text-white h-screen">
      <div className="bg-[#282a36] p-5 rounded-xl w-[400px] max-w-[90%] ">
        <div>
          <img
            className=" object-cover h-48 w-96 "
            src={CodeSync}
            alt="Code_Sync"
          />
        </div>
        <h4 className="mb-5 mt-0">Paste Invitation ROOM ID</h4>
        <div className="flex flex-col">
          <input
            className="p-3 rounded-md mb-3 bg-[#eee] text-black text-[16x] font-bold"
            type="text"
            placeholder="ROOM ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
            onKeyUp={handleInputEnter}
          />
          <input
            className="p-3 rounded-md mb-3 text-black bg-[#eee] text-[16x] font-bold"
            type="text"
            placeholder="USERNAME"
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
            onKeyUp={handleInputEnter}
          />
          <button
            onClick={joinRoom}
            className="p-3 rounded-md text-[16px] cursor-pointer transition-all duration-300 ease-in-out bg-[#4aed88] w-28 ml-auto hover:bg-[#2b824c]"
          >
            Join
          </button>
          <span className="my-0 mx-auto mt-5">
            If you don't have an invite then create &nbsp;
            <a
              className="border-b-2 border-[#4aee88] transition-all duration-300 ease-in-out hover:text-[#368654] hover:border-[#368654] text-[#4aee88]"
              href="/"
              onClick={createNewRoom}
            >
              New Room
            </a>
          </span>
        </div>
      </div>
      <footer className="fixed bottom-4">
        <h4>
          Built with 💜 by{" "}
          <a
            href=""
            className="text-[#4aee88] transition-all duration-300 ease-in-out hover:text-[#368654]"
          >
            Subham Kumar
          </a>{" "}
        </h4>
      </footer>
    </div>
  );
};

export default Home;
