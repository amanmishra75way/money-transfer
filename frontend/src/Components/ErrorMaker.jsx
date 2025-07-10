import React from "react";

const ErrorMaker = () => {
  throw new Error("This is a test error");
  return <h1>This will not be rendered</h1>;
};

export default ErrorMaker;
