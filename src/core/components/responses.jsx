import React from "react"
import { fromJS, Iterable } from "immutable"
import PropTypes from "prop-types"
import ImPropTypes from "react-immutable-proptypes"
import { defaultStatusCode, getAcceptControllingResponse } from "core/utils"

export default class Responses extends React.Component {
    static propTypes = {
        tryItOutResponse: PropTypes.instanceOf(Iterable),
        responses: PropTypes.instanceOf(Iterable).isRequired,
        produces: PropTypes.instanceOf(Iterable),
        producesValue: PropTypes.any,
        tryItOutEnabled: PropTypes.bool.isRequired,
        displayRequestDuration: PropTypes.bool.isRequired,
        path: PropTypes.string.isRequired,
        method: PropTypes.string.isRequired,
        getComponent: PropTypes.func.isRequired,
        getConfigs: PropTypes.func.isRequired,
        specSelectors: PropTypes.object.isRequired,
        specActions: PropTypes.object.isRequired,
        oas3Actions: PropTypes.object.isRequired,
        specPath: ImPropTypes.list.isRequired,
        fn: PropTypes.object.isRequired
    }

    static defaultProps = {
        tryItOutResponse: null,
        produces: fromJS(["application/json"]),
        displayRequestDuration: false
    }

    shouldComponentUpdate(nextProps) {
        // BUG: props.tryItOutResponse is always coming back as a new Immutable instance
        let render = this.props.tryItOutResponse !== nextProps.tryItOutResponse
        || this.props.responses !== nextProps.responses
        || this.props.produces !== nextProps.produces
        || this.props.producesValue !== nextProps.producesValue
        || this.props.displayRequestDuration !== nextProps.displayRequestDuration
        || this.props.path !== nextProps.path
        || this.props.method !== nextProps.method
        || this.props.tryItOutEnabled !== nextProps.tryItOutResponse
        return render
    }

    onChangeProducesWrapper = ( val ) => this.props.specActions.changeProducesValue([this.props.path, this.props.method], val)

    onResponseContentTypeChange = ({ controlsAcceptHeader, value }) => {
        const { oas3Actions, path, method } = this.props
        if(controlsAcceptHeader) {
            oas3Actions.setResponseContentType({
                value,
                path,
                method
            })
        }
    }

    render() {
        let {
            responses,
            tryItOutResponse,
            tryItOutEnabled,
            getComponent,
            getConfigs,
            specSelectors,
            fn,
            producesValue,
            displayRequestDuration,
            specPath,
        } = this.props
        let defaultCode = defaultStatusCode( responses )

        const ContentType = getComponent( "contentType" )
        const LiveResponse = getComponent( "liveResponse" )
        const Response = getComponent( "response" )

        let produces = this.props.produces && this.props.produces.size ? this.props.produces : Responses.defaultProps.produces

        const isSpecOAS3 = specSelectors.isOAS3()

        const acceptControllingResponse = isSpecOAS3 ?
        getAcceptControllingResponse(responses) : null

        if (tryItOutEnabled && !tryItOutResponse) {
            return null;
        }

        return (
            <div className="responses-wrapper">
                <div className="opblock-section-header">
                    <h4>Responses</h4>
                </div>
                <div className="responses-inner">
                    {
                        !tryItOutResponse ? null
                        : <div>
                        <LiveResponse response={ tryItOutResponse }
                            getComponent={ getComponent }
                            getConfigs={ getConfigs }
                            specSelectors={ specSelectors }
                            path={ this.props.path }
                            method={ this.props.method }
                            displayRequestDuration={ displayRequestDuration } />
                    </div>

                }

                { tryItOutEnabled ? null
                    : <table className="responses-table">
                    <thead>
                        <tr className="responses-header">
                            <td className="col col_header response-col_status">Code</td>
                            <td className="col col_header response-col_description">Description</td>
                            { specSelectors.isOAS3() ? <td className="col col_header response-col_links">Links</td> : null }
                        </tr>
                    </thead>
                    <tbody>
                        {
                            responses.entrySeq().map( ([code, response]) => {

                                let className = tryItOutResponse && tryItOutResponse.get("status") == code ? "response_current" : ""
                                return (
                                    <Response key={ code }
                                        specPath={specPath.push(code)}
                                        isDefault={defaultCode === code}
                                        fn={fn}
                                        className={ className }
                                        code={ code }
                                        response={ response }
                                        specSelectors={ specSelectors }
                                        controlsAcceptHeader={response === acceptControllingResponse}
                                        onContentTypeChange={this.onResponseContentTypeChange}
                                        contentType={ producesValue }
                                        getConfigs={ getConfigs }
                                        getComponent={ getComponent }/>
                                )
                            }).toArray()
                        }
                    </tbody>
                </table>
            }
        </div>
    </div>
)
}
}
