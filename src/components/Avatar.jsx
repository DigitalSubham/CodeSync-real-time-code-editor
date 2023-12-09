import React from "react";

const Avatar = ({ userName }) => {
  // console.log(userName);
  // Extracting the first letter of the username as the first name
  const firstName = userName.split(" ")[0][0];

  // Extracting the last word from the username and taking its first letter as the last name
  const words = userName.split(" ");
  let lastName = "";

  if (words.length > 1) {
    // If there is more than one word, take the first letter of the last word
    lastName = words[words.length - 1][0];
  } else {
    // If there is only one word, use the entire word as the last name
    lastName = words[0];
  }

  return (
    <div>
      <div className="w-12 h-12 rounded-[50%] bg-[#512DA8] text-2xl text-white text-center	leading-10	m-5">
        {firstName + lastName}
      </div>
    </div>
  );
};

export default Avatar;
