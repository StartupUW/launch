var ProjectForm = React.createClass({
	getInitialState: function() {
		return ({ tags: [], members: [], formErrors: {}});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		data = {};
		errors = {};

		$('#create-form :input').each(function() {
			if (this.type == "checkbox") {
				data[this.name] = this.checked;
			} else if (this.value && this.name) {
				data[this.name] = this.value
			}
		})

		data.tags = this.state.tags;
		data.members = this.state.members;

		if (!data.name) {
			errors.name = 'Project name is required';
			errors.hasErrors = true;
		}
		if (!data.description) {
			errors.description = 'Project description is required';
			errors.hasErrors = true;
		}
		if (!data.type) {
			errors.type = 'Project type is required';
			errors.hasErrors = true;
		}
		if (data.members.length == 0) {
			errors.members = 'Projects must have at least one member';
			errors.hasErrors = true;
		}

		if (!errors.hasErrors) {
			$.ajax({
				type: "POST",
				url: this.props.url,
				data: JSON.stringify(data),
				success: function(data) {
					console.log(data);
				},
				failure: function(err) {
					console.log(err);
				},
				dataType: 'json',
				contentType: 'application/json',
			});
		}
		this.setState({ formErrors: errors })
	},
	handleTags: function(tags) {
		this.setState({ tags: tags });
	},
	handleMembers: function(members) {
		this.setState({ 
			members: members
		});
	},
	render: function() {
		var errors = this.state.formErrors;
		return (
			<form className="projectForm" onSubmit={this.handleSubmit}>
				<div className="row">
					{ errors.name }
					<ProjectInput name="name" displayName="Project Name" />
					{ errors.description }
					<div>
						<span className="input-field">Description</span>
						<textarea className="input-container" name="description" />
					</div>
					<ProjectInput name="website" displayName="Website" />
					<ProjectInput name="fbPage" displayName="Facebook Page" />
					{ errors.type }
					<div>
						<span className="input-field">Type</span>
						<select required className="input-container" name="type">
							<option value="startup">Startup</option>
							<option value="project">Project</option>
							<option value="idea">Idea</option>
						</select>
					</div>
					<div>
						<span className="input-field">Hiring</span>
						<input className="input-container" type="checkbox" name="hiring" />
					</div>

					<TagInput update={this.handleTags.bind(this)} />
					{ errors.members }
					<MemberInput update={this.handleMembers.bind(this)} url="/api/users" />
					<button type="submit" className="btn btn-primary">Submit</button>
				</div>
			</form>
		);
	}
});

var ProjectInput = React.createClass({
	render: function() {
		return (
			<div>
				<span className="input-field">{this.props.displayName}</span>
				<input className="input-container" type="text" name={this.props.name} />
			</div>
		)
	}
})

var TagInput = React.createClass({
	getInitialState: function() {
		return { tagNames: [] };
	},
	addTag: function(event) {
		var key = event.keyCode;
		var input = event.target.value;
		var tagNames = this.state.tagNames;
		if (input.match(/^\s*\w+ $/)) {
			input = input.trim()
			var newTags = React.addons.update(tagNames, {
				$push: [input.substr(0, input.length)]
			});
			this.setState({
				tagNames: newTags
			});
			this.props.update(newTags);
			$('#inputTags').val('');
		}
	},
	tagAction: function() {
		var key = event.keyCode;
		var input = event.target.value;
		var tagNames = this.state.tagNames;
		if ((key == 8 || key == 46) && event.target.value === '') {
			// Deletes the last element
			var newTags = tagNames.filter(function(el, index) {
				return index !== tagNames.length - 1;
			});
			this.setState({
				tagNames: newTags
			});
			this.props.update(newTags)
			$('#inputTags').val('');
		} else if (key == 13) {
			event.preventDefault();
			if (!input.match(/^\s*$/)) {
				input = input.trim()
				var newTags =  React.addons.update(tagNames, {
					$push: [input.substr(0, input.length)]
				});
				this.setState({
					tagNames: newTags
				});
				this.props.update(newTags);
				$('#inputTags').val('');
			}
		}
	},
	render: function(){
		var tagNodes = this.state.tagNames.map(function(tag) {
			return (<span className="tag">{tag}</span>);
		});
		return(
			<div>
				<span className="input-field">Tags</span>
				<div className="input-container" id="tagInput">
					<span>{tagNodes}</span>
					<input id="inputTags" onKeyUp={this.addTag} onKeyDown={this.tagAction} type="text"/>
				</div>
			</div>
		);
	}
});

var MemberInput = React.createClass( {
	getInitialState: function() {
		return { users: [], selectedUsers: [] };
	},
	selectUser: function(user) {
		var selectedUsers = this.state.selectedUsers;
		var wasSelected = selectedUsers.filter(function(selected) {
			return selected._id == user._id;
		}).length == 1;

		if (!wasSelected) {
			var newMembers = React.addons.update(selectedUsers, {
				$push: [user]
			})
			this.setState({
				selectedUsers: newMembers
			});
			this.props.update(newMembers.map(function(user) {
				return { user: user._id, role: 'None' };
			}));
		}

		$("#memberInput").popover('hide');
		$("#memberInput").val('');
	},
	addMember: function(event) {
		var filter = event.target.value.toLowerCase();
		var users = this.state.users;
		var selectUser = this.selectUser;
		var memberNodes = users
			.filter(function(user) {
				var name = user.fname + " " + user.lname;
				return !filter || user.fname.toLowerCase().indexOf(filter) == 0 ||
				user.lname.toLowerCase().indexOf(filter) == 0 || name.toLowerCase().indexOf(filter) == 0;
			})
			.map(function(user, index) {
				var className = "list-group-item" + (index == 0 ? " active" : "");
				return (
					<a onClick={selectUser.bind(this, user)}>
						<li className={className}>
							<img src={user.picture} width="35"/>
							<span className="name">{user.fname} {user.lname}</span>
						</li>
					</a>
				);
			}.bind(this)).slice(0, 5);

		if (!$("#popover").length && filter) {
			$("#memberInput").popover('show');
		} else if (!filter || memberNodes.length == 0) {
			$("#memberInput").popover('hide');
		}

		if (filter) React.render(
			<ul className="list-group">{memberNodes}</ul>,
			document.getElementById('popover')
		);
	},
	memberAction: function(event) {
		var key = event.keyCode || event.charCode;
		var selectedUsers = this.state.selectedUsers;
		// Delete user from selected users if pressed 'backspace'
		if((key == 8 || key == 46) && event.target.value === '') {
			var newMembers = selectedUsers.filter(function(el, index) {
				return index !== selectedUsers.length - 1;
			})
			this.setState({
				selectedUsers: newMembers
			});
			this.props.update(newMembers);
		} else if (key == 13) { // Select first user if pressed 'enter'
			event.preventDefault();
			$("#popover a").get(0).click();
			return false;
		}
	},
	componentDidMount: function() {
		$("#memberInput").popover({
			html: true,
			content: '<div id="popover"></div>',
			placement: 'bottom',
			trigger: 'manual',
		});
    	$.get(this.props.url, function(data) {
        	this.setState({
        		users: data.users
        	});
        }.bind(this));
    },
    render: function() {
		return (
			<div>
				<span className="input-field">Members</span>
				<div className="input-container">
					<SelectedUsers users={this.state.selectedUsers}></SelectedUsers>
					<input id="memberInput" autoComplete="off" onKeyUp={this.addMember} onKeyDown={this.memberAction} type="text"/>
				</div>
			</div>
		);
    }
})

var SelectedUsers = React.createClass({
	render: function() {
		var userNodes = this.props.users.map(function(user) {
			return (<span className="selectedUser">{user.fname}</span>)
		});
		return(<span>{userNodes}</span>);
	}
})

React.render(
    <ProjectForm url="/api/project" />,
    document.getElementById('create-form')
);