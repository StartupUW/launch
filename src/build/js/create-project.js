var ProjectForm = React.createClass({displayName: "ProjectForm",
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
		var required = (React.createElement("span", {className: "required"}, "required"));
		return (
			React.createElement("form", {id: "project-form", onSubmit: this.handleSubmit}, 
				React.createElement("div", {className: "row"}, 
					React.createElement(ProjectInput, {name: "name", required: required, displayName: "Project Name"}), 
					React.createElement("p", {className: "formError"},  errors.name), 
					React.createElement("div", null, 
						React.createElement("span", {className: "input-field"}, 
							"Description", 
							required
						), 
						React.createElement("textarea", {className: "input-container", name: "description"})
					), 
					React.createElement("p", {className: "formError"},  errors.description), 
					React.createElement(MemberInput, {update: this.handleMembers.bind(this), required: required, url: "/api/users"}), 
					React.createElement("p", {className: "formError"},  errors.members), 
					React.createElement("div", null, 
						React.createElement("span", {className: "input-field"}, "Logo", required), 
						React.createElement("input", {className: "input-container", type: "file", name: "logo"})
					), 
					React.createElement("p", {className: "formError"},  errors.logo), 
					React.createElement(ProjectInput, {name: "website", displayName: "Website URL"}), 
					React.createElement(ProjectInput, {name: "fbPage", displayName: "Facebook Page URL"}), 
					React.createElement(ProjectInput, {name: "demo", displayName: "Youtube Embed URL"}), 
					React.createElement("div", null, 
						React.createElement("span", {className: "input-field"}, "Type"), 
						React.createElement("select", {required: true, className: "input-container", name: "type"}, 
							React.createElement("option", {value: "startup"}, "Startup"), 
							React.createElement("option", {value: "project"}, "Project"), 
							React.createElement("option", {value: "idea"}, "Idea")
						)
					), 
					React.createElement("p", {className: "formError"},  errors.type), 
					React.createElement("div", null, 
						React.createElement("span", {className: "input-field"}, "Hiring"), 
						React.createElement("input", {className: "input-container", type: "checkbox", name: "hiring"})
					), 
					React.createElement(TagInput, {update: this.handleTags.bind(this)}), 
					React.createElement("button", {type: "submit", className: "btn btn-primary"}, "Submit")
				)
			)
		);
	}
});

var ProjectInput = React.createClass({displayName: "ProjectInput",
	render: function() {
		return (
			React.createElement("div", null, 
				React.createElement("span", {className: "input-field"}, 
					this.props.displayName, 
					this.props.required
				), 
				React.createElement("input", {className: "input-container", type: "text", name: this.props.name})
			)
		)
	}
})

var TagInput = React.createClass({displayName: "TagInput",
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
			return (React.createElement("span", {className: "tag"}, tag));
		});
		return(
			React.createElement("div", null, 
				React.createElement("span", {className: "input-field"}, 
					"Tags", 
					React.createElement("span", {className: "required"}, "Separate with spaces")
				), 
				React.createElement("div", {className: "input-container", onClick: this.focus}, 
					React.createElement("span", null, tagNodes), 
					React.createElement("input", {id: "inputTags", onKeyUp: this.addTag, onKeyDown: this.tagAction, type: "text"})
				)
			)
		);
	}
});

var MemberInput = React.createClass( {displayName: "MemberInput",
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
					React.createElement("a", {onClick: selectUser.bind(this, user)}, 
						React.createElement("li", {className: className}, 
							React.createElement("img", {src: user.picture, width: "35"}), 
							React.createElement("span", {className: "name"}, user.fname, " ", user.lname)
						)
					)
				);
			}.bind(this)).slice(0, 5);

		if (memberNodes.length == 0) {
			memberNodes = (
				React.createElement("li", {className: "list-group-item"}, 
					React.createElement("img", {src: "/img/default-profile.png", width: "35"}), 
					React.createElement("span", {className: "name"}, "User not found.")
				)
			);
		}

		if (!$("#popover-content").length && filter) {
			$("#memberInput").popover('show');
		} else if (!filter || memberNodes.length == 0) {
			$("#memberInput").popover('hide');
			this.setState({ selectIndex: 0 })
		}

		if (filter) React.render(
			React.createElement("ul", {className: "list-group"}, memberNodes),
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
			React.createElement("div", null, 
				React.createElement("span", {className: "input-field"}, 
					"Members", 
					this.props.required
				), 
				React.createElement("div", {className: "input-container", onClick: this.focus}, 
					React.createElement(SelectedUsers, {users: this.state.selectedUsers}), 
					React.createElement("input", {id: "memberInput", autoComplete: "off", onKeyUp: this.addMember, onKeyDown: this.memberAction, type: "text"})
				)
			)
		);
    }
})

var SelectedUsers = React.createClass({displayName: "SelectedUsers",
	render: function() {
		var userNodes = this.props.users.map(function(user) {
			return (React.createElement("span", {className: "tag"}, user.fname))
		});
		return(React.createElement("span", {id: "selectedUsers"}, userNodes));
	}
})

React.render(
    React.createElement(ProjectForm, {url: "/api/project"}),
    document.getElementById('create-form')
);