import React from "react";
import Avatar from "./Avatar";

const Client = ({ userName }) => {
  // console.log(userName);
  return (
    <div>
      <Avatar userName={userName} />
      <span className="userName text-white">{userName}</span>
    </div>
  );
};

export default Client;
