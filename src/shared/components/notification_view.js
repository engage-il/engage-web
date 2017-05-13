// @flow
import React, { Component } from 'react'
import { css } from 'glamor'
import { notifications } from '../notifications'
import type { Notification } from '../notifications' // eslint-disable-line
import { sleep } from 'shared/async'
import { stylesheet, colors, borders, shadows } from 'shared/styles'

const animationDuration = 300

export class NotificationView extends Component {
  state: { isHidden: boolean, notification: ?Notification } = {
    isHidden: true,
    notification: null
  }

  // events
  didReceiveNotification = async (notification: Notification) => {
    const { notification: current } = this.state
    if (current) {
      return
    }

    this.setState({ notification, isHidden: false })
    await sleep(2000)
    this.setState({ isHidden: true })
    await sleep(animationDuration)
    this.setState({ notification: null })
  }

  didDismissNotification = () => {
    this.setState({ notification: null })
  }

  // lifecycle
  componentDidMount () {
    notifications.on(this.didReceiveNotification)
  }

  componentWillUnmount () {
    notifications.off()
  }

  render () {
    const { notification, isHidden } = this.state
    return <div {...css(rules.notification, !isHidden && rules.visible)}>
      {notification && notification.message}
    </div>
  }
}

const rules = stylesheet({
  notification: {
    ...borders.low(),
    ...shadows.low,
    position: 'absolute',
    bottom: 30,
    right: -230,
    width: 200,
    padding: 15,
    borderRadius: 3,
    color: colors.black,
    backgroundColor: colors.backgroundAccent,
    transition: `right ${animationDuration}ms cubic-bezier(0.645, 0.045, 0.355, 1)`
  },
  visible: {
    right: 30
  }
})