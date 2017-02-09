import _ from 'lodash'
import React, { Component } from 'react'
import { observer } from 'mobx-react'
import Tooltip from 'rc-tooltip'
import Collapse, { Panel } from 'rc-collapse'

import App from '../lib/app'
import { getRecordKeys } from '../projects/projects-api'

@observer
class Config extends Component {
  state = {
    keys: [],
    isLoadingKeys: true,
  }

  componentWillMount () {
    getRecordKeys().then((keys = []) => {
      this.setState({
        keys,
        isLoadingKeys: false,
      })
    })
  }

  render () {
    return (
      <div id='config'>
        <div className='config-wrapper'>
          <Collapse>
            {this._configSection()}
            {this._projectIdSection()}
            {this._keysSection()}
          </Collapse>
        </div>
      </div>
    )
  }

  _configSection () {
    const config = this.props.project.resolvedConfig

    return (
      <Panel header='Configuration' key='config' className='form-horizontal'>
        <a href='#' className='learn-more' onClick={this._openHelp}>
          <i className='fa fa-info-circle'></i>{' '}
          Learn more
        </a>
        <p className='text-muted'>Your project's configuration is displayed below. A value can be set from the following sources:</p>
        <table className='table config-table'>
          <tbody>
            <tr className='config-keys'>
              <td><span className='default'>default</span></td>
              <td>default values</td>
            </tr>
            <tr className='config-keys'>
              <td><span className='config'>config</span></td>
              <td>set from cypress.json</td>
            </tr>
            <tr className='config-keys'>
              <td><span className='envFile'>envFile</span></td>
              <td>set from cypress.env.json</td>
            </tr>
            <tr className='config-keys'>
              <td><span className='env'>env</span></td>
              <td>set from environment variables</td>
            </tr>
            <tr className='config-keys'>
              <td><span className='cli'>CLI</span></td>
              <td>set from CLI arguments</td>
            </tr>
          </tbody>
        </table>
        <pre className='config-vars'>
          { `{` }
          { this._display(config) }
          { `}` }
        </pre>
      </Panel>
    )
  }

  _getSpan (key, obj, hasComma) {
    return (
      <div key={key} className='line'>
        <span className='key'>{key}</span>
        <span className='colon'>:</span>{' '}
        <Tooltip
          overlay={obj.from || ''}
        >
          <span className={obj.from}>
            {this._getString(obj.value)}
            {`${obj.value}`}
            {this._getString(obj.value)}
          </span>
        </Tooltip>
        {this._getComma(hasComma)}
      </div>
    )
  }

  _getString (val) {
    return _.isString(val) ? "'" : ""
  }

  _getComma (hasComma) {
    return hasComma ? <span className='comma'>,</span> : ''
  }

  _display (obj) {
    let keys = _.keys(obj)
    let lastKey = _.last(keys)

    return _.map(obj, (value, key) => {
      let hasComma = lastKey !== key
      if (value.from == null) {
        return this._nested(key, value, hasComma)
      } else {
        return this._getSpan(key, value, hasComma)
      }
    })
  }

  _nested (key, value, hasComma) {
    return (
      <span key={key}>
        <span className='nested'>
          <span className='key'>{key}</span>
          <span className='colon'>:</span>{' '}
          { `{` }
          { this._display(value) }
        </span>
        <span className='line'>{`}`}{this._getComma(hasComma)}</span>
        <br />
      </span>
    )
  }

  _projectIdSection () {
    if (!this.props.project.id) return null

    return (
      <Panel header='Project ID' key='projectId' className='form-horizontal'>
        <a href='#' className='learn-more' onClick={this._openProjectIdHelp}>
          <i className='fa fa-info-circle'></i>{' '}
          Learn more
        </a>
        <p className='text-muted'>This projectId should be in your <code>cypress.json</code> and checked into source control.
          It identifies your project and should not be changed.
        </p>
        <pre className='line-nums'>
          <span>{`{`}</span>
          <span>{`  "projectId": "${this.props.project.id || '<projectId>'}"`}</span>
          <span>{`}`}</span>
        </pre>
      </Panel>
    )
  }

  _keysSection () {
    if (this._notSetupForCi()) return null

    return (
      <Panel header='Record Key' key='record-keys' className='form-horizontal config-record-keys'>
        <a href='#' className='learn-more' onClick={this._openCiGuide}>
          <i className='fa fa-info-circle'></i>{' '}
          Learn More
        </a>
        <p className='text-muted'>
          A Record Key enables you to record your failing tests, screenshots, and videos.
        </p>
        {this._hasKeys() ?
          <div>
            <p className='text-muted'>
              To record, run this command:
            </p>
            <p>
              <pre><code>cypress run --key {this.state.keys[0].id}</code></pre>
            </p>
          </div>
        : null}
        {this._recordKeys()}
        <p className='text-muted manage-btn'>
          <a href='#' onClick={this._openAdminKeys}>
            <i className='fa fa-key'></i> You can change this key in the Dashboard
          </a>
        </p>
      </Panel>
    )
  }

  _hasKeys () {
    return !this.state.isLoadingKeys && this.state.keys.length
  }

  _notSetupForCi () {
    return !this.props.project.id || !this.props.project.isValid
  }

  _recordKeys = () => {
    if (this.state.isLoadingKeys) {
      return (
        <p className='loading-record-keys'>
          <i className='fa fa-spinner fa-spin'></i>{' '}
          Loading Keys...
        </p>
      )
    }

    return null
  }

  _openProjectIdHelp (e) {
    e.preventDefault()
    App.ipc('external:open', 'https://on.cypress.io/guides/projects#section-what-is-a-projectid-')
  }

  _openHelp (e) {
    e.preventDefault()
    App.ipc('external:open', 'https://on.cypress.io/guides/configuration')
  }

  _openCiGuide (e) {
    e.preventDefault()
    App.ipc('external:open', 'https://on.cypress.io/guides/continuous-integration')
  }

  _openAdminKeys = (e) => {
    e.preventDefault()
    App.ipc('external:open', `https://on.cypress.io/dashboard/projects/${this.props.project.id}/settings`)
  }
}

export default Config
