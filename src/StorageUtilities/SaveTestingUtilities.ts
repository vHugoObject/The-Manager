import { fc } from "@fast-check/vitest";
import { curry } from "lodash/fp";
import { BaseEntities } from "../Common/CommonTypes";
import {
  fastCheckTestBaseEntitiesGenerator,
  getCompletelyRandomClubIDAndDomesticLeagueID,
} from "../TestingUtilities/index";
import { Save, SaveArguments } from "../SaveTypes";
import { createSave } from "../createSave";
