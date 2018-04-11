/**
 * Steps for use by GuidedDeployment.
 *
 */
import { Alert, Button, Card, Col, Form, Icon, Row } from 'antd';
import moment from 'moment';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Loader from '../Loader';
import Field, { FieldSettings } from './DeployContractField';
import SelectTokenField from './SelectTokenField';
import DeployContractSuccess from './DeployContractSuccess';

const ButtonGroup = Button.Group;

function BiDirectionalNav(props) {
  return (<ButtonGroup>
    <Button type="default" onClick={props.onPrevClicked}>
      <Icon type="left"/>Back
    </Button>
    <Button type="primary" htmlType="submit">
      {props.text}<Icon type="right"/>
    </Button>
  </ButtonGroup>);
}

class BaseStepComponent extends Component {
  /**
   * Validates form and updates Deployment State
   *
   * @param {*} e
   */
  handleSubmit(e) {
    e.preventDefault();

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      const timestamp = fieldsValue['expirationTimeStamp'] ?
        {expirationTimeStamp: Math.floor(fieldsValue['expirationTimeStamp'].valueOf() / 1000)}
        : {};
      this.props.updateDeploymentState({
        ...fieldsValue,
        ...timestamp
      });
      this.props.onNextClicked();
    });
  }
}

/**
 * First step in the guided contract.
 * It displays two fields. First to collect name of the contract and
 * second to collect the base address.
 *
 */
class NameContractStep extends BaseStepComponent {

  render() {
    const contractNameSettings = FieldSettings.contractName;
    const baseTokenSettings = FieldSettings.baseTokenAddress;
    return (<div>
      <Form onSubmit={this.handleSubmit.bind(this)} layout="vertical">
        <h1>Contract Name and Collateral Token</h1>
        <div>
          MARKET allows users to create user defined derivative contracts by outlining the needed specifications.
          This guide will walk you through creating a contract and the important variables.
        </div>
        <br/>
        <h2>Contract Name</h2>
        <div>
          The contract name should be as descriptive as possible capturing the underlying asset relationship
          as well as possibly the expiration. Something like "<b>{contractNameSettings.initialValue}</b>" may
          help others understand the underlying asset, the data source, and expiration date in a nice
          human readable and searchable way.
          <br/>
          <br/>
          In the future, MARKET will implement a standardized naming convention and guidelines to formalize this process

          <br/>
          <br/>
          Example name <b>ETH/BTC-Kraken_2018-03-01</b>
        </div>
        <br/>
        <Field name='contractName'
               initialValue={this.props.contractName}
               form={this.props.form}/>
        <h2>Collateral Token</h2>
        <div>
          Next, every contract should be backed by an ERC20 Token that will be used a collateral for the contract.
          Traders must deposit tokens to the smart contract prior to trading, and upon execution of a trade, the
          appropriate amount of collateral becomes locked until that position is exited. In this fashion, all open
          positions always remain 100% collateralized removing counter party risk from the traders.
          Please specify a ERC20 Token address for this contract.

          <br/>
          <br/>
          In the future, users will be able to easily select from well known ERC20 tokens to ensure more safety and
          avoid dealing with long addresses.

          <br/>
          <br/>
          Example address <b>{baseTokenSettings.initialValue}</b>
        </div>
        <br/>
        <Field name='baseTokenAddress'
               initialValue={this.props.baseTokenAddress}
               form={this.props.form}/>
        <Row type="flex" justify="end">
          <Col>
            <BiDirectionalNav text="Select Oracle" {...this.props} />
            {/* <BiDirectionalNav text="Deploy Contract" {...this.props} /> */}
          </Col>
        </Row>
      </Form>
    </div>);
  }
}

NameContractStep = Form.create()(NameContractStep);

/**
 * Step for Setting Price Cap and floor
 *
 */
class PricingStep extends BaseStepComponent {

  render() {
    return (<div>
      <Form onSubmit={this.handleSubmit.bind(this)} layout="vertical">
        <h1>Specify Pricing Rules</h1>
        <div>
          The Price Floor and Cap define the range of a contract.  If an oracle reports a price
          above a Cap or below a Floor the contract will enter settlement and no longer trade. Additionally, these
          parameters define a participants maximum loss when entering a trade and therefore the amount collateral that
          must be posted.
          <br/>
          <br/>
          <h3>
            All prices must in an integer format (e.g 1245, not 12.45),
            floating point values (decimals), are not currently supported by Ethereum.
          </h3>
        </div>
        <br/>

        <h2>Price Decimal Places</h2>
        <div>
          Ethereum currently does not support floating points numbers. Therefore all prices reported by oracles must
          be converted to a whole number (integer). This variable is how many decimal places one needs to move the
          decimal in order to go from the oracle query price to an integer. For example,
          if the oracle query results returned a value of 190.22, we need to move the
          decimal two (2) places to convert to a whole number of 19022, so we would enter 2 below.
        </div>
        <br/>
        <Field name='priceDecimalPlaces'
               initialValue={this.props.priceDecimalPlaces}
               form={this.props.form}/>

        <h2>Price Floor</h2>
        <div>
          This is the lower bound of price exposure this contract will trade. If the oracle reports a price below this
          value the contract will enter into settlement. This should also be represented as a whole number. If we take
          the example above of a price of 190.22 and decide the Floor for our contract
          should be 150.00, we would enter 15000 here.
        </div>
        <br/>
        <Field name='priceFloor'
               initialValue={this.props.priceFloor}
               form={this.props.form}/>

        <h2>Price Cap</h2>
        <div>
          This is the upper bound of price exposure this contract will trade. If the oracle reports a price above this
          value the contract will enter into settlement. Following our example, if we decide the Cap for our contract
          should be 230.00, we would enter 23000 as our Cap.
        </div>
        <br/>
        <Field name='priceCap'
               initialValue={this.props.priceCap}
               form={this.props.form}/>

        <h2>Price Quantity Multiplier</h2>
        <div>
          The quantity multiplier allows the user to specify how many base units (for Ethereum, this would be wei) each
          integer price movement changes the value of the contract. If our integerized price was 19022 with a qty
          multiplier of 1, and the price moved to 19023, then the value will have change by 1 wei. If however the
          multiplier was set at 1,000,000,000 the price movement of 1 unit would now
          correspond to a value of 1 gwei (not wei).
          Please see <a href="https://etherconverter.online/" target="_blank" rel="noopener noreferrer"> here </a> for
          an ethereum unit converter.
        </div>
        <br/>
        <Field name='qtyMultiplier'
               initialValue={this.props.qtyMultiplier}
               form={this.props.form}/>
        <Row type="flex" justify="end">
          <Col>
            <BiDirectionalNav text="Set Expiration Time" {...this.props} />
          </Col>
        </Row>
      </Form>
    </div>);
  }
}

PricingStep = Form.create()(PricingStep);

/**
 * Step for setting the expiration time for the contract
 *
 */
class ExpirationStep extends BaseStepComponent {

  render() {
    return (<div>
      <Form onSubmit={this.handleSubmit.bind(this)} layout="vertical">
        <h1>Set Expiration Time</h1>
        <div>
          Upon reaching the expiration timestamp all open positions will settle against the final price query
          returned by the oracle.
        </div>
        <br/>
        <Field name='expirationTimeStamp'
               initialValue={this.props.expirationTimeStamp ? moment(this.props.expirationTimeStamp * 1000) : ''}
               form={this.props.form}/>
        <Row type="flex" justify="end">
          <Col>
            <BiDirectionalNav text="Deploy Contract" {...this.props} />
          </Col>
        </Row>
      </Form>
    </div>);
  }
}

ExpirationStep = Form.create()(ExpirationStep);

/**
 * Step to select the Oracle Data source and the query frequency for the contract
 *
 */
class DataSourceStep extends BaseStepComponent {

  render() {
    const {initialValues} = this.props;
    return (<div>
      <Form onSubmit={this.handleSubmit.bind(this)} layout="vertical">
        <h1>Set Oracle Data Source</h1>
        <div>
          Currently, Oraclize.it offers several different options for their data source. If you need help creating
          a proper oracle query, or availabe data sources please refer
          to the <a href="/test" target="_blank">Test Query</a> page.
        </div>
        <br/>
        <h2>Select Data Source</h2>
        <div>
          Available data sources from Oraclize.it
        </div>
        <br/>
        <Field name='oracleDataSource'
               initialValue={this.props.oracleDataSource || initialValues.oracleDataSource}
               form={this.props.form}/>

        <h2>Oracle Query</h2>
        <div>
          Properly structured Oraclize.it query, Please use
          the <a href="/test" target="_blank">Test Query</a> page for clarification.
        </div>
        <br/>
        <Field name='oracleQuery'
               initialValue={this.props.oracleQuery || initialValues.oracleQuery}
               form={this.props.form}/>

        <Row type="flex" justify="end">
          <Col>
            <Button type="primary" htmlType="submit">
              Set Pricing Range<Icon type="arrow-right"/>
            </Button>
          </Col>
        </Row>
      </Form>
    </div>);
  }
}

DataSourceStep = Form.create()(DataSourceStep);

/**
 * Final Step for showing deploy status of Contract
 * and possible a summary of the deployed contract on success.
 *
 */
class DeployStep extends BaseStepComponent {
  componentWillReceiveProps(nextProps) {
    if (this.props.loading && !nextProps.loading) {
      if (nextProps.error) {
        // We had an error
        this.props.showErrorMessage(`There was an error deploying the contract: ${nextProps.error}`, 8);
      } else if (nextProps.contract) {
        // Contract was deployed
        this.props.showSuccessMessage(DeployContractSuccess({contract: nextProps.contract}), 5);
      }
    }
  }

  componentDidMount() {
    this.props.deployContract();
  }

  render() {
    return (<div style={{padding: '30px'}}>
      <Row type="flex" justify="center">
        <Col lg={{span: 16}} sm={{span: 24}} xs={{span: 24}}>
          <Card title="Deployment Status" style={{width: '100%'}}>
            <Loader loading={this.props.loading}/>
            {this.props.contract && <div className="result">
              <div>
                Congratulations!!! Your contract has successfully deployed at: <a
                href={`https://etherscan.io/address/${this.props.contract.address}`} target="_blank">
                {this.props.contract.address}
              </a>
              </div>
            </div>}
            {!this.props.loading && this.props.error && <Alert message={`${this.props.error}`} type="error"/>}
          </Card>
        </Col>
      </Row>
      <br/>
      <Row type="flex" justify="center">
        <Col>
          {this.props.contract && <Link to="/contract/explorer"><Button type="primary">
            Explore All Contracts
          </Button>
          </Link>}
        </Col>
      </Row>
    </div>);
  }
}

/**
 * Step to select the token using drop down menus 
 *
 */
class SelectTokenStep extends BaseStepComponent {

  render() {
    return (<div>
      <Form onSubmit={this.handleSubmit.bind(this)} layout="vertical">
        <h1>Select ETH based pair</h1>
        <div>
          Available ETH based pairs from Binance
        </div>
        <br />
        <SelectTokenField name='tokenPair'
          form={this.props.form} />

        <Row type="flex" justify="end">
          <Col>
            <BiDirectionalNav text="Select Oracle" {...this.props} />
          </Col>
        </Row>
      </Form>
    </div>);
  }
}

SelectTokenStep = Form.create()(SelectTokenStep);

export {NameContractStep, PricingStep, ExpirationStep, DataSourceStep, DeployStep, SelectTokenStep};
