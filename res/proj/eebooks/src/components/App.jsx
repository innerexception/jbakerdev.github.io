import React from 'react';
import EditStateContainer from './edit/EditStateContainer.js';
import { fetchMap } from './edit/EditActions.js';
import './App.css';

class App extends React.Component {
    constructor(props){
        super(props);
    };

    render(){
        return (
            <div className='ee-app'>
                <EditStateContainer store={this.props.store} />
            </div>
        );
    }
};

export default App