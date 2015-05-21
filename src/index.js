const React = require('react');
const sparkFactory = require('./spark');
const _ = require('lodash');

const Foo = React.createClass({
  render() {
    return <div {...this.props}>{this.props.children}</div>
  }
});

function factory(options) {

  const proxyElements = {};
  const spark = sparkFactory(options);
  const {
    invalidate,
    enableInvalidationInterval,
    disableInvalidationInterval
    } = spark;

  const sparkScrollFactory = defaultComponent => React.createClass({
    displayName: 'SparkScroll' + (_.isString(defaultComponent) ? defaultComponent : defaultComponent.displayName),

    render () {
      var Component = this.props.component || defaultComponent;
      return (
        <Component {...this.props}>{this.props.children}</Component>
      );
    },

    componentDidMount() {
      var element = React.findDOMNode(this);

      if (this.props.proxy) {
        spark(
          element,
          () => proxyElements[this.props.proxy] || element,
          this.props.timeline,
          this.props);
      } else {
        spark(element, () => element, this.props.timeline, this.props);
      }
    }
  });

  const SparkScroll = sparkScrollFactory('div');
  SparkScroll.div = SparkScroll;

  const sparkProxyFactory = defaultComponent => React.createClass({
    displayName: 'SparkProxy.' + (_.isString(defaultComponent) ? defaultComponent : defaultComponent.displayName),

    render () {
      var Component = this.props.component || defaultComponent;
      return (
        <Component {...this.props}>{this.props.children}</Component>
      );
    },

    componentDidMount() {
      proxyElements[this.props.proxyId] = React.findDOMNode(this);
    },

    componentWillUnmount() {
      delete proxyElements[this.props.proxyId];
    }
  });

  const SparkProxy = sparkProxyFactory('div');
  SparkProxy.div = SparkProxy;

  ['span','h1','h2','h3','h4','h5','li','ul','ol','header','section']
    .forEach( tag => {
      SparkScroll[tag] = sparkScrollFactory(tag);
      SparkProxy[tag] = sparkProxyFactory(tag)
    });

  return {
    sparkScrollFactory,
    sparkProxyFactory,
    SparkScroll,
    SparkProxy,
    invalidate,
    enableInvalidationInterval,
    disableInvalidationInterval
  };
}

module.exports = factory;
