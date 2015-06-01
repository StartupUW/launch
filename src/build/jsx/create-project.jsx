var ProjectForm = React.createClass({
	getInitialState: function() {
		return ({ tags: [], members: [], formErrors: {}});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var data = new FormData();
		var IMG_MIMES = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/bmp', 'image/svg+xml', 'image/tiff'];
		var MAX_SIZE = 2000000;
		form = $('#project-form')[0];
		errors = {};

		$('#create-form :input').each(function() {
			if (this.type == "file") {
				if (!form.logo.files[0]) {
					errors.logo = 'You must include a logo';
					errors.hasErrors = true;
				} else {
					var file = form.logo.files[0];
					if (IMG_MIMES.indexOf(file.type) == -1) {
						errors.logo = 'Not a valid image type: ' + file.type;
						errors.hasErrors = true;
					} else if (file.size > 2000000) {
						errors.logo = 'Max file size: 2MB';
						errors.hasErrors = true;
					} else {
						data.append(this.name, file);
					}
				}
			} else if (this.type == "checkbox") {
				data.append(this.name, this.checked)
			} else if (this.value && this.name) {
				data.append(this.name, this.value)
			}
		})

		data.append('tags', JSON.stringify(this.state.tags));
		data.append('members', JSON.stringify(this.state.members));

		if (!form.name.value) {
			errors.name = 'Project name is required';
			errors.hasErrors = true;
		}
		if (!form.description.value) {
			errors.description = 'Project description is required';
			errors.hasErrors = true;
		}
		if (!form.type.value) {
			errors.type = 'Project type is required';
			errors.hasErrors = true;
		}
		if (this.state.members.length == 0) {
			errors.members = 'Projects must have at least one member';
			errors.hasErrors = true;
		}

		if (!errors.hasErrors) {
			$.ajax({
				type: "POST",
				url: this.props.url,
				data: data,
				processData: false,
				contentType: false,
				success: function(data) {
					console.log(data.success);
					$("#create-success").modal('show');
				},
				failure: function(xhr, err) {
					console.log(err);
				},
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
		var required = (<span className="required">required</span>);
		return (
			<form id="project-form" onSubmit={this.handleSubmit}>
				<div className="row">
					<ProjectInput name="name" required={required} displayName="Project Name" />
					<p className="formError">{ errors.name }</p>
					<div>
						<span className="input-field">
							Description
							{required}
						</span>
						<textarea className="input-container" name="description" />
					</div>
					<p className="formError">{ errors.description }</p>
					<MemberInput update={this.handleMembers.bind(this)} required={required} url="/api/users" />
					<p className="formError">{ errors.members }</p>
					<div>
						<span className="input-field">Logo{required}</span>
						<input className="input-container" type="file" name="logo" />
					</div>
					<p className="formError">{ errors.logo }</p>
					<ProjectInput name="website" displayName="Website URL" />
					<ProjectInput name="fbPage" displayName="Facebook Page URL" />
					<ProjectInput name="demo" displayName="Youtube Embed URL" />
					<div>
						<span className="input-field">Type</span>
						<select required className="input-container" name="type">
							<option value="startup">Startup</option>
							<option value="project">Project</option>
							<option value="idea">Idea</option>
						</select>
					</div>
					<p className="formError">{ errors.type }</p>
					<div>
						<span className="input-field">Hiring</span>
						<input className="input-container" type="checkbox" name="hiring" />
					</div>
					<TagInput update={this.handleTags.bind(this)} />
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
				<span className="input-field">
					{this.props.displayName}
					{this.props.required}
				</span>
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
	focus: function() {
		$("#inputTags").focus();
	},
	render: function(){
		var tagNodes = this.state.tagNames.map(function(tag) {
			return (<span className="tag">{tag}</span>);
		});
		return(
			<div>
				<span className="input-field">
					Tags
					<span className="required">Separate with spaces</span>
				</span>
				<div className="input-container" onClick={this.focus}>
					<span>{tagNodes}</span>
					<input id="inputTags" onKeyUp={this.addTag} onKeyDown={this.tagAction} type="text"/>
				</div>
			</div>
		);
	}
});

var MemberInput = React.createClass( {
	getInitialState: function() {
		return { users: [], selectedUsers: [], selectIndex: 0 };
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
				return { user: user._id };
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
				var className = "list-group-item" + (index == this.state.selectIndex ? " active" : "");
				return (
					<a onClick={selectUser.bind(this, user)}>
						<li className={className}>
							<img src={user.picture} width="35"/>
							<span className="name">{user.fname} {user.lname}</span>
						</li>
					</a>
				);
			}.bind(this)).slice(0, 5);

		if (memberNodes.length == 0) {
			memberNodes = (
				<li className="list-group-item">
					<img src="/img/default-profile.png" width="35"/>
					<span className="name">User not found.</span>
				</li>
			);
		}

		if (!$("#popover-content").length && filter) {
			$("#memberInput").popover('show');
		} else if (!filter || memberNodes.length == 0) {
			$("#memberInput").popover('hide');
			this.setState({ selectIndex: 0 })
		}

		if (filter) React.render(
			<ul className="list-group">{memberNodes}</ul>,
			document.getElementById('popover-content')
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
			$("#popover-content a").get(this.state.selectIndex).click();
			return false;
		} else if (key == 38 || key == 40) {
			var newIndex = this.state.selectIndex + (key == 38 ? -1: 1);
			if (newIndex >= 0 && newIndex < $("#popover-content a").length) {
				this.setState({ selectIndex: newIndex })
			}
		}
	},
	componentDidMount: function() {
		$("#memberInput").popover({
			html: true,
			content: '<div id="popover-content"></div>',
			placement: 'bottom',
			trigger: 'manual',
			viewport: '#selectedUsers'
		});
    	$.get(this.props.url, function(data) {
        	this.setState({
        		users: data.users,
        		selectedUsers: [data.user]
        	});
        	this.props.update([{ user: data.user._id }])
        }.bind(this));
    },
    focus: function() {
    	$("#memberInput").focus();
    },
    render: function() {
		return (
			<div>
				<span className="input-field">
					Members
					{this.props.required}
				</span>
				<div className="input-container" onClick={this.focus}>
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
			return (<span className="tag">{user.fname}</span>)
		});
		return(<span id="selectedUsers">{userNodes}</span>);
	}
})

React.render(
    <ProjectForm url="/api/project" />,
    document.getElementById('create-form')
);