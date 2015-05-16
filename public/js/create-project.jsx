$("#members").popover({
	html: true,
	title: 'Members',
	content: '<div id="popover"></div>',
	placement: 'bottom',
	trigger: 'manual',
}).popover('show');

var SelectedUsers = React.createClass({
	render: function() {
		var users = this.props.users;
		var userNodes = this.props.selectedUsers.map(function(user) {
			var fullUser = users.filter(function(otherUser) {
				return otherUser._id == user;
			})[0];
			return (<div>{fullUser.fname}</div>)
		});
		console.log(userNodes);
		return(<div>{userNodes}</div>);
	}
})

var MemberInput = React.createClass( {
	getInitialState: function() {
		return {
            users: [], filter: '', selectedUsers: []
        };
	},
	selectUser: function(user) {
		var selectedUsers = this.state.selectedUsers;
		if (selectedUsers.indexOf(user) == -1) {
			var newArray = React.addons.update(selectedUsers, {
				$push: [user]
			})

			this.setState({selectedUsers: newArray});
		}
	},
	componentDidUpdate: function() {
		var selectUser = this.selectUser;
    	var users = this.state.users;
    	var filter = this.state.filter.toLowerCase();
    	var results = 5;
		var memberNodes = users.filter(function(user){
			var name = user.fname + " " + user.lname;
			return !filter || user.fname.toLowerCase().indexOf(filter) == 0 ||
			user.lname.toLowerCase().indexOf(filter) == 0 || name.toLowerCase().indexOf(filter) == 0;
		})
		.map(function(user) {
			return (<a id={user._id}><li className="list-group-item">{user.fname} {user.lname}</li></a>);
		}.bind(this)).slice(0, results);

		$("#popover").html(React.renderToString(<ul>{memberNodes}</ul>));
		$("#popover a").click(function() {
			selectUser($(this).attr('id'));
		})
	},
	 componentDidMount: function() {
    	$.ajax({
    		url: this.props.url,
    		dataType: 'json',
            cache: false,
            success: function(data) {
            	this.setState({
            		users: data.users
            	});
            	$('#memberInput').keyup(this, function(event) {
        			event.data.setState({
        				filter: $(this).val(),
        			});;
            	});
            }.bind(this),
            error: function(xhr, status, err) {
            	console.error(this.props.url, status, err.toString());
            }.bind(this)
    	});
    },
    render: function() {
		return (
			<div>
			<SelectedUsers selectedUsers={this.state.selectedUsers} users={this.state.users}></SelectedUsers>
			<input id="memberInput" name="collaborators" type="text"/>
			<button onClick={this.submitForm} type="submit" className="btn btn-primary">Submit</button>
			</div>
		);
    }
})

React.render(
    <MemberInput url="/api/users"/>,
    document.getElementById('members')
);