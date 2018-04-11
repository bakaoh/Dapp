import { Form, Icon, Select, Popover } from 'antd';
import React from 'react';
import Rx from 'rxjs/Rx';

const FormItem = Form.Item;
const Option = Select.Option;

const Hint = (props) => (<Popover content={props.hint} title={"More about `" + props.hintTitle + "`"} trigger="click">
  <Icon type="question-circle-o" style={{ cursor: 'pointer' }} />
</Popover>);

class SelectTokenField extends React.Component {

  constructor() {
    super();
    this.state = { pairs: [] };
    this.updateList = this.updateList.bind(this);
  }

  updateList(symbols) {
    this.setState({ pairs: symbols.filter(symbol => symbol.quoteAsset === "ETH" ) });
  }

  componentDidMount() {
    const binanceInfoUrl = "http://128.199.206.130/api/v1/exchangeInfo";
    Rx.Observable.ajax({ url: binanceInfoUrl, method: 'GET', responseType: 'json' })
      .map(data => data.response.symbols)
      .subscribe(this.updateList);
  }

  render() {
    const { name, form, initialValue, showHint } = this.props;
    const { getFieldDecorator } = form;
    const fieldSettings = {
      label: 'Select ETH based pair',
      extra: 'Available ETH based pairs from Binance',
    };

    const rules = [
      {
        required: true, message: 'Please select a token pairs',
      }
    ];
    const label = (<span>{fieldSettings.label} {showHint && <Hint hint={fieldSettings.extra} hintTitle={fieldSettings.label} />}</span>);
    return (
      <FormItem
        label={label}
      >

        {getFieldDecorator(name, {
          initialValue,
          rules,
        })(
          <Select>
            {this.state.pairs.map(symbol =>
              <Option key={symbol.symbol} value={symbol.symbol}>{symbol.baseAsset} / {symbol.quoteAsset}</Option>)}
          </Select>
        )}
      </FormItem>
    );
  }
}

export default SelectTokenField;
