import React from 'react'
import thunkMiddleware from 'redux-thunk'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import editReducer from './src/components/edit/EditPageReducer.js'
import App from './src/components/App.jsx'

let store = createStore(editReducer, applyMiddleware(
    thunkMiddleware // lets us dispatch() functions
));

render(
    <App store={store} />,
    document.body
);