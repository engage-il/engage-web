// @flow
import React, { Component } from 'react'
import Relay from 'react-relay'
import moment from 'moment'
import { throttle } from 'lodash'
import { Intro, SearchField, BillsList, LoadingIndicator } from './components'
import { stylesheet, utils } from 'shared/styles'
import type { Viewer, RelayProp } from 'shared/types'

const pageSize = 25

class SearchView extends Component {
  props: {
    viewer: ?Viewer,
    relay: ?RelayProp
  }

  state = {
    query: '',
    isFiltering: false
  }

  // events
  didClickLoadMore = () => {
    const { relay } = this.props
    relay && relay.setVariables({ first: relay.variables.first + pageSize })
  }

  searchFieldDidChange = (query: string) => {
    this.setState({ query })
    this.filterBillsForQuery(query)
  }

  filterBillsForQuery = throttle((query: string) => {
    const { relay } = this.props
    if (!relay) {
      return
    }

    this.setState({ isFiltering: true })
    relay && relay.setVariables({ query }, (readyState) => {
      if (readyState.done) {
        requestAnimationFrame(() => {
          this.setState({ isFiltering: false })
        })
      }
    })
  }, 300)

  // lifecycle
  render () {
    const { query, isFiltering } = this.state
    const { viewer, relay } = this.props

    return <div {...rules.container}>
      <Intro styles={rules.section} />
      <SearchField
        styles={rules.section}
        value={query}
        onChange={this.searchFieldDidChange} />
      <div {...rules.content}>
        <div {...rules.indicator}>
          <LoadingIndicator isLoading={!viewer} />
        </div>
        {viewer && relay && <BillsList
          bills={viewer.bills}
          animated={!isFiltering}
          onLoadMore={this.didClickLoadMore} />}
      </div>
    </div>
  }
}

const rules = stylesheet({
  container: {
    ...utils.column
  },
  section: {
    marginBottom: 30
  },
  content: {
    ...utils.column,
    position: 'relative'
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    ...utils.column
  }
})

export const SearchScene = Relay.createContainer(SearchView, {
  initialVariables: {
    first: pageSize,
    query: '',
    startDate: '',
    endDate: ''
  },
  prepareVariables: (previousVariables) => {
    return {
      ...previousVariables,
      startDate: moment().startOf('day'),
      endDate: moment().add(6, 'days').endOf('day')
    }
  },
  fragments: {
    viewer: (variables) => Relay.QL`
      fragment on Viewer {
        bills(first: $first, from: $startDate, to: $endDate, query: $query) {
          ${BillsList.getFragment('bills')}
        }
      }
    `
  }
})