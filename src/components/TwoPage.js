import $ from 'jquery';
import React, { Component } from 'react';

const style = {
	position: 'relative',
	top: 0,
	left: 0,
	float: 'left'
};


export class TwoPage extends Component {
	componentWillReceiveProps(next) {
		if(next.showSecondary && !this.props.showSecondary) {
			/*// Secondary incoming
			$( '#secondaryPane' ).show(() => {
				$( '#secondaryPane' ).animate({
					left: 0,
				}, 250);
			});

			$( '#primaryPane' ).animate({
				left: -$('#primaryPane').width(),
			}, 250, () => {$( '#primaryPane' ).hide();});
		} else if(!next.showSecondary && this.props.showSecondary) {
			// Primary incoming
			$( '#secondaryPane' ).animate({
				left: -$('#secondaryPane').width(),
			}, 250, () => {$( '#secondaryPane' ).hide();});

			$( '#primaryPane' ).show(() => {
				$( '#primaryPane' ).animate({
					left: 0,
				}, 250);
			});*/
		}
	}


	render() {
		let secondary = (
			<div id="secondaryPane" style={style}>
				{this.props.secondaryPane}
			</div>
		);
		let primary = (
			<div id="primaryPane" style={style}>
				{this.props.primaryPane}
			</div>
		);

		return this.props.showSecondary ? secondary : primary;
	}
}
