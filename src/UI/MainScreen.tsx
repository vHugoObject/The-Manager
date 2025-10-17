import React from "react";
import { useParams } from "react-router";
export const MainScreen = () => {
  const params = useParams();
  return <div>{params.saveID}</div>;
};
