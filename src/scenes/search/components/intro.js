// @flow
import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { css } from 'glamor'
import type { Rule } from 'glamor' // eslint-disable-line
import { BillAnimation } from './bill_animation'
import { Link } from 'shared/components'
import { get, set } from 'shared/storage'
import { stylesheet, borders, fonts, mobile } from 'shared/styles'

export class Intro extends Component {
  props: {
    styles?: Rule
  }

  state = {
    isAccepted: false
  }

  // events
  didClickAccept = () => {
    this.setState({ isAccepted: true }, () => {
      set('visited-intro', 'true')
    })
  }

  // lifecycle
  render () {
    const isVisited = !!get('visited-intro')
    return isVisited ? null : <BillAnimation>{this.renderContent()}</BillAnimation>
  }

  renderContent (): ?React$Element<*> {
    if (this.state.isAccepted) {
      return null
    }

    const { styles } = this.props

    return <div {...css(rules.intro, styles)}>
      <h1>Hey, welcome to Legislated!</h1>
      <p>
        Never heard of a witness slip? As a resident of Illinois, it's a tool
        that allows you to voice your opinion on the laws your representatives
        write. Search for a bill you care about and let the legislature know
        how you feel. <strong>Want to learn more?</strong>
        <span {...rules.actionLinks}>
          <Link to='/faq'>Visit our FAQs</Link>
          <Link styles={rules.accept} onClick={this.didClickAccept}>
            <FontAwesome name='check' />
            <span>Got it.</span>
          </Link>
        </span>
      </p>
    </div>
  }
}

const rules = stylesheet({
  intro: {
    fontSize: 18,
    '> h1': {
      marginBottom: 15
    }
  },
  actionLinks: {
    marginLeft: 10,
    ...mobile({
      display: 'block',
      marginTop: 10,
      marginLeft: 0
    })
  },
  accept: {
    ...borders.low(['left']),
    marginLeft: 10,
    paddingLeft: 10,
    '> *:last-child': {
      marginLeft: 5
    }
  }
})
