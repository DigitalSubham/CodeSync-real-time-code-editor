export const handleCode = async (code) => {
  const url = import.meta.env.VITE_COMPILER_URL;
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": import.meta.env.VITE_KEY,
      "X-RapidAPI-Host": "online-code-compiler.p.rapidapi.com",
    },
    body: JSON.stringify({
      language: "nodejs",
      code: code, // Use the code state variable
      version: "latest",
      input: null,
    }),
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    // console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};
