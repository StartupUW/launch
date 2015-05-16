// $('#members').popover({
// 	html: true,
// 	content: React.renderToString(<div id="popover"></div>),
// 	placement: 'bottom',
// 	trigger: 'manual'

// }).popover('show');




// var MemList=React.createClass({
// 	 getInitialState: function(){
// 	 	return{
// 	 		users: [], filter: ''
// 	 	};
// 	 },
// 	componentDidMount: function() {
//         $.ajax({
// 	 		url: this.props.url,
// 	 		dataType: 'json',
// 	 		cache: false,
// 	 		success: function(data){
// 	 			this.setState({
// 	 				users: data.users
// 	 			});
// 	 			$('#members').keyup(this, function(event) {
// 	 				event.data.setState({
// 	 					filter: $(this).val()
// 	 				});
// 	 			});
// 	 		}.bind(this),
// 	 		error: function(xhr, status, err){
// 	 			console.error(this.props.url, status, err.toString());
// 	 		}.bind(this)
// 	 	});
//     },
// 	render: function() {
// 	 	var users = this.state.users;
// 	 	var filter=this.state.filter.toLowerCase();
// 	 	var memLimit = 5;
// 	 	var memNodes = users.filter(function(user){
// 	 		var name = user.fname + ' ' + user.lname;
// 	 		return !filter || user.fname.toLowerCase().indexOf(filter) == 0||
// 	 		user.lname.toLowerCase().indexOf(filter) == 0||
// 	 		name.toLowerCase().indexOf(filter) == 0;
// 	 	})
	 	
// 	 	console.log('memNodes');

// 	 	memNodes = memNodes
// 	 		.map(function(user){
// 	 			return(
// 	 				<li classname='list-group-item'>{user.fname} {user.lname}</li>);
// 	 		}.bind(this))
// 	 		.slice(0,memLimit);
	 	
// 	 	//if(memNodes.length != 0){
// 	 		//if($('#members').is(':focus')){
// 	 			return(
// 	 				<div data-toggle="popover">
// 	 					<ul>{memNodes}</ul>
// 	 				</div>
// 	 			);
// 	 		//}
// 	 	//}
// 	 	//return (<div><h1>No users found</h1></div>);
// 	 }

// });

// React.render(
// 	//<MemList url="/api/members"/>,
// 	//document.getElementById('popover')
// );