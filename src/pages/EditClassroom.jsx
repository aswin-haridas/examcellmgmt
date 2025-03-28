import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Classroom from "../components/Class";

export const EditClassroom = () => {
  const { id } = useParams();

  return (
    <div>
      <Classroom classroomId={id} />
    </div>
  );
};
