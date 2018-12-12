import React from 'react'
import PropTypes from 'prop-types'
import Transition from 'react-transition-group/Transition'
import styled, { keyframes } from 'styled-components'

import Alert from '../Alert'

const animationEasing = {
  deceleration: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
  acceleration: 'cubic-bezier(0.4, 0.0, 1, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.320, 1.175)',
}

const ANIMATION_DURATION = 240

const openAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateY(-120%);
  }

  to {
    transform: translateY(0);
  }
`

const closeAnimation = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }

  to {
    transform: scale(0.9);
    opacity: 0;
  }
`

const ToasterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 0;
  transition: all ${ANIMATION_DURATION}ms ${animationEasing.deceleration};

  &[data-state='entering'],
  &[data-state='entered'] {
    animation: ${openAnimation} ${ANIMATION_DURATION}ms
      ${animationEasing.spring} both;
  }

  &[data-state='exiting'] {
    animation: ${closeAnimation} 120ms ${animationEasing.acceleration} both;
  }
`

export default class Toast extends React.PureComponent {
  static propTypes = {
    /**
     * The z-index of the toast.
     */
    zIndex: PropTypes.number,

    /**
     * Duration of the toast.
     */
    duration: PropTypes.number,

    /**
     * Function called when the toast is all the way closed.
     */
    onRemove: PropTypes.func,

    /**
     * The type of the alert.
     */
    color: PropTypes.oneOf(['green', 'red']),

    /**
     * The title of the alert.
     */
    title: PropTypes.node,

    /**
     * Description of the alert.
     */
    children: PropTypes.node,

    /**
     * When false, will close the Toast and call onRemove when finished.
     */
    isShown: PropTypes.bool,
  }

  static defaultProps = {}

  state = {
    isShown: true,
    height: 0,
  }

  componentDidMount() {
    this.startCloseTimer()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isShown !== this.props.isShown) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        isShown: this.props.isShown,
      })
    }
  }

  componentWillUnmount() {
    this.clearCloseTimer()
  }

  close = () => {
    this.clearCloseTimer()
    this.setState({
      isShown: false,
    })
  }

  startCloseTimer = () => {
    if (this.props.duration) {
      this.closeTimer = setTimeout(() => {
        this.close()
      }, this.props.duration * 1000)
    }
  }

  clearCloseTimer = () => {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer)
      this.closeTimer = null
    }
  }

  handleMouseEnter = () => {
    this.clearCloseTimer()
  }

  handleMouseLeave = () => {
    this.startCloseTimer()
  }

  onRef = ref => {
    if (ref === null) return

    const { height } = ref.getBoundingClientRect()

    this.setState({
      height,
    })
  }

  render() {
    return (
      <Transition
        appear
        unmountOnExit
        timeout={ANIMATION_DURATION}
        in={this.state.isShown}
        onExited={this.props.onRemove}
      >
        {state => (
          <ToasterContainer
            data-state={state}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
            style={{
              height: this.state.height,
              zIndex: this.props.zIndex,
              marginBottom: this.state.isShown ? 0 : -this.state.height,
            }}
          >
            <div ref={this.onRef} style={{ padding: 8 }}>
              <Alert
                hasIcon
                color={this.props.color}
                title={this.props.title}
                onRemove={() => this.close()}
                pointerEvents="all"
              >
                {this.props.children}
              </Alert>
            </div>
          </ToasterContainer>
        )}
      </Transition>
    )
  }
}
