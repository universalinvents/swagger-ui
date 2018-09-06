import React, { Component } from "react"
import PropTypes from "prop-types"
import ImPropTypes from "react-immutable-proptypes"
import Im from "immutable"

// More readable, just iterate over maps, only
const eachMap = (iterable, fn) => iterable.valueSeq().filter(Im.Map.isMap).map(fn)

export default class Parameters extends Component {

    static propTypes = {
        parameters: ImPropTypes.list.isRequired,
        specActions: PropTypes.object.isRequired,
        getComponent: PropTypes.func.isRequired,
        specSelectors: PropTypes.object.isRequired,
        fn: PropTypes.object.isRequired,
        tryItOutEnabled: PropTypes.bool,
        allowTryItOut: PropTypes.bool,
        onTryoutClick: PropTypes.func,
        onCancelClick: PropTypes.func,
        onChangeKey: PropTypes.array,
        pathMethod: PropTypes.array.isRequired,
        getConfigs: PropTypes.func.isRequired,
        specPath: ImPropTypes.list.isRequired,
    }


    static defaultProps = {
        onTryoutClick: Function.prototype,
        onCancelClick: Function.prototype,
        tryItOutEnabled: false,
        allowTryItOut: true,
        onChangeKey: [],
        specPath: [],
    }

    onChange = ( param, value, isXml ) => {
        let {
            specActions: { changeParamByIdentity },
            onChangeKey,
        } = this.props

        changeParamByIdentity(onChangeKey, param, value, isXml)
    }

    onChangeConsumesWrapper = ( val ) => {
        let {
            specActions: { changeConsumesValue },
            onChangeKey
        } = this.props

        changeConsumesValue(onChangeKey, val)
    }

    render(){

        let {
            onTryoutClick,
            onCancelClick,
            parameters,
            allowTryItOut,
            tryItOutEnabled,
            specPath,

            fn,
            getComponent,
            getConfigs,
            specSelectors,
            specActions,
            pathMethod
        } = this.props

        const ParameterRow = getComponent("parameterRow")
        const TryItOutButton = getComponent("TryItOutButton")

        const isExecute = tryItOutEnabled && allowTryItOut

        // Group all the parameters by param type
        let paramTypes = {};
        parameters.forEach((parameter,i) => {
            let param = specSelectors.parameterWithMetaByIdentity(pathMethod, parameter);
            let type = param.get('in');
            if (!paramTypes[type]) { paramTypes[type] = []; }
            paramTypes[type].push({ parameter, param, i });
        });

        return (
            <div className="opblock-section">
                <div className="opblock-section-header">
                    { allowTryItOut ? (
                        <div>
                            <button className="btn" onClick={onCancelClick}>Definition</button>
                            <button className="btn" onClick={onTryoutClick}>Try it Out</button>
                        </div>) : null }
                    </div>
                    { !parameters.count() ? <div className="opblock-description-wrapper"><p>No parameters</p></div> :
                        (() => {
                            let result = [];
                            for (let type in paramTypes) {
                                let params = paramTypes[type];
                                let paramResult = [];
                                params.forEach(({ parameter, param, i }, j) => {
                                    paramResult.push(
                                        <div className="table-container" key={j}>
                                            <table className="parameters">
                                                <thead>
                                                    <tr>
                                                        <th className="col col_header parameters-col_name">Name</th>
                                                        <th className="col col_header parameters-col_description">Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <ParameterRow
                                                        fn={ fn }
                                                        specPath={specPath.push(i.toString())}
                                                        getComponent={ getComponent }
                                                        getConfigs={ getConfigs }
                                                        rawParam={ parameter }
                                                        param={ specSelectors.parameterWithMetaByIdentity(pathMethod, parameter) }
                                                        key={ `${parameter.get( "in" )}.${parameter.get("name")}` }
                                                        onChange={ this.onChange }
                                                        onChangeConsumes={this.onChangeConsumesWrapper}
                                                        specSelectors={ specSelectors }
                                                        specActions={specActions}
                                                        pathMethod={ pathMethod }
                                                        isExecute={ isExecute }/>
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })
                                result.push(<div key={type}>
                                    <h3>
                                        {(() => {
                                            switch(type) {
                                                case 'header':
                                                    return 'Header Params';
                                                case 'query':
                                                    return 'Query Params';
                                                case 'path':
                                                    return 'Path Params';
                                                case 'body':
                                                    return 'Request Body';
                                                default:
                                                    return type;
                                            }
                                        })()}
                                    </h3>
                                    {paramResult}
                                </div>);
                            }

                            return result;
                        })()
                    }
                </div>
            )
        }
    }
