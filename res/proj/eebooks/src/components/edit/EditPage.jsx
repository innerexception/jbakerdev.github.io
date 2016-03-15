import React, { PropTypes } from 'react'
import './EditPage.css';
import { fetchViewState } from './EditActions.js';
import Constants from '../Constants.js';

import Quill from 'react-quill';
import 'react-quill/node_modules/quill/dist/quill.base.css';
import 'react-quill/node_modules/quill/dist/quill.snow.css';

class EditPage extends React.Component {

    static propTypes: {
        viewState: PropTypes.object.isRequired,
        onMenuItemOpen: PropTypes.func.isRequired,
        onTextChanged: PropTypes.func.isRequired,
        onShowContextMenu: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.props.store.dispatch(fetchViewState({ text: "" }));
    }

    render() {
        if(this.props.viewState){
            return (
                <div className='ee-app-outer'>
                    <div className='ee-titlebar'>
                        <div>e.e. books</div>
                        <div style={{textAlign:'center'}}>Filename.eeb</div>
                        <div style={{textAlign:'right'}}>log out</div>
                    </div>
                    <div className='ee-menu-outer'>
                        <div onClick={()=>this.props.onMenuItemOpen('File')} className='ee-menu-option'>
                            File
                            { this.props.viewState.openMenuName==='File' ?
                                <div className='ee-menu-option-open'>
                                    <div onClick={this.props.onFileExport} className='ee-menu-option'>Export...</div>
                                </div> : null}
                        </div>
                        <div className='ee-menu-option disabled'>Edit</div>
                        <div className='ee-menu-option disabled'>Layout</div>
                        <div className='ee-menu-option disabled'>Type</div>
                        <div className='ee-menu-option disabled'>View</div>
                        <div className='ee-menu-option disabled'>Window</div>
                    </div>
                    <div className={'ee-editor-outer' + (this.props.viewState.openMenuName ? ' z' : '')}>
                        <Quill theme='snow' value={''} />
                    </div>
                </div>
            );
        }
        else{
            return (<div>Did not load ViewState</div>);
        }
    }

}

export default EditPage;