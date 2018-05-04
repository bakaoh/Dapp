import { Col, Form, Icon, Input, Row, Popover } from 'antd';
import React, { Component } from 'react';
import Rx from 'rxjs/Rx';

const FormItem = Form.Item;

class GasPriceField extends Component {
  constructor(props) {
    super(props);
    var gasLimitEstimate = 21000;
    if (
      this.props.location &&
      this.props.location.pathname.indexOf('/test') !== -1
    ) {
      gasLimitEstimate = 200000;
    }
    if (
      this.props.location &&
      this.props.location.pathname.indexOf('/contract/deploy') !== -1
    ) {
      gasLimitEstimate = 5700000;
    }
    this.state = {
      gaslimit: gasLimitEstimate,
      gasprice: 2,
      condition: null,
      message: this.getMessage(null, gasLimitEstimate, 2)
    };
    this.updateNetworkCondition = this.updateNetworkCondition.bind(this);
  }

  onInputChange(e) {
    if (isNaN(e.target.value)) return;
    const price = parseFloat(e.target.value);
    this.setState({
      gasprice: price,
      message: this.getMessage(this.state.condition, this.state.gaslimit, price)
    });
    if (this.props.onChange) {
      this.props.onChange(price);
    }
  }

  updateNetworkCondition(data) {
    this.setState({
      condition: data,
      message: this.getMessage(data, this.state.gaslimit, this.state.gasprice)
    });
  }

  getTime(condition, price) {
    var time = -1;
    if (!condition) return time;
    if (price * 10 >= condition.fastest) {
      time = condition.fastestWait;
    } else if (price * 10 >= condition.fast) {
      time = condition.fastWait;
    } else if (price * 10 >= condition.average) {
      time = condition.avgWait;
    } else if (price * 10 >= condition.safeLow) {
      time = condition.safeLowWait;
    }
    return time;
  }

  getMessage(condition, gasLimit, gasPrice) {
    const time = this.getTime(condition, gasPrice);
    const cost = gasLimit * gasPrice / 1000000000;
    var message = !condition
      ? `The following MetaMask settings will cost ${cost} ETH, the confirmation time depends on the overall network traffic`
      : time >= 0
        ? `The following MetaMask settings should give a ${time} min confirmation for ${cost} ETH`
        : `The gas price is below the market low safe price (currently about ${condition.safeLow /
        10} gwei), your transaction might take forever to get confirmed`;
    return message;
  }

  componentDidMount() {
    const gasInfoUrl = 'https://ethgasstation.info/json/ethgasAPI.json';
    this.subscription = Rx.Observable.ajax({
      url: gasInfoUrl,
      method: 'GET',
      responseType: 'json',
      crossDomain: true
    })
      .map(data => data.response)
      .subscribe(this.updateNetworkCondition);
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    return (
      <Row>
        <Col>
          <h2>Gas Setting</h2>
          <div>{this.state.message}</div>
          <br />
          <Row gutter={16}>
            <Col lg={12} xs={24}>
              <FormItem
                label={
                  <span>
                    Gas Limit (units){' '}
                    <Popover
                      content="Gas limit is how many cycles (think opcodes) your transaction will take"
                      title="More about `Gas Limit`"
                      trigger="click"
                    >
                      <Icon
                        type="question-circle-o"
                        style={{ cursor: 'pointer' }}
                      />
                    </Popover>
                  </span>
                }
              >
                <Input
                  type="number"
                  min="0"
                  id="gasLimit"
                  placeholder="Gas Limit (units)"
                  value={this.state.gaslimit}
                  disabled
                />
              </FormItem>
            </Col>
            <Col lg={12} xs={24}>
              <FormItem
                label={
                  <span>
                    Gas Price (gwei){' '}
                    <Popover
                      content="Gas price is how much ETH you’re willing to pay per cycle"
                      title="More about `Gas Price`"
                      trigger="click"
                    >
                      <Icon
                        type="question-circle-o"
                        style={{ cursor: 'pointer' }}
                      />
                    </Popover>
                  </span>
                }
              >
                {this.props.form ? (
                  this.props.form.getFieldDecorator('gasPrice', {
                    initialValue: this.state.gasprice
                  })(
                    <Input
                      type="number"
                      min={0}
                      onChange={this.onInputChange.bind(this)}
                      placeholder="Gas Price (gwei)"
                    />
                  )
                ) : (
                    <Input
                      type="number"
                      min={0}
                      onChange={this.onInputChange.bind(this)}
                      placeholder="Gas Price (gwei)"
                      value={this.state.gasprice}
                    />
                  )}
              </FormItem>
            </Col>
          </Row>
          <div>
            <strong>Help:</strong>
            <ul>
              <li>
                <a
                  href="https://www.cryptocompare.com/coins/guides/what-is-the-gas-in-ethereum/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Why do I need metamask / gas?
                </a>
              </li>
              <li>
                <a
                  href="https://etherscan.io/gastracker"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  What gas price should I use?
                </a>
              </li>
              <li>
                <a
                  href="https://ethgasstation.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  What are current network conditions?
                </a>
              </li>
            </ul>
          </div>
          <br />
        </Col>
      </Row>
    );
  }
}

export default GasPriceField;
