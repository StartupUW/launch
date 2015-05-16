

var Tags=React.createClass({
	getInitialState: function(){
		return{
			tagNames: [], indName: ''
		};
	},
	componentDidMount: function(){
		$('#inputTags').keyup(this, function(event){
			var tagNames = event.data.state.tagNames;
			var val = $(this).val();
			var newArray = [];
			if(val[val.length-1] == ' '){
				newArray = React.addons.update(tagNames, {$push: [val.substr(0,val.length-1)]});
				val = '';
				event.data.setState({
					indName: val,
					tagNames: newArray
					
				});
				$(this).val('');
			}	
		});
	},
	render: function(){
		var tagNames = this.state.tagNames;
		var indName = this.state.indName;

		var tagNodes = tagNames.map(function(tag) {
			return (<li>{tag}</li>);
		});
		console.log(tagNodes);
		return(
			<div>
			<ul>{tagNodes}</ul>
			</div>
			);
	}
});

React.render(
	<Tags/>,
	document.getElementById('tags')
	);