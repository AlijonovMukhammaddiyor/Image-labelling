import React, { createContext, useReducer, useEffect } from "react";
import Reducer from "./reducer";
import INITIAL_STATE from "./state";

export const Context = createContext(INITIAL_STATE);

export const ContextProvider = ({ children }) => {
	const [state, dispatch] = useReducer(Reducer, INITIAL_STATE);

	useEffect(() => {
		console.log("Setting localStorage");
		localStorage.setItem("state", JSON.stringify(state));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Context.Provider
			value={{
				state,
				dispatch: dispatch,
			}}
		>
			{children}
		</Context.Provider>
	);
};
