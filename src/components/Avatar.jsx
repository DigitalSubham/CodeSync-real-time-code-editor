import React from "react";

const Avatar = ({ userName }) => {
  // console.log(userName);

  // Extracting the first letter and the lastname from the username
  const firstLast = userName.split(" ");
  const firstNameLetter = userName.split(" ")[0][0];
  if (firstLast.length > 1) {
    var lastNameLetter = userName.split(" ")[1][0];
  }

  // console.log("first", firstNameLetter, "last", lastNameLetter);
  return (
    <div>
      <div className="w-12 h-12 rounded-[50%] bg-[#512DA8] text-2xl text-white text-center	leading-10	m-5">
        {firstNameLetter && lastNameLetter
          ? firstNameLetter + lastNameLetter
          : firstNameLetter}
      </div>
    </div>
  );
};

export default Avatar;
