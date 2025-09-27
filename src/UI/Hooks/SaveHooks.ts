import { useState, useEffect } from "react";
import { Option } from "fp-ts/Option";
import { SaveOptions } from "../../GameLogic/Types"
import { getSaveOptionsOfAllSaves } from "../../GameLogic/Save"


export const getAllSaveOptionsHook = (): Array<Option<[string, SaveOptions]>>  => {
  const [saves, setSaves] = useState<Array<Option<[string, SaveOptions]>>>([])
   
  useEffect(() => {
    async function startFetching() {
      const result = await getSaveOptionsOfAllSaves();
      if (!ignore) {
	setSaves(result);
      }
    }

    let ignore = false;
    startFetching();
    return () => {
      ignore = true
    }
  }, [saves])
  
  return saves
  
}
