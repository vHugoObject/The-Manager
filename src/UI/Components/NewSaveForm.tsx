import React from "react";
import { useState } from "react";
import { property } from "lodash/fp"
import { mapIndexed } from "futil-js"
import { BaseCountries } from "../../Common/Types"
import { BASECOUNTRIESINDICESDOMESTICLEAGUESINDEX, BASECOUNTRIESINDICESCLUBSINDEX } from "../../Common/Constants"
import { createCountryID, createDomesticLeagueID, createClubID, zipAllAndGetFirstArray } from "../../Common/Transformers"



export const CreateEntityOptions = ({idCreator, selectName, strings}: {idCreator: (arg: number) => string, selectName: string, strings: Array<string>}): JSX.Element => {

  const options: Array<JSX.Element> = mapIndexed((name: string, index: number): JSX.Element => {
    return <option id={idCreator(index)} key={index} value={index}> {name} </option>
  })(strings)
  
  return ( <select name={selectName}>
	     {options}
	   </select> );
}

export const CreateCountryOptions = ({countriesLeaguesClubs}: {countriesLeaguesClubs: BaseCountries}): JSX.Element => {

  const countryNames = zipAllAndGetFirstArray(countriesLeaguesClubs)
  
  return (
    <CreateEntityOptions idCreator={createCountryID} selectName="countries" strings={countryNames}/>
  );
}

export const CreateDomesticLeagueOptions = ({countriesLeaguesClubs, countryIndex}: {countriesLeaguesClubs: BaseCountries, countryIndex: number}): JSX.Element => {

  const domesticLeagueNames = property([countryIndex, BASECOUNTRIESINDICESDOMESTICLEAGUESINDEX])(countriesLeaguesClubs)
  
  return (
    <CreateEntityOptions idCreator={createDomesticLeagueID} selectName="domestic-leagues" strings={domesticLeagueNames}/>
  );
  
}

export const CreateClubOptions = ({countriesLeaguesClubs, countryIndex, domesticLeagueIndex}: {countriesLeaguesClubs: BaseCountries, countryIndex: number, domesticLeagueIndex: number}): JSX.Element => {

  const clubNames = property([countryIndex, BASECOUNTRIESINDICESCLUBSINDEX, domesticLeagueIndex])(countriesLeaguesClubs)
  
  return (
    <CreateEntityOptions idCreator={createClubID} selectName="clubs" strings={clubNames}/>
  );
  
}

export const NewSaveForm = ({countriesLeaguesClubs}: {countriesLeaguesClubs: BaseCountries}) => {
  
  return (
    <div>      
      <form method="post">
	<label>
		  Choose a name:
	  <textarea id="save-name"></textarea>
	</label>
	
	<label>
		  Choose a country:
	  <CreateCountryOptions countriesLeaguesClubs={countriesLeaguesClubs}/>

	</label>
	<label>
		 Choose a domestic league:
	  <select>
	    <option key="1" value="1">La liga </option>
	  </select>
	  
	</label>

	<label>
		 Choose a domestic club:
	  <select>
	    <option key="1" value="1">Varcelona </option>
	  </select>
	  
	</label>	
	
    </form>
      </div>    
  );
}
